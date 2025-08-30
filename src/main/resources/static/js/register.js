// API endpoint
const API_URL = "https://localhost:8080/api/register";


// Cloudflare Turnstile
let captchaToken = null;
window.onCaptchaSuccess = function (token) {
  captchaToken = token;
  submitBtn.disabled = false;
};

// 逾期重新驗證
window.onCaptchaExpired = function () {
  captchaToken = null;
  submitBtn.disabled = true;
};

// 發生錯誤（例如網路問題）
window.onCaptchaError = function () {
  captchaToken = null;
  submitBtn.disabled = true;
  alert("機器人驗證失敗，請重試。");
};

// 按鈕 
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;

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


submitBtn.addEventListener("click", async () => {
  if (!captchaToken) {
    alert("請先完成機器人驗證");
    return;
  }

  const registrationData = {
    cName: document.getElementById("cname").value,
    taxId: document.getElementById("taxId").value,
    rName: document.getElementById("rname").value,
    rTel: document.getElementById("rtel").value,
    uAccount: document.getElementById("account").value,
    uEmail: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: "ADMIN",
    captchaToken: captchaToken
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registrationData)
    });

    // 解析回應
    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      alert("註冊成功: " + result.message); // 註冊成功，請查收驗證信。
      console.log("註冊成功:", result);
      // 重置驗證
      if (typeof turnstile !== "undefined") turnstile.reset();
      captchaToken = null;
      submitBtn.disabled = true;
    } else {
      alert("註冊失敗: " + result.message);
      console.error("註冊失敗:", result);
      if (typeof turnstile !== "undefined") turnstile.reset();
      captchaToken = null;
      submitBtn.disabled = true;
    }

  } catch (error) {
    console.error("呼叫 API 發生錯誤:", error);
    if (typeof turnstile !== "undefined") turnstile.reset();
    captchaToken = null;
    submitBtn.disabled = true;
  }
});


