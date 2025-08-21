document.addEventListener("DOMContentLoaded", () => {
  initTableToggle();
});

function initTableToggle() {
  document.querySelectorAll('tr.main-row').forEach(mainRow => {
    const groupClass = Array.from(mainRow.classList).find(c => c.startsWith('group'));
    if (!groupClass) return;

    const hasSubRows = document.querySelector(`tr.sub-row.${groupClass}`);
    if (!hasSubRows) return;

    const td = mainRow.querySelector('td');
    if (!td) return;

    // 插入箭頭（如果尚未插入）
    if (!td.querySelector('.arrow')) {
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      td.prepend(arrow);
    }

    // 加入點擊事件（避免重複綁定）
    if (!mainRow._clickBound) {
      mainRow._clickBound = true;
      mainRow.addEventListener('click', () => {
        mainRow.classList.toggle('expanded');
        document.querySelectorAll(`tr.sub-row.${groupClass}`).forEach(sub => {
          sub.classList.toggle('show');
        });
      });
    }
  });
}

function toggleItems() {
  const toggle = document.getElementById('toggleSwitch');
  const text = document.getElementById('switchText');

  toggle.classList.toggle('active');
  if (toggle.classList.contains('active')) {
    text.innerText = '隱藏部分項目';
    // 加入顯示全部行的程式碼
  } else {
    text.innerText = '顯示全部項目';
    // 加入隱藏部分行的程式碼
  }
}

function toggleSubRows(groupClass) {
  const rows = document.querySelectorAll('tr.sub-row.' + groupClass);
  rows.forEach(row => {
    row.classList.toggle('show');
  });
}

// Sidebar 載入完成後的初始化
window.onSidebarLoaded = () => {
  handleResize();
  window.addEventListener('resize', handleResize);

  document.querySelectorAll('tr.main-row').forEach(mainRow => {
    const groupClass = Array.from(mainRow.classList).find(c => c.startsWith('group'));
    if (groupClass && document.querySelector(`tr.sub-row.${groupClass}`)) {
      const td = mainRow.querySelector('td');
      if (!td) return;

      // 避免重複插入箭頭
      if (!td.querySelector('.arrow')) {
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        td.prepend(arrow);
      }

      // 避免重複綁定事件
      if (!mainRow._clickBound) {
        mainRow._clickBound = true;
        mainRow.addEventListener('click', () => {
          mainRow.classList.toggle('expanded');
          document.querySelectorAll(`tr.sub-row.${groupClass}`).forEach(sub => {
            sub.classList.toggle('show');
          });
        });
      }
    }
  });
};

function updateHeaderDateRange(startDate, endDate) {
  const header = document.getElementById("dateRangeHeader");
  if (header) {
    header.textContent = `${startDate} - ${endDate}`;
  }
}

