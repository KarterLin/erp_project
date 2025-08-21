function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const pageWrapper = document.querySelector('.page-wrapper');
  const hamburger = document.querySelector('.hamburger');

  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    pageWrapper.classList.remove('shift');
    setTimeout(() => hamburger.classList.remove('hidden'), 300);
  } else {
    sidebar.classList.add('open');
    pageWrapper.classList.add('shift');
    hamburger.classList.add('hidden');
  }
}

// 點擊空白處收起 sidebar
document.addEventListener('click', function (event) {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');
  const pageWrapper = document.querySelector('.page-wrapper');

  const clickedInsideSidebarOrHamburger = sidebar.contains(event.target) || hamburger.contains(event.target);

  if (!clickedInsideSidebarOrHamburger) {
    sidebar.classList.remove('open');
    pageWrapper.classList.remove('shift');

    if (hamburger._showTimeout) {
      clearTimeout(hamburger._showTimeout);
    }

    hamburger._showTimeout = setTimeout(() => {
      hamburger.classList.remove('hidden');
      hamburger._showTimeout = null;
    }, 300);
  }
});

function handleResize() {
  const sidebar = document.querySelector('.sidebar');
  const pageWrapper = document.querySelector('.page-wrapper');
  const hamburger = document.querySelector('.hamburger');

  if (!sidebar || !pageWrapper || !hamburger) return;

  if (window.innerWidth > 768) {
    sidebar.classList.add('open');
    pageWrapper.classList.remove('shift');
    hamburger.classList.add('hidden');
    pageWrapper.style.marginLeft = '';
  } else {
    sidebar.classList.remove('open');
    pageWrapper.classList.remove('shift');
    hamburger.classList.remove('hidden');
  }
}

// 初始化
handleResize();
window.addEventListener('resize', handleResize);

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

  // 重對兩個表格分別初始化
  const tables = document.querySelectorAll('.tableFixHead table');

  tables.forEach(table => {
    table.querySelectorAll('tr.main-row').forEach(mainRow => {
      const groupClass = Array.from(mainRow.classList).find(c => c.startsWith('group'));
      if (groupClass && table.querySelector(`tr.sub-row.${groupClass}`)) {
        const td = mainRow.querySelector('td');
        if (!td) return;

        if (!td.querySelector('.arrow')) {
          const arrow = document.createElement('span');
          arrow.className = 'arrow';
          td.prepend(arrow);
        }

        // 預設展開主列與該表格內對應的子列
        mainRow.classList.add('expanded');
        table.querySelectorAll(`tr.sub-row.${groupClass}`).forEach(sub => {
          sub.classList.add('show');
        });

        if (!mainRow._clickBound) {
          mainRow._clickBound = true;
          mainRow.addEventListener('click', () => {
            mainRow.classList.toggle('expanded');
            table.querySelectorAll(`tr.sub-row.${groupClass}`).forEach(sub => {
              sub.classList.toggle('show');
            });
          });
        }
      }
    });
  });
};

// 若 sidebar 載入完了，立即執行
if (typeof window.onSidebarLoaded === 'function') {
  window.onSidebarLoaded();
}

// 今年年初 YYYY-01-01
const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split('T')[0];

// 今天 YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// 初始化 flatpickr
flatpickr("#dateRange", {
    locale: "zh",
    dateFormat: "Y-m-d",
    allowInput: true,
    defaultDate: today, // 預設今天
    onChange: function (selectedDates, dateStr) {
        if (!dateStr) return;
        loadBalanceSheet(startOfYear, dateStr); // 選日期後重新抓資料
    }
});

// 初始載入：年初 ~ 今天
loadBalanceSheet(startOfYear, today);

// 呼叫 API 並更新表格
function loadBalanceSheet(startDate, endDate) {
    fetch(`http://localhost:8080/api/balance-sheet/summary?startDate=${startDate}&endDate=${endDate}`)
        .then(res => res.json())
        .then(data => {
            updateBalanceSheet(data);
        })
        .catch(console.error);
}

function clearTable() {
  document.querySelectorAll('td[data-parent-id]').forEach(td => {
    const tr = td.parentElement;
    tr.children[2].textContent = '0';
    tr.children[3].textContent = '0%';
  });
}

