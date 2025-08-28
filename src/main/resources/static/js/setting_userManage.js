// API endpoint
const API_URL = "https://127.0.0.1:8443/api";

async function loadUsers() {
    try {
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
                const row = `
                    <tr>
                        <td>${user.account ?? ""}</td>
                        <td>${user.email ?? ""}</td>
                        <td>${user.role ?? ""}</td>
                        <td>${user.status ?? ""}</td>
                        <td>
                            <a href="setting_userUpdate.html?email=${encodeURIComponent(user.email)}">
                                <img src="./img/icon1.png" alt="edit">
                            </a>
                        </td>
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
