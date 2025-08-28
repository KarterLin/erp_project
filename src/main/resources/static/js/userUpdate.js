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

// 網址取得id
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function loadUserDetail() {
    const id = getQueryParam("id");
    if (!id) {
        alert("缺少 id 參數");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: "GET",
            credentials: "include"
        });
        if (!response.ok) throw new Error("取得使用者資料失敗");

        const result = await response.json();
        if (result.status === 200 && result.data) {
            const user = result.data;
            document.getElementById("uAccount").value = user.account ?? "";
            document.getElementById("uEmail").value = user.email ?? "";
            let roleCode = "";
                if (user.role === "USER") {
                    roleCode = "1"
                } else if (user.role === "ADMIN") {
                    roleCode = "2"
                }
            document.getElementById("jobTitle").value = roleCode;
            if (user.statusCode === 1) {
                document.getElementById("isActive").checked = true;
            } else if (user.statusCode === 2) {
                document.getElementById("notActive").checked = true;
            }
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
document.getElementById("userUpdate").addEventListener("submit", function (e) {
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
})

// 取消編輯
function cancelEdit() {
    const selects = document.querySelectorAll("select");

    clearErrType();

    fieldMap.forEach(({ el }) => {
        el.value = initialFormData[el.id] || "";
    });

    selects.forEach(el => {
        el.selectedIndex = 0;   // 回到預設選項
    });

    location.href = "setting_userManage.html";
}

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



document.addEventListener("DOMContentLoaded", loadUserDetail);