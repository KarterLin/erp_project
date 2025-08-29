// API endpoint
const API_BASE = "https://127.0.0.1:8443/api/v1/auth";

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

