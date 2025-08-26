// API endpoint
const API_BASE = "http://localhost:8080/api/v1/auth";

const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// 啟用登入按鈕
function checkInputs() {
  if (emailInput.value.trim() && passwordInput.value.trim()) {
    loginBtn.disabled = false;
  } else {
    loginBtn.disabled = true;
  }
}
emailInput.addEventListener("input", checkInputs);
passwordInput.addEventListener("input", checkInputs);

// 點擊登入
loginBtn.addEventListener("click", async () => {
    const uEmail = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const result = await login(uEmail, password);
        console.log("✅ 登入成功:", result);
        window.location.href = "index.html";
    } catch (error) {
        console.error("🚨 呼叫 API 發生錯誤:", error);
        alert("信箱或密碼錯誤，請重新輸入");
    }
})

// 登入，並存cookie
async function login(uEmail, password) {
    const response = await fetch(`${API_BASE}/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 瀏覽器存cookie
        body: JSON.stringify({ uEmail, password }),
    });

    if (!response.ok) {
        throw new Error("登入失敗");
    }
    return await response.json(); // AuthenticationResponse
}

// 更新access token
async function refreshAccessToken() {
    const response = await fetch(`${API_BASE}/refresh-token-cookie`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("刷新 token 失敗");
    }
    return true; // accessToken 已經更新在 cookie 裡
}

// 登出 (清掉 cookie)
async function logout() {
    const response = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("登出失敗");
    }
    return true;
}