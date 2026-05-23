const apiKeyInput = document.getElementById("apiKey");
const apiBaseInput = document.getElementById("apiBase");
const allowedDomainsInput = document.getElementById("allowedDomains");
const statusEl = document.getElementById("statusEl");

browser.storage.local
  .get(["apiKey", "apiBase", "allowedDomains"])
  .then(({ apiKey, apiBase, allowedDomains }) => {
    if (apiKey) apiKeyInput.value = apiKey;
    if (apiBase) apiBaseInput.value = apiBase;
    if (allowedDomains) allowedDomainsInput.value = allowedDomains;
  });

document.getElementById("save").addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const apiBase = apiBaseInput.value.trim();
  const allowedDomains = allowedDomainsInput.value.trim();
  await browser.storage.local.set({ apiKey, apiBase, allowedDomains });
  statusEl.textContent = "Saved!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
});
