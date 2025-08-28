// 管理者權限才能編輯
// API endpoint
const API_URL = "https://127.0.0.1:8443/api/company";

const editBtn = document.getElementById("editBtn");
const cNameEl = document.getElementById("cName");
const taxIDEl = document.getElementById("taxID");
const rNameEl = document.getElementById("rName");
const telEl = document.getElementById("rTel");
const emailEl = document.getElementById("cEmail");
const initialFormData = {};

// 欄位與驗證規則定義
const fieldMap = [
    { el: cNameEl, name: "公司名稱", required: true },
    { el: taxIDEl, name: "公司統編", required: true },
    { el: rNameEl, name: "負責人姓名", required: true },
    { el: telEl, name: "負責人電話", required: true, pattern: /^09\d{8}$/, formatMsg: "電話格式錯誤" },  // 台灣手機號碼格式
    { el: emailEl, name: "Email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, formatMsg: "信箱格式錯誤" },  // Email基本格式
];

// 儲存初始表單值
fieldMap.forEach(({ el }) => {
    initialFormData[el.id] = el.value;
});

(async function () {
    await loadCompanyInfo();
    console.log("公司資料已載入");


    try {

        const roles = await getUserRole();


        if (roles.includes("ROLE_USER")) {
            // USER 禁止編輯
            editBtn.addEventListener("click", (e) => {
                e.preventDefault();
                alert("沒有權限編輯！");
            });
        } else if (roles.includes("ROLE_ADMIN")) {
            // ADMIN 正常進入編輯
            editBtn.addEventListener("click", () => {
                enableForm();
                // form格式驗證
                document.getElementById("cForm").addEventListener("submit", function (e) {
                    // 擋submit
                    e.preventDefault();
                    clearErrType();

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
                    // 呼叫更新 API
                    try {
                        const result = updateCompany(
                            cNameEl.value.trim(),
                            rNameEl.value.trim(),
                            telEl.value.trim(),
                            emailEl.value.trim()
                        );
                        alert(result.message || "更新成功！");
                        // 更新成功 → 重新載入公司資料
                        loadCompanyInfo();

                        cancelEdit(); // 回到唯讀模式
                    } catch (err) {
                        alert(err.message || "更新失敗，請稍後再試");
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
            });
        } else {
            // 沒有登入或沒有角色
            editBtn.addEventListener("click", (e) => {
                e.preventDefault();
                alert("請先登入！");
            });
        }
    } catch (err) {
        console.error(err);
        alert("無法取得使用者資訊");
    }
})();;
//--------function------------

// 開啟編輯
function enableForm() {
    const inputs = document.querySelectorAll('#cForm input, #cForm select');
    inputs.forEach(el => el.disabled = false);

    // 按鈕
    document.querySelector('.endEdit').style.display = 'inline-flex';
    document.querySelector('.editBtn').style.display = "none";
}

// 清除錯誤格式
function clearErrType() {
    fieldMap.forEach(({ el }) => {
        el.classList.remove("error");
        el.style.border = "";
    });
}
// 取消編輯
function cancelEdit() {
    const selects = document.querySelectorAll("select");

    document.querySelector('.endEdit').style.display = 'none';
    document.querySelector('.editBtn').style.display = "block";
    clearErrType()

    fieldMap.forEach(({ el }) => {
        el.value = initialFormData[el.id] || "";
        el.disabled = true;
    });

    selects.forEach(el => {
        el.selectedIndex = 0;   // 回到預設選項
        el.disabled = true;
    });
}

// 錯誤提示
function showError(element, message) {
    element.classList.add("error");
    element.style.border = "2px solid red";
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // element.focus();
    // alert(message);
}


async function loadCompanyInfo() {
    try {
        const response = await fetch(API_URL + "/info", {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("載入公司資料失敗");
        }
        const result = await response.json();

        if (result.status === 200 && result.data) {
            const company = result.data;
            // 填入欄位
            cNameEl.value = company.cname || "";
            taxIDEl.value = company.taxId || "";
            rNameEl.value = company.rname || "";
            telEl.value = company.rtel || "";
            emailEl.value = company.remail || "";

            // 更新 FormData
            fieldMap.forEach(({ el }) => {
                initialFormData[el.id] = el.value;
                el.disabled = true; // 預設唯讀
            });
        } else {
            alert(result.message || "無法取得公司資料");
        }
    } catch (err) {
        alert(err.message);
    }
}

async function updateCompany(cName, rName, rTel, rEmail) {
    const response = await fetch(API_URL + "/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ cName, rName, rTel, rEmail }),
    });

    if (!response.ok) {
        throw new Error("更新失敗");
    }

    return await response.json();
}

// 取得使用者資訊
async function getUserRole() {
    const response = await fetch("https://127.0.0.1:8443/api/me", { credentials: "include" });
    if (!response.ok) throw new Error("取得使用者資訊失敗");
    const result = await response.json();
    const roles = result.data?.roles || [];
    console.log("使用者角色:", roles);
    return roles;
}





