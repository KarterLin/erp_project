function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function setDefaultDates() {
  const dateInput = document.getElementById('openDate');
  if (!dateInput.value) dateInput.value = getCurrentDate();
}

class AccountSelector {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.dropdown = inputElement.nextElementSibling;
    this.accounts = options.accounts || [];
    this.onSelect = options.onSelect || (() => { });
    this.searchType = options.searchType || 'both'; // 'code', 'name', 'both'
    this.placeholder = options.placeholder || '輸入科目代碼或名稱搜尋...';

    this.selectedAccount = null;
    this.filteredAccounts = [...this.accounts];
    this.highlightedIndex = -1;

    this.init();
  }

  init() {
    this.input.placeholder = this.placeholder;
    this.bindEvents();
    this.renderDropdown();
  }

  bindEvents() {
    this.input.addEventListener('input', (e) => {
      this.handleInput(e.target.value);
    });

    this.input.addEventListener('focus', () => {
      this.showDropdown();
    });

    this.input.addEventListener('blur', () => {
      setTimeout(() => {
        this.hideDropdown();
      }, 150);
    });

    this.input.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });

    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  handleInput(value) {
    this.filterAccounts(value);
    this.renderDropdown();
    this.showDropdown();
    this.highlightedIndex = -1;
  }

  filterAccounts(searchValue) {
    if (!searchValue.trim()) {
      this.filteredAccounts = [...this.accounts];
      return;
    }

    const search = searchValue.toLowerCase();
    this.filteredAccounts = this.accounts.filter(account => {
      switch (this.searchType) {
        case 'code':
          return account.code.toLowerCase().includes(search);
        case 'name':
          return account.name.toLowerCase().includes(search);
        case 'both':
        default:
          return account.code.toLowerCase().includes(search) ||
            account.name.toLowerCase().includes(search);
      }
    });
  }

  renderDropdown() {
    this.dropdown.innerHTML = '';

    if (this.filteredAccounts.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'noResults';
      noResults.textContent = '查無相符的科目';
      this.dropdown.appendChild(noResults);
      return;
    }

    this.filteredAccounts.forEach((account, index) => {
      const option = document.createElement('div');
      option.className = 'accountOption';
      option.textContent = `${account.code} - ${account.name}`;
      option.dataset.index = index;
      option.dataset.code = account.code;
      option.dataset.name = account.name;

      option.addEventListener('click', () => {
        this.selectAccount(account);
      });

      this.dropdown.appendChild(option);
    });
  }

  handleKeydown(e) {
    if (!this.dropdown.classList.contains('show')) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.highlightNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightPrevious();
        break;
      case 'Enter':
        e.preventDefault();
        this.selectHighlighted();
        break;
      case 'Escape':
        this.hideDropdown();
        break;
    }
  }

  highlightNext() {
    this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredAccounts.length - 1);
    this.updateHighlight();
  }

  highlightPrevious() {
    this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
    this.updateHighlight();
  }

  updateHighlight() {
    const options = this.dropdown.querySelectorAll('.account-option');
    options.forEach((option, index) => {
      option.classList.toggle('highlighted', index === this.highlightedIndex);
    });

    if (this.highlightedIndex >= 0) {
      const highlightedOption = options[this.highlightedIndex];
      highlightedOption.scrollIntoView({ block: 'nearest' });
    }
  }

  selectHighlighted() {
    if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredAccounts.length) {
      this.selectAccount(this.filteredAccounts[this.highlightedIndex]);
    }
  }

  selectAccount(account) {
    this.selectedAccount = account;

    this.input.value = `${account.code} - ${account.name}`;

    this.hideDropdown();
    this.onSelect(account);
  }

  showDropdown() {
    this.dropdown.classList.add('show');
  }

  hideDropdown() {
    this.dropdown.classList.remove('show');
    this.highlightedIndex = -1;
    this.updateHighlight();
  }

  getSelectedAccount() {
    return this.selectedAccount;
  }

  clear() {
    this.input.value = '';
    this.selectedAccount = null;
    this.filteredAccounts = [...this.accounts];
    this.hideDropdown();
  }

  setValue(code, name) {
    const account = this.accounts.find(a => a.code === code || a.name === name);
    if (account) {
      this.selectAccount(account);
    }
  }

  updateAccounts(newAccounts) {
    this.accounts = newAccounts;
    this.filteredAccounts = [...newAccounts];
    this.renderDropdown();
  }
}