function formatDateLocal(date) {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

// flatpickr 設定
flatpickr("#dateRange", {
  locale: "zh",
  dateFormat: "Y-m-d",
  mode: "range",
  allowInput: true,
  defaultDate: [startOfMonth, today], // Date 物件
  onClose: function (selectedDates) {
    if (selectedDates.length === 2) {
      const startDate = formatDateLocal(selectedDates[0]);
      const endDate = formatDateLocal(selectedDates[1]);

      updateHeaderDateRange(startDate, endDate);
      loadIncomeStatement(startDate, endDate);
    }
  }
});

// 初始化表格上方日期
updateHeaderDateRange(formatDateLocal(startOfMonth), formatDateLocal(today));

// 預設載入
loadIncomeStatement(formatDateLocal(startOfMonth), formatDateLocal(today));

// --- 讀取 API 並更新損益表 ---
function loadIncomeStatement(startDate, endDate) {
  fetch(`http://localhost:8080/api/income-statement?startDate=${startDate}&endDate=${endDate}`)
    .then(res => res.json())
    .then(data => updateIncomeStatement(data))
    .catch(console.error);
}

// --- 更新損益表內容 ---
function updateIncomeStatement(data) {
  // 3. 清空 total-row 小計
  document.querySelectorAll("tr.total-row").forEach(tr => {
    tr.children[2].textContent = "0.00";
    tr.children[3].textContent = "0%";
  });

  // 1. 更新主要計算欄位（營業毛利、營業淨利、稅前淨利、本期淨利）
  setText("#grossProfit", data.grossProfit, "profit");
  setText("#operatingIncome", data.operatingIncome, "profit");
  setText("#preTaxIncome", data.preTaxIncome, "profit");
  setText("#netIncome", data.netIncome, "profit");

  // 2. 清空所有子列小計與百分比欄位
  document.querySelectorAll("tr.sub-row").forEach(tr => {
    tr.children[2].textContent = "0.00"; // 小計欄
    tr.children[3].textContent = "0%";   // 百分比欄
  });

  // 4. 計算所有子列總額，用於百分比
  let totalAmount = data.details.reduce((sum, item) => sum + Number(item.amount), 0);

  // 5. 暫存每個 group 的合計與類型
  const groupTotals = {};
  const groupTypes = {}; // income / expense

  // 6. 填子列金額並累計 group
  data.details.forEach(item => {
    const td = document.querySelector(`td[data-parent-id='${item.parentId}']`);
    if (!td) return;

    const tr = td.parentElement;
    const subtotalTd = tr.children[2];
    const percentTd = tr.children[3];

    // 判斷 group 類型
    const groupClass = Array.from(tr.classList).find(c => c.startsWith('group'));
    let type = "income"; // 預設收入
    if (groupClass && groupClass !== "group1" && groupClass !== "group2") {
      type = "expense"; // 費用或支出
    }
    groupTypes[groupClass] = type;

    // 顯示金額
    subtotalTd.textContent = formatAmountForDisplay(item.amount, type);

    // 百分比
    percentTd.textContent = totalAmount !== 0
      ? ((item.amount / totalAmount) * 100).toFixed(2) + "%"
      : "0%";

    // 累計 group 合計
    if (groupClass) {
      if (!groupTotals[groupClass]) groupTotals[groupClass] = 0;
      groupTotals[groupClass] += Number(item.amount);
    }
  });

  // 7. 更新 total-row 金額
  Object.keys(groupTotals).forEach(groupClass => {
    const totalRow = Array.from(document.querySelectorAll('tr.total-row'))
      .find(tr => {
        let sibling = tr.previousElementSibling;
        while (sibling) {
          if (sibling.classList.contains('sub-row') && sibling.classList.contains(groupClass)) return true;
          sibling = sibling.previousElementSibling;
        }
        return false;
      });

    if (totalRow) {
      const type = groupTypes[groupClass] || "income";
      totalRow.children[2].textContent = formatAmountForDisplay(groupTotals[groupClass], type);
      totalRow.children[3].textContent = totalAmount !== 0
        ? ((groupTotals[groupClass] / totalAmount) * 100).toFixed(2) + "%"
        : "0%";
    }
  });
}

// 顯示金額工具函式
function formatAmountForDisplay(amount, type) {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (type === "income") {
    // 收入負數 → 顯示正數
    return formatted;
  } else if (type === "expense") {
    // 費用/支出 → 括號
    return `(${formatted})`;
  } else {
    // 其他（淨利等） → 負數用括號
    return amount < 0 ? `(${formatted})` : formatted;
  }
}

// 設定主要欄位文字
function setText(selector, num, type = "profit") {
  const el = document.querySelector(selector);
  if (el) el.textContent = formatAmountForDisplay(num, type);
}

// ==================== 匯出 Excel 功能 ====================

// 檢查是否已載入 SheetJS
function ensureSheetJSLoaded() {
    return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('無法載入 SheetJS 庫'));
        document.head.appendChild(script);
    });
}

// 添加損益表會計科目資料
function addIncomeAccountData(data, accounts) {
    accounts.forEach(account => {
        const td = document.querySelector(`td[data-parent-id='${account.id}']`);
        if (td) {
            const tr = td.parentElement;
            const amount = tr.children[2].textContent;
            const percent = tr.children[3].textContent;
            data.push(['', account.name, amount, percent]);
        } else {
            data.push(['', account.name, '0.00', '0%']);
        }
    });
}

// 計算營業費用合計
function calculateOperatingExpenseTotal() {
    let total = 0;
    const expenseIds = ['6100', '6200', '6300'];
    
    expenseIds.forEach(id => {
        const td = document.querySelector(`td[data-parent-id='${id}']`);
        if (td) {
            const tr = td.parentElement;
            const amountText = tr.children[2].textContent;
            // 移除括號和逗號，轉換為數字
            const amount = parseFloat(amountText.replace(/[(),]/g, '')) || 0;
            total += amount;
        }
    });
    
    // 格式化為費用顯示格式
    return `(${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`;
}

