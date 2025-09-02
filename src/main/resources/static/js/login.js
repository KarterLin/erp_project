// API endpoint
const API_URL = "https://127.0.0.1:8443/api/v1/auth";

const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberCheckbox = document.getElementById("rememberAccount");
const taxIdInput = document.getElementById("taxId");

// 頁面載入時，從 localStorage 帶出統編 + 帳號
window.addEventListener("DOMContentLoaded", () => {
    const savedCompany = localStorage.getItem("taxId");
    const savedEmail = localStorage.getItem("email");

    if (savedCompany) taxIdInput.value = savedCompany;
    if (savedEmail) emailInput.value = savedEmail;
});

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

// 密碼遮蔽
function togglePassword(inputId, imgId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    if (input.type === "password") {
        input.type = "text";
        img.src = "./img/eye2.png";
    } else {
        input.type = "password";
        img.src = "./img/eye.png";
    }
}

// 點擊登入
loginBtn.addEventListener("click", async () => {
    const taxId = taxIdInput.value;
    const uEmail = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const result = await login(uEmail, password);
        console.log("登入成功:", result);

        // 記住帳號，存到localStorage
        if (rememberCheckbox.checked) {
            localStorage.setItem("taxId", taxId);
            localStorage.setItem("email", uEmail);
        } else {
            localStorage.removeItem("taxId");
            localStorage.removeItem("email");
        }

        if (password == "0000") {
            // 跳轉密碼變更
            let countdown = 3;
            const popup = document.createElement("div");
            popup.id = "passwordPopup";
            popup.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 20px 30px;
                    border-radius: 12px;
                    text-align: center;
                    font-size: 16px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                ">
                    系統偵測到您使用預設密碼<br>
                    <b id="countdownText">${countdown} 秒後將導向修改密碼頁面</b>
                </div>
            </div>
        `;
            document.body.appendChild(popup);

            const timer = setInterval(() => {
                countdown--;
                document.getElementById("countdownText").textContent =
                    `${countdown} 秒後將導向修改密碼頁面`;

                if (countdown <= 0) {
                    clearInterval(timer);
                    window.location.href = "setting_userpassword.html";
                }
            }, 1000);
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("🚨 呼叫 API 發生錯誤:", error);
        alert("信箱或密碼錯誤，請重新輸入");
    }
})

// 登入，並存cookie
async function login(uEmail, password) {
    const response = await fetch(`${API_URL}/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 瀏覽器存cookie
        body: JSON.stringify({ uEmail: uEmail, password: password }),
    });

    if (!response.ok) {
        throw new Error("登入失敗");
    }
    return await response.json();
}


 // 忘記密碼
 const forgotModal = document.getElementById("forgotEmailModal");
  document.getElementById("forgotPasswordLink").onclick = () => forgotModal.classList.remove("hidden");
  document.getElementById("closeForgotModalBtn").onclick = () => forgotModal.classList.add("hidden");

    document.getElementById("sendResetEmailBtn").onclick = async () => {
    const email = document.getElementById("forgotEmailInput").value;
    if (!email) {
      alert("請輸入 Email");
      return;
    }

    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message || "已寄送密碼重設信件");
    if (res.ok) {
      forgotModal.classList.add("hidden");
    }
  };

  // ==== 重設密碼 (點信件連結時開啟 modal) ====
  const resetModal = document.getElementById("resetPasswordModal");
  document.getElementById("closeResetModalBtn").onclick = () => resetModal.classList.add("hidden");

  // 如果網址有 token，自動開啟 reset modal
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) {
    resetModal.classList.remove("hidden");
  }

  document.getElementById("resetPasswordBtn").onclick = async () => {
    const newPwd = document.getElementById("newPwd").value;
    const confirmPwd = document.getElementById("confirmPwd").value;

    if (newPwd !== confirmPwd) {
      alert("兩次密碼不一致！");
      return;
    }

    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: newPwd })
    });

    const data = await res.json();
    alert(data.message || "操作完成");

    if (res.ok) {
      resetModal.classList.add("hidden");
    }
  };
