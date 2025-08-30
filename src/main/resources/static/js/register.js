// API endpoint
const API_URL = "https://localhost:8080/api/register";

// 按鈕 
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true; 

// 隱藏密碼顯示（可切換遮蔽或顯示）
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
// 忘記密碼
function pwdforget() {
    const email = document.getElementById("lemail").value;
    const storedHashedPassword = localStorage.getItem(email);
    if (!storedHashedPassword) {
        alert("查無此帳號");
        return;
    }
    alert("請至信箱接收驗證信");

}

submitBtn.addEventListener("click", async () => {
const registrationData = {
  cName: document.getElementById("cname").value,
    taxId: document.getElementById("taxId").value,
    rName: document.getElementById("rname").value,
    rTel: document.getElementById("rtel").value,
    uAccount: document.getElementById("account").value,
    uEmail: document.getElementById("email").value,
    password: document.getElementById("password").value,
    role: "ADMIN" 
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
    const result = await response.json();

    if (response.ok) {
      alert("註冊成功: " + result.message); // 註冊成功，請查收驗證信。
      console.log("註冊成功:", result);
    } else {
      alert("註冊失敗: " + result.message);
      console.error("註冊失敗:", result);
    }
  } catch (error) {
    console.error("呼叫 API 發生錯誤:", error);
  }
});


