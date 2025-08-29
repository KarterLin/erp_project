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
const API_URL = "https://127.0.0.1:8443/api";

async function loadUser() {
  try {
    const meRes = await fetch(`${API_URL}/me`, { credentials: "include" });
    if (meRes.status === 401) {
      // cookie 過期或未登入 → 直接跳轉
      window.location.href = "login.html";
      return;
    }

    if (!meRes.ok) throw new Error("取得登入者資訊失敗");

    const meResult = await meRes.json();
    console.log(meResult);
    const account = meResult.data.account;
    const userAccountEl = document.getElementById("userAccount");
    if (userAccountEl) {
      userAccountEl.textContent = account;
    }

  } catch (err) {
    console.error("Error loading user detail:", err);
    alert("載入使用者失敗");
  }

}
