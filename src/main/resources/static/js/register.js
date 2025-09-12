// API endpoint
const API_URL = "https://127.0.0.1:8443/api";


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

// 密碼強度檢查
function validatePassword(password) {
  // 至少 8 碼，英數混和
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}
// 即時檢查 (提示)
const passwordInput = document.getElementById("inputGroup");
const br = document.createElement("br"); // 建立換行
passwordInput.insertAdjacentElement("afterend", br);
const passwordHint = document.createElement("div");
passwordHint.style.fontSize = "12px";
passwordHint.style.marginTop = "4px";
passwordInput.insertAdjacentElement("afterend", passwordHint);
passwordInput.addEventListener("input", () => {
  const passwordValue = document.getElementById("password").value.trim();
  if (passwordValue.length === 0) {
    passwordHint.textContent = "";
    return;
  }
  if (validatePassword(passwordValue)) {
    passwordHint.textContent = "";
  } else {
    passwordHint.textContent = "❌ 至少 8 碼，且需包含英文與數字";
    passwordHint.style.color = "red";
  }
});

// ====== 必填欄位 ======
const cnameEl = document.getElementById("cname");
const rnameEl = document.getElementById("rname");
const rtelEl = document.getElementById("rtel");
const accountEl = document.getElementById("account");
const emailEl = document.getElementById("email");
const taxIdInput = document.getElementById("taxId");
const pendingCheckbox = document.getElementById("pendingCompany");

// 勾選「公司申請中」
pendingCheckbox.addEventListener("change", function () {
  if (this.checked) {
    taxIdInput.value = "";
    taxIdInput.disabled = true;
  } else {
    taxIdInput.value = "";
    taxIdInput.disabled = false;
  }
});
// ====== 驗證規則 ======
function validateForm() {
  // 必填檢查
  if (!cnameEl.value.trim()) return "公司名稱必填";
  if (!rnameEl.value.trim()) return "負責人姓名必填";
  if (!rtelEl.value.trim()) return "負責人手機必填";
  if (!accountEl.value.trim()) return "帳號必填";
  if (!emailEl.value.trim()) return "Email 必填";

  // 手機格式：台灣手機 09 開頭 + 8 碼
  const phoneRegex = /^09\d{8}$/;
  if (!phoneRegex.test(rtelEl.value.trim())) {
    return "手機號碼格式錯誤 (台灣格式 09xxxxxxxx)";
  }

  // Email 格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailEl.value.trim())) {
    return "Email 格式錯誤";
  }

  // 統編 (若有填寫)
  if (!taxIdInput.disabled && taxIdInput.value.trim().length > 0) {
    const taxIdRegex = /^\d{8}$/;
    if (!taxIdRegex.test(taxIdInput.value.trim())) {
      return "統編必須是 8 碼數字";
    }
  }
  return true;
}

// Enter 鍵送出
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitBtn.click();
  }
});
// 提交
submitBtn.addEventListener("click", async () => {
  if (!captchaToken) {
    alert("請先完成機器人驗證");
    return;
  }
  const passwordValue = document.getElementById("password").value.trim();
  const validationError = validateForm();
  if (validationError !== true) {
    alert(validationError);
    return;
  }
  if (!validatePassword(passwordValue)) {
    alert("密碼需至少 8 碼，且必須包含英文與數字！");
    return;
  }

  let taxIdValue = taxIdInput.disabled ? null : taxIdInput.value.trim();

  const registrationData = {
    cName: cnameEl.value.trim(),
    taxId: taxIdValue,
    rName: rnameEl.value.trim(),
    rTel: rtelEl.value,
    uAccount: accountEl.value.trim(),
    uEmail: emailEl.value.trim(),
    password: passwordValue,
    role: "ADMIN",
    captchaToken: captchaToken,
  };

  try {
    const response = await fetch(API_URL + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registrationData)
    });

    // 解析回應
    const result = await response.json().catch(() => ({}));

    if (response.ok) {
      alert(result.message); // 註冊成功，請查收驗證信。
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

