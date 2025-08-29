document.addEventListener("DOMContentLoaded", () => {
  fetch("./topnavbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("topbar-container").innerHTML = data;

      loadUser();
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