// 格式化金額（負數用括弧）
function formatAmount(amount) {
    if (amount == null) return '0.00';
    if (amount < 0) {
        return '(' + Math.abs(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ')';
    } else {
        return amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

// 格式化百分比
function formatPercent(percent) {
    if (percent == null) return '0.00%';
    return percent.toFixed(2) + '%';
}

// 更新表格內容
function updateBalanceSheet(data) {
    clearTable();

    if (!Array.isArray(data.details)) return;

    // 計算總額用來算百分比
    const totalAssets = (data.currentAssetsTotal || 0) + (data.nonCurrentAssetsTotal || 0);
    const totalLiabilities = (data.currentLiabilitiesTotal || 0) + (data.nonCurrentLiabilitiesTotal || 0);
    const totalEquity = (data.capitalTotal || 0) + (data.retainedEarningsTotal || 0);

    data.details.forEach(item => {
        const subjectTd = document.querySelector(`td[data-parent-id='${item.parentId}']`);
        if (!subjectTd) return;

        const tr = subjectTd.parentElement;

        // 更新小計欄
        const subtotalTd = tr.children[2];
        subtotalTd.textContent = formatAmount(item.balance);

        // 更新百分比欄
        const percentTd = tr.children[3];
        let percent = 0;

        if (item.parentId >= 1000 && item.parentId < 2000) {
            percent = totalAssets ? (item.balance / totalAssets) * 100 : 0;
        } else if (item.parentId >= 2000 && item.parentId < 3000) {
            percent = totalLiabilities ? (item.balance / totalLiabilities) * 100 : 0;
        } else if (item.parentId >= 3000 && item.parentId < 4000) {
            percent = totalEquity ? (item.balance / totalEquity) * 100 : 0;
        }

        percentTd.textContent = formatPercent(percent);
    });

    // 更新合計欄位
    document.getElementById('currentAssetsTotal').textContent = formatAmount(data.currentAssetsTotal);
    document.getElementById('nonCurrentAssetsTotal').textContent = formatAmount(data.nonCurrentAssetsTotal);
    document.getElementById('totalAssets').textContent = formatAmount(data.totalAssets);

    document.getElementById('currentLiabilitiesTotal').textContent = formatAmount(data.currentLiabilitiesTotal);
    document.getElementById('nonCurrentLiabilitiesTotal').textContent = formatAmount(data.nonCurrentLiabilitiesTotal);
    document.getElementById('totalLiabilities').textContent = formatAmount(data.totalLiabilities);

    document.getElementById('capitalTotal').textContent = formatAmount(data.capitalTotal);
    document.getElementById('retainedEarningsTotal').textContent = formatAmount(data.retainedEarningsTotal);
    document.getElementById('totalEquity').textContent = formatAmount(data.totalEquity);
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

// 添加會計科目資料
function addAccountData(data, accounts) {
    accounts.forEach(account => {
        const td = document.querySelector(`td[data-parent-id='${account.id}']`);
        if (td) {
            const tr = td.parentElement;
            const amount = tr.children[2].textContent;
            const percent = tr.children[3].textContent;
            data.push(['', account.name, amount, percent]);
        } else {
            data.push(['', account.name, '0', '0%']);
        }
    });
}

// 準備資產負債表資料
function prepareBalanceSheetData(startDate, endDate) {
    const data = [];
    
    // 修正顯示日期：將開始日期加一天用於顯示
    const displayStartDate = new Date(startDate);
    displayStartDate.setDate(displayStartDate.getDate() + 1);
    const displayStartStr = displayStartDate.toISOString().split('T')[0];
    
    // 標題行 - 使用修正後的日期顯示
    data.push([`資產負債表 (${displayStartStr} 至 ${endDate})`]);
    data.push([]); // 空行
    
    // 表頭
    data.push(['項目名稱', '會計科目', '小計', '百分比']);
    
    // 資產部分
    data.push(['資產', '', '', '']);
    
    // 流動資產
    data.push(['流動資產', '', '', '']);
    addAccountData(data, [
        { id: '1100', name: '現金及約當現金' },
        { id: '1132', name: '按攤銷後成本衡量之金融資產-流動' },
        { id: '1150', name: '應收票據' },
        { id: '1170', name: '應收帳款' },
        { id: '1180', name: '應收帳款-關係人' },
        { id: '1210', name: '其他應收款-關係人淨額' },
        { id: '1220', name: '本期所得稅資產' },
        { id: '1300', name: '存貨' },
        { id: '1410', name: '預付款項' }
    ]);
    
    // 流動資產合計
    const currentAssetsTotal = document.getElementById('currentAssetsTotal').textContent;
    data.push(['流動資產合計', '', currentAssetsTotal, '']);
    data.push([]); // 空行
    
    // 非流動資產
    data.push(['非流動資產', '', '', '']);
    addAccountData(data, [
        { id: '1600', name: '不動產、廠房及設備' },
        { id: '1780', name: '無形資產' },
        { id: '1840', name: '遞延所得稅資產' },
        { id: '1900', name: '其他非流動資產' }
    ]);
    
    // 非流動資產合計
    const nonCurrentAssetsTotal = document.getElementById('nonCurrentAssetsTotal').textContent;
    data.push(['非流動資產合計', '', nonCurrentAssetsTotal, '']);
    
    // 資產合計
    const totalAssets = document.getElementById('totalAssets').textContent;
    data.push(['資產合計', '', totalAssets, '']);
    data.push([]); // 空行
    
    // 負債部分
    data.push(['負債', '', '', '']);
    
    // 流動負債
    data.push(['流動負債', '', '', '']);
    addAccountData(data, [
        { id: '2100', name: '銀行借款' },
        { id: '2170', name: '應付帳款' },
        { id: '2200', name: '其他應付款' },
        { id: '2220', name: '其他應付款-關係人' },
        { id: '2300', name: '其他流動負債' }
    ]);
    
    // 流動負債合計
    const currentLiabilitiesTotal = document.getElementById('currentLiabilitiesTotal').textContent;
    data.push(['流動負債合計', '', currentLiabilitiesTotal, '']);
    data.push([]); // 空行
    
    // 非流動負債
    data.push(['非流動負債', '', '', '']);
    addAccountData(data, [
        { id: '2540', name: '長期借款' },
        { id: '2570', name: '遞延所得稅負債' },
        { id: '2600', name: '其他非流動負債' }
    ]);
    
    // 非流動負債合計
    const nonCurrentLiabilitiesTotal = document.getElementById('nonCurrentLiabilitiesTotal').textContent;
    data.push(['非流動負債合計', '', nonCurrentLiabilitiesTotal, '']);
    
    // 負債合計
    const totalLiabilities = document.getElementById('totalLiabilities').textContent;
    data.push(['負債合計', '', totalLiabilities, '']);
    data.push([]); // 空行
    
    // 股東權益部分
    data.push(['股東權益', '', '', '']);
    
    // 股本
    data.push(['股本', '', '', '']);
    addAccountData(data, [
        { id: '3100', name: '股本' }
    ]);
    
    // 股本合計
    const capitalTotal = document.getElementById('capitalTotal').textContent;
    data.push(['股本合計', '', capitalTotal, '']);
    data.push([]); // 空行
    
    // 保留盈餘
    data.push(['保留盈餘', '', '', '']);
    addAccountData(data, [
        { id: '3300', name: '保留盈餘及累積盈虧' },
        { id: '3600', name: '本期盈餘及盈虧' },
        { id: '3310', name: '法定盈餘公積' }
    ]);
    
    // 保留盈餘合計
    const retainedEarningsTotal = document.getElementById('retainedEarningsTotal').textContent;
    data.push(['保留盈餘合計', '', retainedEarningsTotal, '']);
    
    // 股東權益合計
    const totalEquity = document.getElementById('totalEquity').textContent;
    data.push(['股東權益合計', '', totalEquity, '']);
    
    return data;
}

// 匯出 Excel 功能
function exportBalanceSheetToExcel() {
    // 獲取當前日期範圍
    const dateInput = document.getElementById('dateRange');
    const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    
    // 創建工作簿
    const wb = XLSX.utils.book_new();
    
    // 準備資料
    const data = prepareBalanceSheetData(startOfYear, selectedDate);
    
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
    XLSX.utils.book_append_sheet(wb, ws, '資產負債表');
    
    // 生成檔案名稱
    const fileName = `資產負債表_${startOfYear}_${selectedDate}.xlsx`;
    
    // 匯出檔案
    XLSX.writeFile(wb, fileName);
}

// 主要匯出函數
async function handleBalanceSheetExport() {
    try {
        // 確保 SheetJS 已載入
        await ensureSheetJSLoaded();
        
        // 執行匯出
        exportBalanceSheetToExcel();
        
        console.log('資產負債表匯出完成');
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
        exportBtn.addEventListener('click', handleBalanceSheetExport);
    }
});

// 如果是動態載入內容，也提供手動綁定的方法
function bindBalanceSheetExportButton() {
    const exportBtn = document.querySelector('.btn1');
    if (exportBtn && !exportBtn._exportBound) {
        exportBtn._exportBound = true;
        exportBtn.addEventListener('click', handleBalanceSheetExport);
    }
}