const uAccountEl = document.getElementById("uAccount");
// const uNameEl = document.getElementById("uName");
const uEmailEl = document.getElementById("uEmail");
const jobTitleEl = document.getElementById("jobTitle");

// 欄位與驗證規則定義
const fieldMap = [
    { el: uAccountEl, name: "帳號", required: true }, 
    // { el: uNameEl, name: "姓名", required: true },
    { el: uEmailEl, name: "Email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, formatMsg: "信箱格式錯誤" },
    { el: jobTitleEl, name: "職稱", required: true }
];

// 清除錯誤格式
function clearErrType() {
    fieldMap.forEach(({ el }) => {
        el.classList.remove("error");
        el.style.border = "";
    });
}

// form格式驗證
document.getElementById("uForm").addEventListener("submit", async function (e) {
    // 擋submit
    e.preventDefault();
    clearErrType()

    // 檢查必填 & 格式
    for (let { el, pattern, formatMsg, required } of fieldMap) {
        const value = el.value.trim();

        if (required && !value) {
            showError(el + "不得為空");
            return;
        }
        if (value && pattern && !pattern.test(value)){
            showError(el, formatMsg  + "格式錯誤");
            return; 
        } 
    }
    // console.log("表單驗證通過，可以送出");
    try {
        const uEmail = uEmailEl.value.trim();
        const uAccount = uAccountEl.value.trim();
        let role = "";
        if(jobTitleEl.value == "2"){role="ADMIN"} else {role="USER"};
        const result = await addUser(uAccount, uEmail, role);
        console.log("✅ 新增成功:", result);
    } catch (error) {
        console.error("🚨 呼叫 API 發生錯誤:", error);
        alert("新增失敗");
    }
})

// 實時移除ERRTYPE
fieldMap.forEach(({ el, pattern }) => {
    el.addEventListener("input", () => {
        const value = el.value.trim();

        // 判斷是否需要格式驗證
        if (pattern) {
            if (pattern.test(value)) {
                el.classList.remove("error");
                el.style.border = "";
            }
        } else {
            if (value !== "") {
                el.classList.remove("error");
                el.style.border = "";
            }
        }
    });
});

// 錯誤提示
function showError(element, message) {
    element.classList.add("error");
    element.style.border = "2px solid red";
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // element.focus();
    // alert(message);
}

// API endpoint
const API_URL = "https://127.0.0.1:8443/api/user/create";

async function addUser(uAccount, uEmail, role) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include", // 瀏覽器存cookie
        body: JSON.stringify({uAccount, uEmail, role}),
    });

    if (!response.ok) {
        throw new Error("新增失敗");
    }
    return await response.json(); // AuthenticationResponse
}
