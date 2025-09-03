document.addEventListener("DOMContentLoaded", () => {
  fetch("./topnavbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("topbar-container").innerHTML = data;

      loadUser();
      startTokenRefreshTimer();
    })
    .catch(error => console.error("Topbar 載入失敗:", error));
});


// API endpoint
const API_URLBase = "https://127.0.0.1:8443/api";

async function loadUser() {
  try {
    const meRes = await fetch(`${API_URLBase}/me`, { credentials: "include" });
    if (meRes.status === 401) {
      // cookie 過期或未登入 → 直接跳轉
      window.location.href = "login.html";
      return;
    }

    if (!meRes.ok) throw new Error("取得登入者資訊失敗");

    const meResult = await meRes.json();
    console.log(meResult);
    const account = meResult.data.account;
    const userAccountEl = document.getElementById("account");
    if (userAccountEl) {
      userAccountEl.textContent = account;
    }


  } catch (err) {
    console.error("Error loading user detail:", err);
    alert("載入使用者失敗");
  }

}


// logout
document.addEventListener("click", (e) => {
  const userMenu = document.getElementById("userMenu");
  const dropdown = document.getElementById("userDropdown");

  if (userMenu.contains(e.target)) {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  } else {
    dropdown.style.display = "none"; // 點擊其他地方收起
  }
});

async function logout() {
  try {
    const res = await fetch(`${API_URLBase}/v1/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      console.log("登出成功");
      window.location.href = "login.html";
    } else {
      console.error("登出失敗:", res.status);
      alert("登出失敗");
    }
  } catch (err) {
    console.error("登出錯誤:", err);
    alert("系統錯誤，請稍後再試");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.id === "logoutBtn") {
      logout();
    }
  });
});

// idleTime
let lastActivityTime = Date.now();
const idleLimit = 15 * 60 * 1000; // 閒置上限15分鐘
const warningTime = 14 * 60 * 1000; // 14分鐘跳警告
let warningShown = false;

// 監聽使用者活動
function resetIdleTimer() {
  lastActivityTime = Date.now();
  if (warningShown) {
    hideIdleWarning();
    warningShown = false;
  }
}
["mousemove", "keydown", "click", "scroll"].forEach(evt => {
  document.addEventListener(evt, resetIdleTimer);
});

// refreshToken
let refreshTimerStarted = false;

function startTokenRefreshTimer() {
  if (refreshTimerStarted) return; // 已啟動過就跳過
  refreshTimerStarted = true;
  const checkInterval = 30 * 1000; // 每 30 秒檢查一次

  setInterval(async () => {
    const now = Date.now();
    const idleTime = now - lastActivityTime;

    if (idleTime > idleLimit) {
      logout();
      console.warn("使用者閒置超過 15 分鐘，自動登出");
      return;
    }

    if (idleTime > warningTime && !warningShown) {
      // 閒置超過14分鐘跳警告
      showIdleWarning();
      warningShown = true;
    }

    if (idleTime <= idleLimit - 60 * 1000) {
      try {
        const res = await fetch(`${API_URLBase}/v1/auth/refresh-token-cookie`, {
          method: "POST",
          credentials: "include"
        });

        if (res.ok) {
          console.log("accessToken已刷新");
        } else {
          console.warn("無法刷新，accessToken可能已過期");
          // refreshToken 失效，跳轉登入頁
          if (res.status === 401) {
            logout();
          }
        }
      } catch (err) {
        console.error("刷新 accessToken 發生錯誤:", err);
      }
    }
  }, checkInterval);
}

// 顯示警告視窗
function showIdleWarning() {
  let warningEl = document.getElementById("idleWarning");
  if (!warningEl) {
    warningEl = document.createElement("div");
    warningEl.id = "idleWarning";
    warningEl.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        font-size: 14px;
        z-index: 9999;">
        您已閒置，將在 <b>1 分鐘</b> 後自動登出。<br>
        請移動滑鼠或按鍵以保持登入。
      </div>
    `;
    document.body.appendChild(warningEl);
  }
}
// 隱藏警告視窗
function hideIdleWarning() {
  const warningEl = document.getElementById("idleWarning");
  if (warningEl) {
    warningEl.remove();
  }
}