// 計算營業外收入及支出合計
function calculateNonOperatingTotal() {
    let total = 0;
    const accountIds = ['7100', '7230', '7050'];
    
    accountIds.forEach(id => {
        const td = document.querySelector(`td[data-parent-id='${id}']`);
        if (td) {
            const tr = td.parentElement;
            const amountText = tr.children[2].textContent;
            // 解析金額（考慮括號表示負數）
            let amount = 0;
            if (amountText.includes('(')) {
                amount = -parseFloat(amountText.replace(/[(),]/g, '')) || 0;
            } else {
                amount = parseFloat(amountText.replace(/,/g, '')) || 0;
            }
            
            // 根據科目性質調整符號
            if (id === '7100') { // 其他收入 - 正數
                total += amount;
            } else if (id === '7230') { // 其他利益及損失 - 可能正負
                total += amount;
            } else if (id === '7050') { // 財務成本 - 負數
                total -= Math.abs(amount);
            }
        }
    });
    
    // 格式化顯示
    if (total < 0) {
        return `(${Math.abs(total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})`;
    } else {
        return total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

// 準備損益表資料
function prepareIncomeStatementData(startDate, endDate) {
    const data = [];
    
    // 標題行
    data.push([`損益表 (${startDate} 至 ${endDate})`]);
    data.push([]); // 空行
    
    // 表頭
    data.push(['項目名稱', '會計科目', '小計', '百分比']);
    
    // 營業收入
    data.push(['營業收入', '', '', '']);
    addIncomeAccountData(data, [
        { id: '4000', name: '營業收入' }
    ]);
    data.push([]); // 空行
    
    // 營業成本
    data.push(['營業成本', '', '', '']);
    addIncomeAccountData(data, [
        { id: '5000', name: '營業成本' }
    ]);
    
    // 營業毛利
    const grossProfit = document.getElementById('grossProfit').textContent;
    data.push(['營業毛利', '', grossProfit, '']);
    data.push([]); // 空行
    
    // 營業費用
    data.push(['營業費用', '', '', '']);
    addIncomeAccountData(data, [
        { id: '6100', name: '推銷費用' },
        { id: '6200', name: '管理費用' },
        { id: '6300', name: '研究發展費用' }
    ]);
    
    // 營業費用合計（需要計算）
    const operatingExpenseTotal = calculateOperatingExpenseTotal();
    data.push(['營業費用合計', '', operatingExpenseTotal, '']);
    
    // 營業淨利
    const operatingIncome = document.getElementById('operatingIncome').textContent;
    data.push(['營業淨利(損)', '', operatingIncome, '']);
    data.push([]); // 空行
    
    // 營業外收入及支出
    data.push(['營業外收入及支出', '', '', '']);
    addIncomeAccountData(data, [
        { id: '7100', name: '其他收入' },
        { id: '7230', name: '其他利益及損失' },
        { id: '7050', name: '財務成本' }
    ]);
    
    // 營業外收入及支出合計（需要計算）
    const nonOperatingTotal = calculateNonOperatingTotal();
    data.push(['營業外收入及支出合計', '', nonOperatingTotal, '']);
    data.push([]); // 空行
    
    // 稅前淨利
    const preTaxIncome = document.getElementById('preTaxIncome').textContent;
    data.push(['稅前淨利(損)', '', preTaxIncome, '']);
    
    // 所得稅費用
    addIncomeAccountData(data, [
        { id: '7950', name: '所得稅費用' }
    ]);
    
    // 本期淨利
    const netIncome = document.getElementById('netIncome').textContent;
    data.push(['本期淨利(損)', '', netIncome, '']);
    
    return data;
}

// 匯出 Excel 功能
function exportIncomeStatementToExcel() {
    // 獲取當前日期範圍
    const dateInput = document.getElementById('dateRange');
    const dateRangeValue = dateInput.value;
    
    let startDate, endDate;
    if (dateRangeValue && dateRangeValue.includes(' to ')) {
        [startDate, endDate] = dateRangeValue.split(' to ');
    } else {
        // 如果沒有範圍，使用預設值
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatDateLocal(startOfMonth);
        endDate = formatDateLocal(today);
    }
    
    // 創建工作簿
    const wb = XLSX.utils.book_new();
    
    // 準備資料
    const data = prepareIncomeStatementData(startDate, endDate);
    
    // 創建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // 設定欄寬
    ws['!cols'] = [
        { width: 20 }, // 項目名稱
        { width: 30 }, // 會計科目
        { width: 15 }, // 小計
        { width: 10 }  // 百分比
    ];
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '損益表');
    
    // 生成檔案名稱
    const fileName = `損益表_${startDate}_${endDate}.xlsx`;
    
    // 匯出檔案
    XLSX.writeFile(wb, fileName);
}

// 主要匯出函數
async function handleIncomeStatementExport() {
    try {
        // 確保 SheetJS 已載入
        await ensureSheetJSLoaded();
        
        // 執行匯出
        exportIncomeStatementToExcel();
        
        console.log('損益表匯出完成');
    } catch (error) {
        console.error('匯出失敗:', error);
        alert('匯出失敗，請稍後再試');
    }
}

// 綁定匯出按鈕事件
document.addEventListener('DOMContentLoaded', function() {
    // 尋找匯出按鈕並綁定事件
    const exportBtn = document.querySelector('.btn1');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleIncomeStatementExport);
    }
});

// 如果是動態載入內容，也提供手動綁定的方法
function bindIncomeStatementExportButton() {
    const exportBtn = document.querySelector('.btn1');
    if (exportBtn && !exportBtn._exportBound) {
        exportBtn._exportBound = true;
        exportBtn.addEventListener('click', handleIncomeStatementExport);
    }
}