const apiKeyInput = document.getElementById("apiKey");
const apiBaseInput = document.getElementById("apiBase");
const statusEl = document.getElementById("statusEl");

browser.storage.local.get(["apiKey", "apiBase"]).then(({ apiKey, apiBase }) => {
  if (apiKey) apiKeyInput.value = apiKey;
  if (apiBase) apiBaseInput.value = apiBase;
});

document.getElementById("save").addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const apiBase = apiBaseInput.value.trim();
  await browser.storage.local.set({ apiKey, apiBase });
  statusEl.textContent = "Saved!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});
