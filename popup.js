const statusEl = document.getElementById("statusEl");

document.getElementById("markRead").addEventListener("click", async () => {
  const { apiKey, apiBase } = await browser.storage.local.get(["apiKey", "apiBase"]);

  if (!apiKey || !apiBase) {
    statusEl.textContent = "Set your API key and base URL in Preferences first.";
    return;
  }

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  try {
    const res = await fetch(`${apiBase}/reads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: tab.url }),
    });

    if (res.status === 201) statusEl.textContent = "Marked as read!";
    else if (res.status === 204) statusEl.textContent = "Removed from reads.";
    else statusEl.textContent = `Error: ${res.status}`;
  } catch {
    statusEl.textContent = "Request failed.";
  }
});
