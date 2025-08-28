// API endpoint
const API_URL = "https://127.0.0.1:8443/api";

const uAccountEl = document.getElementById("uAccount");
const uEmailEl = document.getElementById("uEmail");
const jobTitleEl = document.getElementById("jobTitle");

const initialFormData = {};

// 欄位與驗證規則定義
const fieldMap = [
    { el: uAccountEl, name: "帳號", required: true },
    { el: uEmailEl, name: "Email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, formatMsg: "信箱格式錯誤" },
    { el: jobTitleEl, name: "職稱", required: true }
];
// 儲存初始表單值
fieldMap.forEach(({ el }) => {
    initialFormData[el.id] = el.value;
});

// 網址取得參數
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function loadUserDetail() {
    const id = getQueryParam("id");
    let currentUser = null;

    try {
        const meRes = await fetch(`${API_URL}/me`, { credentials: "include" });
        if (!meRes.ok) throw new Error("取得登入者資訊失敗");
        const meResult = await meRes.json();
        console.log(meResult);
        currentUser = meResult.data;

        let targetUser = null;
        if (currentUser.roles.includes("ROLE_ADMIN")) {
            // Admin 編輯
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: "GET",
                credentials: "include"
            });
            if (!response.ok) throw new Error("取得使用者資料失敗");
            const result = await response.json();
            targetUser = result.data;
        } else {
            // 編輯自己
            targetUser = currentUser;
        }
        if (!targetUser) {
            alert("無法載入使用者資料");
            return;
        }
        
        // 填值
        document.getElementById("uAccount").value = targetUser.account ?? "";
        document.getElementById("uEmail").value = targetUser.email ?? "";

        let roleCode = "";
        if (targetUser.roles.includes("ROLE_USER")) roleCode = "1";
        if (targetUser.roles.includes("ROLE_ADMIN")) roleCode = "2";
        document.getElementById("jobTitle").value = roleCode;

        if (targetUser.status === 1) {
            document.getElementById("isActive").checked = true;
        } else if (targetUser.status === 2) {
            document.getElementById("notActive").checked = true;
        }

    } catch (err) {
        console.error("Error loading user detail:", err);
        alert("無法載入使用者資料");
    }
}

// 清除錯誤格式
function clearErrType() {
    fieldMap.forEach(({ el }) => {
        el.classList.remove("error");
        el.style.border = "";
    });
}
// form格式驗證
document.getElementById("userUpdate").addEventListener("submit", async function (e) {
    e.preventDefault();
    // clearErrType();

    // 檢查必填 & 格式
    for (let { el, name, pattern, formatMsg, required } of fieldMap) {
        const value = el.value.trim();

        if (required && !value) {
            showError(el, name + "不得為空");
            return;
        }
        if (value && pattern && !pattern.test(value)) {
            showError(el, formatMsg || name + "格式錯誤");
            return;
        }
    }
    // console.log("表單驗證通過，可以送出");
    const uAccount = uAccountEl.value.trim();
    const uEmail = uEmailEl.value.trim();
    const roleCode = jobTitleEl.value;
    const status = document.getElementById("isActive").checked ? 1 : 2;

    try {
        let endpoint = "";
        let body = {};
        // 判斷要打哪個 API
        if (roleCode == 2) {
            // Admin 更新
            endpoint = `${API_URL}/user/update/byAdmin`;
            body = {
                tEmail: uEmail,
                uAccount: uAccount,
                role: roleCode === "2" ? "ADMIN" : "USER",
                status: status
            };
        } else {
            // User 更新自己
            endpoint = `${API_URL}/user/update/me`;
            body = {
                uAccount: uAccount,
                status: status
            };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("更新失敗");
        const result = await response.json();
        alert(result.message || "更新成功！");
        location.href = "setting_userManage.html";

    } catch (err) {
        console.error("Error updating user:", err);
        alert("更新失敗");
    }
});


// 取消編輯
function cancelEdit() {
    clearErrType();
    fieldMap.forEach(({ el }) => {
        el.value = initialFormData[el.id] || "";
    });

    location.href = "setting_userManage.html";
}


// 錯誤提示
function showError(element, message) {
    element.classList.add("error");
    element.style.border = "2px solid red";
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // element.focus();
     alert(message);
}


document.addEventListener("DOMContentLoaded", loadUserDetail);