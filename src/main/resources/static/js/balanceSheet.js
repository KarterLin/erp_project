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

  // 針對兩個表格分別初始化
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
