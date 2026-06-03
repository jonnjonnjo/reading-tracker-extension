const tabCache = new Map();
const manualReads = new Set();

async function checkTab(tabId, url, showNotification = false) {
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
    if (domains.includes(hostname)) {
      browser.action.enable(tabId);

      if (!apiKey || !apiBase) return;

      try {
        const res = await fetch(
          `${apiBase}/reads/check?url=${encodeURIComponent(url)}`,
          { headers: { Authorization: `Bearer ${apiKey}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            browser.action.setBadgeText({ text: "✓", tabId });
            browser.action.setBadgeBackgroundColor({ color: "#4caf50", tabId });
          } else {
            browser.action.setBadgeText({ text: "○", tabId });
            browser.action.setBadgeBackgroundColor({ color: "#9e9e9e", tabId });
          }

          if (showNotification) {
            const date = data.exists ? new Date(data.read.createdAt).toLocaleDateString() : null;
            browser.tabs.sendMessage(tabId, { type: "read-status", isRead: data.exists, date }).catch(() => { });
          }
        }
      } catch {
        browser.action.setBadgeText({ text: "", tabId });
      }
      return;
    }
  }

  browser.action.enable(tabId);
  if (manualReads.has(url)) {
    browser.action.setBadgeText({ text: "✓", tabId });
    browser.action.setBadgeBackgroundColor({ color: "#4caf50", tabId });
  } else {
    browser.action.setBadgeText({ text: "", tabId });
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    tabCache.delete(tabId);
    checkTab(tabId, tab.url, true);
  }
});

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await browser.tabs.get(tabId);
  if (tabCache.get(tabId) === tab.url) return;
  checkTab(tabId, tab.url);
});

browser.tabs.onRemoved.addListener((tabId) => tabCache.delete(tabId));

browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "manual-read") {
    if (message.isRead) manualReads.add(message.url);
    else manualReads.delete(message.url);
  }
});

browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local") return;
  if (!("apiKey" in changes) && !("apiBase" in changes) && !("allowedDomains" in changes)) return;
  tabCache.clear();
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (tab.url) checkTab(tab.id, tab.url);
  }
});
