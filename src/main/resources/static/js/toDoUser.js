// toDoUser.js - 待辦事項頁面JavaScript

// 頁面載入時獲取待辦事項
document.addEventListener('DOMContentLoaded', function() {
    loadToDoEntries();
});

async function loadToDoEntries() {
    try {
        const response = await fetch('http://localhost:8080/api/todo/entries');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('獲取的待辦事項:', data);
        
        displayEntries(data);
        
    } catch (error) {
        console.error('載入待辦事項失敗:', error);
        showError('載入待辦事項失敗，請稍後重試。');
    }
}

function displayEntries(entries) {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const table = document.getElementById('entries-table');
    const tbody = document.getElementById('entries-tbody');

    // 隱藏載入中提示
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!entries || entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">目前沒有待辦事項</td></tr>';
        table.style.display = 'table';
        return;
    }

    tbody.innerHTML = '';

    entries.forEach(entry => {
        const details = entry.details || [];
        
        // 為每個傳票的詳細資料生成行
        details.forEach((detail, index) => {
            const row = document.createElement('tr');
            
            // 如果是第一筆詳細資料，添加傳票分組樣式
            if (index === 0) {
                row.classList.add('voucher-group');
            }

            row.innerHTML = `
                <td>${index === 0 ? formatDate(entry.entryDate) : ''}</td>
                <td>${index === 0 ? entry.voucherNumber || '' : ''}</td>
                <td>${detail.accountCode || ''}</td>
                <td>${detail.accountName || ''}</td>
                <td style="text-align: right;">${formatAmount(detail.debitAmount)}</td>
                <td style="text-align: right;">${formatAmount(detail.creditAmount)}</td>
                <td>${detail.description || ''}</td>
                <td class="${getStatusClass(entry.status)}">${index === 0 ? entry.status || '' : ''}</td>
            `;
            
            tbody.appendChild(row);
        });
    });

    table.style.display = 'table';
}

function showError(message) {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    
    loadingDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    // 處理不同的日期格式
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // 如果無法解析，返回原始字符串
    return date.getFullYear() + '/' + 
           String(date.getMonth() + 1).padStart(2, '0') + '/' + 
           String(date.getDate()).padStart(2, '0');
}

function formatAmount(amount) {
    if (!amount || amount == 0) return '';
    return parseFloat(amount).toLocaleString();
}

function getStatusClass(status) {
    switch (status) {
        case '已提交待審核':
            return 'status-pending';
        case '已審核通過':
            return 'status-approved';
        case '已退回':
            return 'status-rejected';
        default:
            return '';
    }
}