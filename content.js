browser.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "read-status") return;
  showToast(msg.isRead, msg.date);
});

function showToast(isRead, date) {
  document.getElementById("__rt-wrap__")?.remove();

  const wrap = document.createElement("div");
  wrap.id = "__rt-wrap__";

  const toast = createToast(isRead, date, () => dismissToast(wrap));
  wrap.appendChild(toast);
  document.body.appendChild(wrap);

  let timer = setTimeout(() => dismissToast(wrap), 3500);

  function dismissToast(wrap) {
    clearTimeout(timer);
    toast.classList.add("dismissing");
    setTimeout(() => wrap.remove(), 350);
  }
}

function createToast(isRead, date, onDismiss) {
  const toast = document.createElement("div");
  toast.id = "__rt-toast__";

  if (isRead) {
    toast.style.cssText = "background:#1b3d20;color:#7ddf7d;border:2px solid #4caf50;";
    toast.innerHTML = `<span style="font-size:22px">✅</span><span>Already read &mdash; <span style="font-weight:400;font-size:15px">${date}</span></span>`;
  } else {
    const time = estimateReadingTime();
    toast.style.cssText = "background:#3a1515;color:#ff8080;border:2px solid #e05555;";
    toast.innerHTML = time
      ? `<span style="font-size:22px">📖</span><span>~${time} min read</span>`
      : `<span style="font-size:22px">📖</span><span>Haven't read this yet</span>`;
  }

  const closeBtn = document.createElement("button");
  closeBtn.id = "__rt-close__";
  closeBtn.textContent = "✕";
  closeBtn.onclick = onDismiss;
  toast.appendChild(closeBtn);

  return toast;
}

function estimateReadingTime() {
  const article = document.querySelector("article");
  const main = document.querySelector("main");
  const container = article || main || document.body;
  const clone = container.cloneNode(true);
  for (const el of clone.querySelectorAll("script, style, nav, footer, header, .sidebar, .comments, noscript, [role=navigation], [role=banner], [role=contentinfo]")) {
    el.remove();
  }
  const words = (clone.textContent || "").trim().split(/\s+/).length;
  if (words < 20) return null;
  return Math.max(1, Math.round(words / 238));
}
