// toDoAdmin.js - 管理員待辦事項頁面JavaScript

// 頁面載入時獲取待審核的分錄
document.addEventListener('DOMContentLoaded', function() {
    loadPendingEntries();
});

async function loadPendingEntries() {
    try {
        const response = await fetch('https://127.0.0.1:8443/api/admin/todo/pending-entries');
        
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

  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  tbody.innerHTML = '';

  if (!entries || entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">目前沒有待審核的分錄</td></tr>';
    table.style.display = 'table';
    return;
  }

  entries.forEach(entry => {
    const details = entry.details || [];
    if (details.length === 0) return;

    const span = details.length;
    const voucher = entry.voucherNumber || '';
    const dateText = formatDate(entry.entryDate);

    details.forEach((detail, idx) => {
      const tr = document.createElement('tr');
      // 📌 重要：為每一行都加上 voucher 標記，方便後續移除
      tr.dataset.voucher = voucher;
      tr.classList.add('voucher-row');

      // 日期、傳票編號（第一列才顯示，跨列）
      if (idx === 0) {
        const tdDate = document.createElement('td');
        tdDate.textContent = dateText;
        tdDate.rowSpan = span;
        tr.appendChild(tdDate);

        const tdVoucher = document.createElement('td');
        tdVoucher.textContent = voucher;
        tdVoucher.rowSpan = span;
        tr.appendChild(tdVoucher);
      }

      // 明細欄位
      tr.appendChild(cell(detail.accountCode || ''));
      tr.appendChild(cell(detail.accountName || ''));
      tr.appendChild(cell(formatAmount(detail.debitAmount), 'right'));
      tr.appendChild(cell(formatAmount(detail.creditAmount), 'right'));
      tr.appendChild(cell(detail.description || ''));

      // 👉 新增：輸入人員（第一列顯示，跨列）
      if (idx === 0) {
        const tdUser = document.createElement('td');
        tdUser.textContent = entry.inputUser || entry.createdBy || entry.enteredBy || '';
        tdUser.rowSpan = span;
        tr.appendChild(tdUser);
      }

      // 第一列才顯示審核欄位（跨列）
      if (idx === 0) {
        const tdStatus = document.createElement('td');
        tdStatus.rowSpan = span;
        tdStatus.innerHTML = `
          <select class="status-select" data-voucher="${voucher}">
            <option value="" disabled selected>請選擇</option>
            <option value="approved">核准</option>
            <option value="rejected">退回</option>
          </select>
        `;
        tr.appendChild(tdStatus);

        const tdReason = document.createElement('td');
        tdReason.rowSpan = span;
        tdReason.innerHTML = `
          <input type="text" class="reason-input" data-voucher="${voucher}" placeholder="請輸入原因" />
        `;
        tr.appendChild(tdReason);

        const tdAction = document.createElement('td');
        tdAction.rowSpan = span;
        tdAction.innerHTML = `
          <button class="edit-button" onclick="confirmApproval('${voucher}')">確認</button>
        `;
        tr.appendChild(tdAction);
      }

      tbody.appendChild(tr);
    });

    // 分隔線 - 也要加上 voucher 標記
    const sep = document.createElement('tr');
    sep.dataset.voucher = voucher;
    sep.classList.add('voucher-separator');
    sep.innerHTML = `<td colspan="11" style="padding:0;border:0;height:6px;"></td>`;
    tbody.appendChild(sep);
  });

  table.style.display = 'table';

  function cell(text, align) {
    const td = document.createElement('td');
    td.textContent = text ?? '';
    if (align === 'right') td.style.textAlign = 'right';
    return td;
  }
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
        const response = await fetch('https://127.0.0.1:8443/api/admin/todo/update-status', {
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
            
            // 檢查是否還有待審核項目
            const remainingRows = document.querySelectorAll('#entries-tbody tr.voucher-row');
            if (remainingRows.length === 0) {
                // 如果沒有更多項目，重新載入以顯示 "目前沒有待審核的分錄"
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

// 📌 修正版本的 removeVoucherRows 函數
function removeVoucherRows(voucherNumber) {
    console.log('移除傳票:', voucherNumber);
    
    // 使用 dataset.voucher 來找到所有相關的行
    const rowsToRemove = document.querySelectorAll(`#entries-tbody tr[data-voucher="${voucherNumber}"]`);
    
    console.log('找到要移除的行數:', rowsToRemove.length);
    
    // 移除所有相關的行（包括明細行和分隔線）
    rowsToRemove.forEach((row, index) => {
        console.log(`移除第 ${index + 1} 行:`, row);
        row.remove();
    });
    
    console.log('移除完成');
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