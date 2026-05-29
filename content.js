browser.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "read-status") return;
  showToast(msg.isRead, msg.date);
});

function showToast(isRead, date) {
  document.getElementById("__rt-wrap__")?.remove();
  document.getElementById("__rt-style__")?.remove();

  const style = document.createElement("style");
  style.id = "__rt-style__";
  style.textContent = `
    @keyframes __rt-drop__ {
      from { opacity: 0; transform: translateY(-16px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)     scale(1);    }
    }
    @keyframes __rt-drop-out__ {
      from { opacity: 1; transform: translateY(0)      scale(1);    }
      to   { opacity: 0; transform: translateY(-16px)  scale(0.96); }
    }
    #__rt-wrap__ {
      all: unset;
      position: fixed !important;
      top: 28px !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 2147483647 !important;
      display: flex !important;
      justify-content: center !important;
      pointer-events: none !important;
    }
    #__rt-toast__ {
      all: unset;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 28px;
      border-radius: 14px;
      font-family: system-ui, -apple-system, sans-serif !important;
      font-size: 17px !important;
      font-weight: 700 !important;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6) !important;
      animation: __rt-drop__ 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      white-space: nowrap;
      line-height: 1;
    }
    #__rt-toast__.dismissing {
      animation: __rt-drop-out__ 0.35s ease-in forwards;
    }
    #__rt-close__ {
      all: unset;
      cursor: pointer;
      margin-left: 8px;
      opacity: 0.6;
      font-size: 18px;
      line-height: 1;
    }
    #__rt-close__:hover { opacity: 1; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.id = "__rt-wrap__";

  const toast = document.createElement("div");
  toast.id = "__rt-toast__";

  if (isRead) {
    toast.style.cssText = "background:#1b3d20;color:#7ddf7d;border:2px solid #4caf50;";
    toast.innerHTML = `<span style="font-size:22px">✅</span><span>Already read &mdash; <span style="font-weight:400;font-size:15px">${date}</span></span>`;
  } else {
    toast.style.cssText = "background:#3a1515;color:#ff8080;border:2px solid #e05555;";
    toast.innerHTML = `<span style="font-size:22px">📖</span><span>Haven't read this yet</span>`;
  }

  const closeBtn = document.createElement("button");
  closeBtn.id = "__rt-close__";
  closeBtn.textContent = "✕";
  closeBtn.onclick = dismiss;
  toast.appendChild(closeBtn);

  wrap.appendChild(toast);
  document.body.appendChild(wrap);

  const timer = setTimeout(dismiss, 3500);

  function dismiss() {
    clearTimeout(timer);
    toast.classList.add("dismissing");
    setTimeout(() => { wrap.remove(); style.remove(); }, 350);
  }
}
