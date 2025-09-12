document.addEventListener("DOMContentLoaded", function () {
  const headers = document.querySelectorAll(".accordion-header");
  let accounts = [];
  let currentDeleteId = null;

  // 父科目選項按類型分類
  const parentSubjectsByType = {
    asset: {
      label: '資產',
      options: [
        { group: '流動資產', items: [
          { id: '1100', name: '現金及約當現金' },
          { id: '1132', name: '按攤銷後成本衡量之金融資產-流動' },
          { id: '1150', name: '應收票據' },
          { id: '1170', name: '應收帳款' },
          { id: '1180', name: '應收帳款-關係人' },
          { id: '1210', name: '其他應收款-關係人淨額' },
          { id: '1220', name: '本期所得稅資產' },
          { id: '1300', name: '存貨' },
          { id: '1410', name: '預付款項' }
        ]},
        { group: '非流動資產', items: [
          { id: '1600', name: '不動產、廠房及設備' },
          { id: '1780', name: '無形資產' },
          { id: '1840', name: '遞延所得稅資產' },
          { id: '1900', name: '其他非流動資產' }
        ]}
      ]
    },
    liability: {
      label: '負債',
      options: [
        { group: '流動負債', items: [
          { id: '2100', name: '銀行借款' },
          { id: '2170', name: '應付帳款' },
          { id: '2200', name: '其他應付款' },
          { id: '2220', name: '其他應付款-關係人' },
          { id: '2300', name: '其他流動負債' }
        ]},
        { group: '非流動負債', items: [
          { id: '2540', name: '長期借款' },
          { id: '2570', name: '遞延所得稅負債' },
          { id: '2600', name: '其他非流動負債' }
        ]}
      ]
    },
    equity: {
      label: '股東權益',
      options: [
        { group: '股本', items: [
          { id: '3100', name: '股本' }
        ]},
        { group: '保留盈餘', items: [
          { id: '3300', name: '保留盈餘及累積盈虧' },
          { id: '3600', name: '本期盈餘及盈虧' },
          { id: '3310', name: '法定盈餘公積' }
        ]}
      ]
    },
    revenue: {
      label: '營業收入',
      options: [
        { group: '', items: [
          { id: '4000', name: '營業收入' }
        ]}
      ]
    },
    cost: {
      label: '營業成本',
      options: [
        { group: '', items: [
          { id: '5000', name: '營業成本' }
        ]}
      ]
    },
    expense: {
      label: '營業費用',
      options: [
        { group: '', items: [
          { id: '6100', name: '推銷費用' },
          { id: '6200', name: '管理費用' },
          { id: '6300', name: '研究發展費用' },
          { id: '7950', name: '所得稅費用' },
          { id: '7100', name: '其他收入' },
          { id: '7230', name: '其他利益及損失' },
          { id: '7050', name: '財務成本' }
        ]}
      ]
    }
  };

  // 父科目對照表
  const parentSubjectMap = {
    '1100': '現金及約當現金',
    '1132': '按攤銷後成本衡量之金融資產-流動',
    '1150': '應收票據',
    '1170': '應收帳款',
    '1180': '應收帳款-關係人',
    '1210': '其他應收款-關係人淨額',
    '1220': '本期所得稅資產',
    '1300': '存貨',
    '1410': '預付款項',
    '1600': '不動產、廠房及設備',
    '1780': '無形資產',
    '1840': '遞延所得稅資產',
    '1900': '其他非流動資產',
    '2100': '銀行借款',
    '2170': '應付帳款',
    '2200': '其他應付款',
    '2220': '其他應付款-關係人',
    '2300': '其他流動負債',
    '2540': '長期借款',
    '2570': '遞延所得稅負債',
    '2600': '其他非流動負債',
    '3100': '股本',
    '3300': '保留盈餘及累積盈虧',
    '3600': '本期盈餘及盈虧',
    '3310': '法定盈餘公積',
    '4000': '營業收入',
    '5000': '營業成本',
    '6100': '推銷費用',
    '6200': '管理費用',
    '6300': '研究發展費用',
    '7950': '所得稅費用',
    '7100': '其他收入',
    '7230': '其他利益及損失',
    '7050': '財務成本'
  };

  // 摺疊效果
  headers.forEach(header => {
    header.addEventListener("click", function () {
      const item = this.parentElement;
      item.classList.toggle("active");
    });
  });

  // Modal 元素
  const addModal = document.getElementById('addSubjectModal');
  const deleteModal = document.getElementById('deleteConfirmModal');
  const addBtn = document.getElementById('addSubjectBtn');
  const addCloseBtn = addModal.querySelector('.close');
  const cancelAddBtn = document.getElementById('cancelSubjectBtn');
  const saveBtn = document.getElementById('saveSubjectBtn');
  
  const deleteCloseBtn = deleteModal.querySelector('.close');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  // 科目類型變更事件 - 聯動父科目選項
  document.getElementById('subjectType').addEventListener('change', function() {
    const selectedType = this.value;
    const parentSelect = document.getElementById('parentSelect');
    
    // 清空父科目選項
    parentSelect.innerHTML = '<option value="">請選擇父科目</option>';
    
    if (selectedType && parentSubjectsByType[selectedType]) {
      const typeData = parentSubjectsByType[selectedType];
      
      typeData.options.forEach(groupData => {
        if (groupData.group) {
          // 有群組標題
          const optgroup = document.createElement('optgroup');
          optgroup.label = groupData.group;
          
          groupData.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.id} - ${item.name}`;
            optgroup.appendChild(option);
          });
          
          parentSelect.appendChild(optgroup);
        } else {
          // 沒有群組標題，直接加入選項
          groupData.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.id} - ${item.name}`;
            parentSelect.appendChild(option);
          });
        }
      });
    }
  });

  // 新增科目 Modal 事件
  addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    addModal.style.display = 'block';
  });

  addCloseBtn.addEventListener('click', function () {
    clearForm();
    addModal.style.display = 'none';
  });

  cancelAddBtn.addEventListener('click', function () {
    clearForm();
    addModal.style.display = 'none';
  });

  // 刪除確認 Modal 事件
  deleteCloseBtn.addEventListener('click', function () {
    deleteModal.style.display = 'none';
  });

  cancelDeleteBtn.addEventListener('click', function () {
    deleteModal.style.display = 'none';
  });

  // 點擊外部關閉 Modal
  window.addEventListener('click', function (e) {
    if (e.target === addModal) {
      clearForm();
      addModal.style.display = 'none';
    }
    if (e.target === deleteModal) {
      deleteModal.style.display = 'none';
    }
  });

  // 儲存科目
  saveBtn.addEventListener('click', function() {
    const code = document.getElementById('subjectCode').value.trim();
    const name = document.getElementById('subjectName').value.trim();
    const type = document.getElementById('subjectType').value;
    const parentId = document.getElementById('parentSelect').value;

    if (!code || !name || !type || !parentId) {
      alert('請填寫所有必填欄位');
      return;
    }

    // 將成本類型轉換為expense，因為後端只有這5種類型
    const backendType = type === 'cost' ? 'expense' : type;

    const newAccount = {
      code: code,
      name: name,
      type: backendType,
      parentId: parentId,
      isActive: true
    };

    saveAccount(newAccount);
  });

  // 確認刪除
  confirmDeleteBtn.addEventListener('click', function() {
    if (currentDeleteId) {
      deleteAccount(currentDeleteId);
    }
  });

  // API 調用函數
  async function loadAccounts() {
    try {
      const response = await fetch('https://127.0.0.1:8443/api/accounts');
      const data = await response.json();
      accounts = data;
      displayAccounts(accounts);
    } catch (error) {
      console.error('載入科目失敗:', error);
      alert('載入科目失敗，請檢查網路連線');
    }
  }

  async function saveAccount(account) {
    try {
      const response = await fetch('https://127.0.0.1:8443/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(account)
      });

      if (response.ok) {
        alert('科目新增成功');
        clearForm();
        addModal.style.display = 'none';
        loadAccounts(); // 重新載入科目列表
      } else {
        const errorText = await response.text();
        alert('新增失敗: ' + errorText);
      }
    } catch (error) {
      console.error('新增科目失敗:', error);
      alert('新增科目失敗，請檢查網路連線');
    }
  }

  async function deleteAccount(id) {
    try {
      const response = await fetch(`https://127.0.0.1:8443/api/accounts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('科目刪除成功');
        deleteModal.style.display = 'none';
        currentDeleteId = null;
        loadAccounts(); // 重新載入科目列表
      } else {
        const errorText = await response.text();
        alert('刪除失敗: ' + errorText);
      }
    } catch (error) {
      console.error('刪除科目失敗:', error);
      alert('刪除科目失敗，請檢查網路連線');
    }
  }

  // 顯示科目
  function displayAccounts(accounts) {
    const assetList = document.getElementById('asset-list');
    const liabilityList = document.getElementById('liability-list');
    const equityList = document.getElementById('equity-list');
    const revenueList = document.getElementById('revenue-list');
    const costList = document.getElementById('cost-list');
    const expenseList = document.getElementById('expense-list');

    // 清空列表
    assetList.innerHTML = '';
    liabilityList.innerHTML = '';
    equityList.innerHTML = '';
    revenueList.innerHTML = '';
    costList.innerHTML = '';
    expenseList.innerHTML = '';

    accounts.forEach(account => {
      const li = createAccountListItem(account);
      
      // 根據科目代碼和類型進行分類
      if (account.type === 'asset') {
        assetList.appendChild(li);
      } else if (account.type === 'liability') {
        liabilityList.appendChild(li);
      } else if (account.type === 'equity') {
        equityList.appendChild(li);
      } else if (account.type === 'revenue') {
        revenueList.appendChild(li);
      } else if (account.type === 'expense') {
        // 根據科目代碼區分成本和費用
        if (isCostAccount(account.code)) {
          costList.appendChild(li);
        } else {
          expenseList.appendChild(li);
        }
      }
    });
  }

  // 判斷是否為成本科目（科目代碼以5開頭）
  function isCostAccount(code) {
    return code && code.startsWith('5');
  }

  function createAccountListItem(account) {
    const li = document.createElement('li');
    li.className = 'account-item';
    
    // 顯示類型時，區分成本和費用
    let displayType = getTypeDisplay(account.type);
    if (account.type === 'expense' && isCostAccount(account.code)) {
      displayType = '成本';
    }
    
    // 取得父科目名稱
    const parentName = parentSubjectMap[account.parentId] || '';
    const parentDisplay = parentName ? ` (${parentName})` : '';
    
    li.innerHTML = `
      <span class="account-info">
        <span class="account-code">${account.code}</span>
        <span class="account-name">${account.name}</span>
        <span class="account-type">[${displayType}]</span>
        <span class="parent-info">父科目ID: ${account.parentId || '無'}${parentDisplay}</span>
      </span>
      <button class="delete-btn" onclick="showDeleteConfirm(${account.id}, '${account.name.replace(/'/g, "\\'")}')">刪除</button>
    `;
    return li;
  }

  function getTypeDisplay(type) {
    const typeMap = {
      'asset': '資產',
      'liability': '負債',
      'equity': '權益',
      'revenue': '收入',
      'expense': '費用'
    };
    return typeMap[type] || type;
  }

  // 全域函數供 HTML 調用
  window.showDeleteConfirm = function(id, name) {
    currentDeleteId = id;
    document.getElementById('deleteSubjectName').textContent = name;
    deleteModal.style.display = 'block';
  };

  // 清空表單
  function clearForm() {
    document.getElementById('subjectCode').value = '';
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectType').value = '';
    document.getElementById('parentSelect').innerHTML = '<option value="">請選擇父科目</option>';
  }

  // 初始載入
  loadAccounts();
});