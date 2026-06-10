const tabCache = new Map();
const manualReads = new Set();

function setBadge(tabId, text, color) {
  browser.action.setBadgeText({ text, tabId });
  browser.action.setBadgeBackgroundColor({ color, tabId });
}

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

  const hostname = new URL(url).hostname;
  const domains = (allowedDomains || "")
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  const isAllowed = domains.length === 0 || domains.includes(hostname);
  browser.action.enable(tabId);

  if (!isAllowed) {
    if (manualReads.has(url)) {
      setBadge(tabId, "✓", "#4caf50");
    } else {
      setBadge(tabId, "", "#9e9e9e");
    }
    return;
  }

  if (!apiKey || !apiBase) return;

  try {
    const res = await fetch(
      `${apiBase}/reads/check?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (res.ok) {
      const data = await res.json();
      setBadge(tabId, data.exists ? "✓" : "○", data.exists ? "#4caf50" : "#9e9e9e");

      if (showNotification) {
        const date = data.exists ? new Date(data.read.createdAt).toLocaleDateString() : null;
        browser.tabs.sendMessage(tabId, { type: "read-status", isRead: data.exists, date }).catch(() => { });
      }
    }
  } catch {
    setBadge(tabId, "", "");
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
