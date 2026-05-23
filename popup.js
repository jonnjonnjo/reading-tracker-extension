const statusEl = document.getElementById("statusEl");
const notesEl = document.getElementById("notes");
const btn = document.getElementById("markRead");

const draftKey = (url) => `draft:${url}`;

let currentTab = null;
let isRead = false;

function setReadState(exists) {
  isRead = exists;
  btn.textContent = exists ? "Remove from reads" : "Mark as read";
}

async function loadTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  document.getElementById("page-title").textContent = tab.title || tab.url;

  const result = await browser.storage.local.get(draftKey(tab.url));
  notesEl.value = result[draftKey(tab.url)] || "";

  const { apiKey, apiBase } = await browser.storage.local.get(["apiKey", "apiBase"]);
  if (!apiKey || !apiBase) {
    statusEl.textContent = "Open Preferences to configure your API.";
    return;
  }

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
        setReadState(true);
      }
    }
  } catch {
    // silently fail
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
    statusEl.textContent = "Open Preferences to configure your API.";
    return;
  }

  btn.disabled = true;
  statusEl.textContent = "";

  const wasRead = isRead;
  setReadState(!isRead);

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
      browser.action.setBadgeText({ text: "✓", tabId: currentTab.id });
      browser.action.setBadgeBackgroundColor({ color: "#4caf50", tabId: currentTab.id });
    } else if (res.status === 204) {
      statusEl.textContent = "Removed from reads.";
      notesEl.value = "";
      browser.storage.local.remove(draftKey(currentTab.url));
      browser.action.setBadgeText({ text: "", tabId: currentTab.id });
    } else {
      statusEl.textContent = `Error: ${res.status}`;
      setReadState(wasRead);
    }
  } catch {
    statusEl.textContent = "Request failed.";
    setReadState(wasRead);
  } finally {
    btn.disabled = false;
  }
});
