const apiKeyInput = document.getElementById("apiKey");
const apiBaseInput = document.getElementById("apiBase");
const status = document.getElementById("status");

browser.storage.local.get(["apiKey", "apiBase"]).then(({ apiKey, apiBase }) => {
  if (apiKey) apiKeyInput.value = apiKey;
  if (apiBase) apiBaseInput.value = apiBase;
});

document.getElementById("save").addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const apiBase = apiBaseInput.value.trim();
  await browser.storage.local.set({ apiKey, apiBase });
  status.textContent = "Saved!";
  setTimeout(() => (status.textContent = ""), 2000);
});
