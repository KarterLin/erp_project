// toDoAdmin.js - 管理員待辦事項頁面JavaScript

// 頁面載入時獲取待審核的分錄
document.addEventListener('DOMContentLoaded', function() {
    loadPendingEntries();
});

async function loadPendingEntries() {
    try {
        const response = await fetch('http://localhost:8080/api/admin/todo/pending-entries');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('獲取的待審核分錄:', data);
        
        displayEntries(data);
        
    } catch (error) {
        console.error('載入待審核分錄失敗:', error);
        showError('載入待審核分錄失敗，請稍後重試。');
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
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">目前沒有待審核的分錄</td></tr>';
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
                row.dataset.voucherNumber = entry.voucherNumber;
            }

            row.innerHTML = `
                <td>${index === 0 ? formatDate(entry.entryDate) : ''}</td>
                <td>${index === 0 ? entry.voucherNumber || '' : ''}</td>
                <td>${detail.accountCode || ''}</td>
                <td>${detail.accountName || ''}</td>
                <td style="text-align: right;">${formatAmount(detail.debitAmount)}</td>
                <td style="text-align: right;">${formatAmount(detail.creditAmount)}</td>
                <td>${detail.description || ''}</td>
                <td>
                    ${index === 0 ? `
                        <select class="status-select" data-voucher="${entry.voucherNumber}">
                            <option value="" disabled selected>請選擇</option>
                            <option value="approved">核准</option>
                            <option value="rejected">退回</option>
                        </select>
                    ` : ''}
                </td>
                <td>
                    ${index === 0 ? `
                        <input type="text" class="reason-input" data-voucher="${entry.voucherNumber}" 
                               placeholder="請輸入原因" />
                    ` : ''}
                </td>
                <td>
                    ${index === 0 ? `
                        <button class="edit-button" onclick="confirmApproval('${entry.voucherNumber}')">
                            確認
                        </button>
                    ` : ''}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    });

    table.style.display = 'table';
}

async function confirmApproval(voucherNumber) {
    const statusSelect = document.querySelector(`.status-select[data-voucher="${voucherNumber}"]`);
    const reasonInput = document.querySelector(`.reason-input[data-voucher="${voucherNumber}"]`);
    
    const status = statusSelect.value;
    const reason = reasonInput.value.trim();
    
    if (!status) {
        alert('請選擇審核結果');
        return;
    }
    
    if (status === 'rejected' && !reason) {
        alert('退回時必須填寫原因');
        return;
    }
    
    // 確認操作
    const confirmMessage = status === 'approved' ? 
        `確定要核准傳票 ${voucherNumber} 嗎？` : 
        `確定要退回傳票 ${voucherNumber} 嗎？\n原因：${reason}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:8080/api/admin/todo/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voucherNumber: voucherNumber,
                status: status.toUpperCase(),
                reason: reason
            })
        });
        
        if (response.ok) {
            const message = await response.text();
            alert(message);
            
            // 移除已處理的行
            removeVoucherRows(voucherNumber);
            
            // 如果沒有更多待審核項目，重新載入
            if (document.querySelectorAll('#entries-tbody tr').length === 0) {
                loadPendingEntries();
            }
        } else {
            const errorMessage = await response.text();
            alert('更新失敗: ' + errorMessage);
        }
        
    } catch (error) {
        console.error('更新狀態失敗:', error);
        alert('更新狀態時發生錯誤，請稍後重試');
    }
}

function removeVoucherRows(voucherNumber) {
    // 找到有該傳票編號的主要行（第一行）
    const allRows = document.querySelectorAll('#entries-tbody tr');
    const rowsToRemove = [];
    let foundVoucherRow = false;
    
    allRows.forEach(row => {
        const voucherCell = row.cells[1]; // 傳票編號在第二欄
        
        // 如果找到傳票編號匹配的行
        if (voucherCell && voucherCell.textContent.trim() === voucherNumber) {
            foundVoucherRow = true;
            rowsToRemove.push(row);
        } 
        // 如果之前找到了傳票行，且當前行的傳票編號欄位為空（表示是同一傳票的詳細資料）
        else if (foundVoucherRow && voucherCell && voucherCell.textContent.trim() === '') {
            rowsToRemove.push(row);
        }
        // 如果遇到下一個有傳票編號的行，停止收集
        else if (foundVoucherRow && voucherCell && voucherCell.textContent.trim() !== '') {
            foundVoucherRow = false;
        }
    });
    
    // 移除收集到的所有行
    rowsToRemove.forEach(row => row.remove());
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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.getFullYear() + '/' + 
           String(date.getMonth() + 1).padStart(2, '0') + '/' + 
           String(date.getDate()).padStart(2, '0');
}

function formatAmount(amount) {
    if (!amount || amount == 0) return '';
    return parseFloat(amount).toLocaleString();
}