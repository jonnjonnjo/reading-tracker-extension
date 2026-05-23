const tabCache = new Map();

async function checkTab(tabId, url) {
  if (!url || !url.startsWith("http")) {
    browser.action.disable(tabId);
    return;
  }

  tabCache.set(tabId, url);

  const { apiKey, apiBase, allowedDomains } = await browser.storage.local.get([
    "apiKey",
    "apiBase",
    "allowedDomains",
  ]);

  const domains = (allowedDomains || "")
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  if (domains.length > 0) {
    const hostname = new URL(url).hostname;
    if (!domains.includes(hostname)) {
      browser.action.disable(tabId);
      browser.action.setBadgeText({ text: "", tabId });
      return;
    }
  }

  browser.action.enable(tabId);

  if (!apiKey || !apiBase) return;

  try {
    const res = await fetch(
      `${apiBase}/reads/check?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (res.ok) {
      const data = await res.json();
      browser.action.setBadgeText({ text: data.exists ? "✓" : "", tabId });
      if (data.exists)
        browser.action.setBadgeBackgroundColor({ color: "#4caf50", tabId });
    }
  } catch {
    browser.action.setBadgeText({ text: "", tabId });
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    tabCache.delete(tabId);
    checkTab(tabId, tab.url);
  }
});

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await browser.tabs.get(tabId);
  if (tabCache.get(tabId) === tab.url) return;
  checkTab(tabId, tab.url);
});

browser.tabs.onRemoved.addListener((tabId) => tabCache.delete(tabId));

browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local") return;
  if (!("apiKey" in changes) && !("apiBase" in changes) && !("allowedDomains" in changes)) return;
  tabCache.clear();
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (tab.url) checkTab(tab.id, tab.url);
  }
});
