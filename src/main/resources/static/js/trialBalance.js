
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

console.log("flatpickr初始化開始");
flatpickr("#dateRange", {
  locale: "zh",
  dateFormat: "Y-m-d",
  mode: "single", // 如果你只用單一天；若要區間改成 "range"
  allowInput: true,
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length === 1) {
    const dateObj = selectedDates[0];
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    fetchAndRenderTrialBalance(date);
    }
  }
});
console.log("flatpickr初始化結束");

function fetchAndRenderTrialBalance(date) {
  console.log("fetch資料，日期:", date);
  fetch(`http://localhost:8080/api/trial-balance/${date}`)
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
      <td>${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    `;
    tbody.appendChild(tr);
  });

  // 如果原本沒 tbody 要插入
  if (!document.querySelector(".my-table tbody")) {
    document.querySelector(".my-table").appendChild(tbody);
  }
  initTableToggle();
}

