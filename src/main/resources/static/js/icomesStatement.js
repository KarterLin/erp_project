
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
// 初始化


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