let accountsData = [];
let accountSelectors = new Map(); // 存儲每個輸入框對應的選擇器

async function loadAccountsData() {
  try {
    const response = await fetch('https://127.0.0.1:8443/api/accounts');
    if (response.ok) {
      accountsData = await response.json();
    } else {
      throw new Error();
    }
  } catch {
    accountsData = [
      { code: "1001000", name: '現金' },
      { code: "1002000", name: '銀行存款' },
      { code: "2001000", name: '應付帳款' },
      { code: "3001000", name: '資本' },
      { code: "4001000", name: '銷貨收入' },
      { code: "5001000", name: '銷貨成本' }
    ];
  }

  initializeAccountSelectors();
}

function initializeAccountSelectors() {
  document.querySelectorAll('.journalRow').forEach(row => {
    setupRowAccountSelectors(row);
  });
}

function setupRowAccountSelectors(row) {
  const codeInput = row.querySelector('.accountInput');
  if (!codeInput) return;
  if (accountSelectors.has(codeInput)) {
    accountSelectors.delete(codeInput);
  }

  const codeSelector = new AccountSelector(codeInput, {
    accounts: accountsData,
    searchType: 'both',
    placeholder: '輸入科目編號或名稱搜尋...',
    onSelect: (account) => {
      codeInput.value = `${account.code} - ${account.name}`;
    }
  });

  accountSelectors.set(codeInput, codeSelector);

}


function addDebitRow() {
  const table = document.getElementById('entriesTable');
  const templateRow = table.querySelector('.journalRow');
  const newRow = templateRow.cloneNode(true);

  Array.from(newRow.querySelectorAll('input')).forEach(i => {
    i.value = '';
    i.disabled = false;
    i.style.backgroundColor = '';
  });

  const addButtonRow = table.querySelector('tr td .addDebitRow')?.closest('tr');

  table.tBodies[0].insertBefore(newRow, addButtonRow);

  setupRowAccountSelectors(newRow);
}

function addCreditRow() {
  const table = document.getElementById('entriesTable');
  const templateRow = table.querySelector('.journalRow');
  const newRow = templateRow.cloneNode(true);

  Array.from(newRow.querySelectorAll('input')).forEach(i => {
    i.value = '';
    i.disabled = false;
    i.style.backgroundColor = '';
  });

  const addButtonRow = table.querySelector('tr td .addCreditRow')?.closest('tr');

  table.tBodies[0].insertBefore(newRow, addButtonRow);

  setupRowAccountSelectors(newRow);
}


document.getElementById('submitBtn').addEventListener('click', async function () {
  const entryDate = document.getElementById('openDate').value;
  const details = [];
  const rows = document.querySelectorAll('#entriesTable tr.journalRow');

  rows.forEach(row => {
    const codeInput = row.querySelector('.accountInput');
    const debit = parseFloat(row.querySelector('input[name="debitAmount"]')?.value || '0');
    const credit = parseFloat(row.querySelector('input[name="creditAmount"]')?.value || '0');

    const codeSelector = accountSelectors.get(codeInput);
    const selectedAccount = codeSelector ? codeSelector.getSelectedAccount() : null;

    if (selectedAccount) {
      details.push({
        accountCode: parseInt(selectedAccount.code),
        debit: debit,
        credit: credit
      });
    }
     });
    if (details.length === 0) return alert('請至少填寫一筆分錄');

    const totalDebit = details.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = details.reduce((sum, e) => sum + e.credit, 0);
    if (totalDebit !== totalCredit) return alert(`借貸不相符！\n借方總額：${totalDebit}，貸方總額：${totalCredit}`);

    const journalEntry = {
      entryDate: entryDate,
      details: details
    };

    console.log('將要發送的JSON格式:', JSON.stringify(journalEntry, null, 2));

    try {
      const res = await fetch('https://127.0.0.1:8443/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalEntry)
      });
      if (res.ok) {
        alert('分錄已成功提交！');
        this.reset();
        setDefaultDates();
        // 重新初始化選擇器
        accountSelectors.clear();
        initializeAccountSelectors();
        updateBalanceSummary();
      } else {
        alert('提交失敗，請重試');
      }
    } catch (err) {
      console.error(err);
      alert('提交時發生錯誤，請重試');
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    setDefaultDates();
    loadAccountsData();
  });