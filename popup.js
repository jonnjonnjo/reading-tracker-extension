const statusEl = document.getElementById("statusEl");

document.getElementById("markRead").addEventListener("click", async () => {
  const { apiKey, apiBase } = await browser.storage.local.get(["apiKey", "apiBase"]);

  if (!apiKey || !apiBase) {
    statusEl.textContent = "Set your API key and base URL in Preferences first.";
    return;
  }

  try {
    const res = await fetch(`${apiBase}/reads`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    statusEl.textContent = res.ok ? "Marked as read!" : `Error: ${res.statusEl}`;
  } catch {
    statusEl.textContent = "Request failed.";
  }
});
