// API endpoint
const API_URL = "https://127.0.0.1:8443/api";

// 取得使用者資訊
async function getUser() {
    const response = await fetch(API_URL + "/me", { credentials: "include" });
    if (!response.ok) throw new Error("取得使用者資訊失敗");
    return await response.json();
}

async function loadUsers() {
    try {
        const currentUser = await getUser();
        console.log(currentUser);
        const currentEmail = currentUser.data.email;
        const currentRoles = currentUser.data?.roles || [];

        const response = await fetch(API_URL + "/users", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 200 && Array.isArray(result.data)) {
            const tbody = document.querySelector("table tbody");
            tbody.innerHTML = "";

            result.data.forEach(user => {
                // 判斷能不能編輯
                let editCell = "";
                if (currentRoles.includes("ROLE_ADMIN") || user.email === currentEmail) {
                    editCell = `
                        <a href="setting_userUpdate.html?email=${encodeURIComponent(user.email)}">
                            <img src="./img/icon1.png" alt="edit">
                        </a>`;
                } else {
                    // 不允許編輯 → 顯示灰色或空白
                    editCell = `<img src="./img/icon1.png" alt="edit" style="opacity:0.3; cursor:not-allowed;">`;
                }
                let roleText = "";
                if (user.role == "ADMIN") {
                    roleText = "財會主管"
                }else if (user.role == "USER") {
                    roleText = "一般財會人員"
                }
                
                const row = `
                    <tr>
                        <td>${user.account ?? ""}</td>
                        <td>${user.email ?? ""}</td>
                        <td>${roleText}</td>
                        <td>${user.status ?? ""}</td>
                        <td>${editCell}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML("beforeend", row);
            });
        } else {
            alert("載入失敗：" + result.message ?? "未知錯誤");
        }
    } catch (err) {
        console.error("Error loading users:", err);
        alert("無法載入使用者資料，請稍後再試");
    }
}

document.addEventListener("DOMContentLoaded", loadUsers);

