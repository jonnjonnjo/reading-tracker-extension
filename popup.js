const statusEl = document.getElementById("statusEl");
const notesEl = document.getElementById("notes");
const btn = document.getElementById("markRead");

const draftKey = (url) => `draft:${url}`;

let currentTab = null;

async function loadTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  document.getElementById("page-title").textContent = tab.title || tab.url;

  const result = await browser.storage.local.get(draftKey(tab.url));
  notesEl.value = result[draftKey(tab.url)] || "";

  const { apiKey, apiBase } = await browser.storage.local.get(["apiKey", "apiBase"]);
  if (apiKey && apiBase) {
    try {
      const res = await fetch(
        `${apiBase}/reads/check?url=${encodeURIComponent(tab.url)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          const date = new Date(data.read.createdAt).toLocaleDateString();
          statusEl.textContent = `Already read on ${date}`;
        }
      }
    } catch {
      // silently fail
    }
  }
}

loadTab();

browser.tabs.onActivated.addListener(() => window.close());

notesEl.addEventListener("input", () => {
  if (!currentTab) return;
  browser.storage.local.set({ [draftKey(currentTab.url)]: notesEl.value });
});

notesEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    btn.click();
  }
});

btn.addEventListener("click", async () => {
  const { apiKey, apiBase } = await browser.storage.local.get(["apiKey", "apiBase"]);

  if (!apiKey || !apiBase) {
    statusEl.textContent = "Set your API key and base URL in Preferences first.";
    return;
  }

  btn.disabled = true;
  statusEl.textContent = "";

  try {
    const res = await fetch(`${apiBase}/reads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: currentTab.url, notes: notesEl.value.trim() || undefined }),
    });

    if (res.status === 201) {
      statusEl.textContent = "Marked as read!";
      notesEl.value = "";
      browser.storage.local.remove(draftKey(currentTab.url));
    } else if (res.status === 204) {
      statusEl.textContent = "Removed from reads.";
      notesEl.value = "";
      browser.storage.local.remove(draftKey(currentTab.url));
    } else {
      statusEl.textContent = `Error: ${res.status}`;
    }
  } catch {
    statusEl.textContent = "Request failed.";
  } finally {
    btn.disabled = false;
  }
});
