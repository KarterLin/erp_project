
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

// 替換原本的 flatpickr 初始化部分
console.log("flatpickr初始化開始");
flatpickr("#dateRange", {
  locale: "zh",
  dateFormat: "Y-m-d",
  mode: "single",
  allowInput: true,
  maxDate: "today", // 限制只能選擇今天及以前的日期
  defaultDate: "today", // 預設為今天
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length === 1) {
      const dateObj = selectedDates[0];
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      fetchAndRenderTrialBalance(date);
    }
  },
  // 添加驗證功能，防止用戶手動輸入未來日期
  onValueUpdate: function(selectedDates, dateStr, instance) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 設定為今天的最後一刻
    
    if (selectedDates.length > 0 && selectedDates[0] > today) {
      // 如果選擇的日期是未來，重設為今天
      instance.setDate(today, false);
      alert('無法選擇未來日期，已重設為今天');
    }
  }
});
console.log("flatpickr初始化結束");

function fetchAndRenderTrialBalance(date) {
  console.log("fetch資料，日期:", date);
  fetch(`https://127.0.0.1:8443/api/trial-balance/${date}`)
    .then(response => {
      if (!response.ok) throw new Error('取得資料失敗');
      return response.json();
    })
    .then(data => {
      renderTable(data);
    })
    .catch(err => {
      alert(err.message);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().slice(0, 10);
  fetchAndRenderTrialBalance(today);
});


//------------------------------------------------------------------------------------


function renderTable(data) {
  let tbody = document.querySelector(".my-table tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    document.querySelector(".my-table").appendChild(tbody);
  }
  tbody.innerHTML = "";

  data.details.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.accountCode}</td>
      <td>${item.accountName}</td>
      <td>${item.parentId !== undefined && item.parentId !== null ? item.parentId : ''}</td>
      <td><!-- 上期餘額 如果有資料再補 --></td>
      <td>${item.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
    `;
    tbody.appendChild(tr);
  });

  // 如果原本沒 tbody 要插入
  if (!document.querySelector(".my-table tbody")) {
    document.querySelector(".my-table").appendChild(tbody);
  }
  initTableToggle();
}



//-下方為匯出excel功能---
//---------------------------------------------


// 全域變數存儲當前資料和日期
let currentTrialBalanceData = null;
let currentSelectedDate = null;

// 修改你現有的 fetchAndRenderTrialBalance 函數
function fetchAndRenderTrialBalance(date) {
  console.log("fetch資料，日期:", date);
  currentSelectedDate = date; // 儲存當前選擇的日期
  
  fetch(`https://127.0.0.1:8443/api/trial-balance/${date}`)
    .then(response => {
      if (!response.ok) throw new Error('取得資料失敗');
      return response.json();
    })
    .then(data => {
      currentTrialBalanceData = data; // 儲存當前資料
      renderTable(data);
    })
    .catch(err => {
      alert(err.message);
    });
}

// 匯出Excel功能
function exportToExcel() {
  if (!currentTrialBalanceData || !currentTrialBalanceData.details) {
    alert('沒有資料可以匯出，請先選擇日期載入資料');
    return;
  }

  // 準備Excel資料
  const excelData = [];
  
  // 加入標題行
  excelData.push([
    '日期',
    '科目代碼', 
    '會計科目名稱',
    'FIN LEAD REF.',
    '上期餘額',
    '本期餘額'
  ]);

  // 加入資料行
  currentTrialBalanceData.details.forEach(item => {
    excelData.push([
      currentSelectedDate, // 日期
      item.accountCode, // 科目代碼
      item.accountName, // 會計科目名稱
      item.parentId !== undefined && item.parentId !== null ? item.parentId : '', // FIN LEAD REF.
      '', // 上期餘額 (目前為空，如果你的API有提供可以加入)
      item.balance // 本期餘額
    ]);
  });

  // 建立工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // 設定欄位寬度
  const colWidths = [
    { wch: 12 }, // 日期
    { wch: 15 }, // 科目代碼
    { wch: 25 }, // 會計科目名稱
    { wch: 15 }, // FIN LEAD REF.
    { wch: 15 }, // 上期餘額
    { wch: 15 }  // 本期餘額
  ];
  ws['!cols'] = colWidths;

  // 設定數字格式 (金額欄位)
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 1; R <= range.e.r; ++R) { // 從第二行開始 (跳過標題)
    // 上期餘額欄位 (第5欄, index 4)
    const cellAddress4 = XLSX.utils.encode_cell({ r: R, c: 4 });
    if (ws[cellAddress4] && typeof ws[cellAddress4].v === 'number') {
      ws[cellAddress4].z = '#,##0.00';
    }
    
    // 本期餘額欄位 (第6欄, index 5)
    const cellAddress5 = XLSX.utils.encode_cell({ r: R, c: 5 });
    if (ws[cellAddress5] && typeof ws[cellAddress5].v === 'number') {
      ws[cellAddress5].z = '#,##0.00';
    }
  }

  // 加入工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "試算表");

  // 產生檔案名稱
  const fileName = `試算表_${currentSelectedDate}.xlsx`;

  // 匯出檔案
  XLSX.writeFile(wb, fileName);
}

// 在 DOMContentLoaded 事件中綁定匯出按鈕
document.addEventListener("DOMContentLoaded", () => {
  initTableToggle();
  
  // 綁定匯出按鈕事件
  const exportBtn = document.querySelector('.btn1');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToExcel);
  }
  
  // 載入今天的資料
  const today = new Date().toISOString().slice(0, 10);
  fetchAndRenderTrialBalance(today);
});
