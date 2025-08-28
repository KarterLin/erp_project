// API endpoint
const API_URL = "https://127.0.0.1:8443/api/user/update";

const oPasswordEl = document.getElementById("oldPassword");
const nPasswordEl = document.getElementById("newPassword");
const cPasswordEl = document.getElementById("checkPassword");

document.getElementById("passwordUpdate").addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const oldPassword = oPasswordEl.value.trim();
        const newPassword = nPasswordEl.value.trim();
        const checkPassword = cPasswordEl.value.trim();

        if (!oldPassword || !newPassword || !checkPassword) {
            alert("請輸入完整資料");
            return;
        }
        if (newPassword === oldPassword) {
            alert("新密碼不可與舊密碼相同");
            return;
        }
        if (newPassword !== checkPassword) {
            alert("兩次輸入的新密碼不一致");
            return;
        }

        const res = await fetch(`${API_URL}/me/password`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                oldPassword,
                password: newPassword,
                checkPassword
            })
        });
        const result = await res.json();
        console.log(result);
        if (res.ok && result.status === 200) {
            alert("密碼更新成功，請重新登入");
            window.location.href = "login.html"; 
        } else {
            alert("密碼更新失敗：" + result.message);
        }

    } catch (err) {
        console.error("Error loading user detail:", err);
        alert("系統錯誤，請稍後再試");
    }
});

// 網址取得參數
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}
document.getElementById("cancelBtn").addEventListener("click", function(){location.href = `setting_userUpdate.html?id=${getQueryParam("id")}`})