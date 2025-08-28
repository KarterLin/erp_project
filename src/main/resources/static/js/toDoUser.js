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

  loadingDiv.style.display = 'none';
  errorDiv.style.display = 'none';
  tbody.innerHTML = '';

  if (!entries || entries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">目前沒有待辦事項</td></tr>';
    table.style.display = 'table';
    return;
  }

  entries.forEach(entry => {
    const details = entry.details || [];
    if (details.length === 0) return;

    const span = details.length; // 這張傳票有幾列分錄

    details.forEach((detail, idx) => {
      const tr = document.createElement('tr');
      if (idx === 0) tr.classList.add('voucher-group');

      // 第一列才放「日期」「傳票編號」並跨列
      if (idx === 0) {
        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(entry.entryDate);
        tdDate.rowSpan = span;
        tr.appendChild(tdDate);

        const tdVoucher = document.createElement('td');
        tdVoucher.textContent = entry.voucherNumber || '';
        tdVoucher.rowSpan = span;
        tr.appendChild(tdVoucher);
      }

      // 明細層欄位（每列都要有，維持欄位數一致）
      tr.appendChild(td(detail.accountCode || ''));
      tr.appendChild(td(detail.accountName || ''));
      tr.appendChild(td(formatAmount(detail.debitAmount), 'right'));
      tr.appendChild(td(formatAmount(detail.creditAmount), 'right'));
      tr.appendChild(td(detail.description || ''));

      // 第一列才放「輸入人員」「審核狀態」並跨列（傳票層級）
      if (idx === 0) {
        const tdUser = document.createElement('td');
        // 後端欄位名稱可能不同，這裡多做幾個別名保險
        tdUser.textContent = entry.inputUser || entry.createdBy || entry.enteredBy || '';
        tdUser.rowSpan = span;
        tr.appendChild(tdUser);

        const tdStatus = document.createElement('td');
        tdStatus.textContent = entry.status || '';
        tdStatus.rowSpan = span;
        tdStatus.className = getStatusClass(entry.status);
        tr.appendChild(tdStatus);
      }

      tbody.appendChild(tr);
    });

    // 群組間分隔線（可選）
    const sep = document.createElement('tr');
    sep.innerHTML = `<td colspan="9" style="padding:0;border:0;height:6px;"></td>`;
    tbody.appendChild(sep);
  });

  table.style.display = 'table';

  function td(text, align) {
    const cell = document.createElement('td');
    cell.textContent = text ?? '';
    if (align === 'right') cell.style.textAlign = 'right';
    return cell;
  }
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