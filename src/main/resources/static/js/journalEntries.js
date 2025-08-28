// AccountSelector 類別 - 科目選擇器
class AccountSelector {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.dropdown = inputElement.nextElementSibling;
        this.accounts = options.accounts || [];
        this.onSelect = options.onSelect || (() => {});
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
        // 輸入事件
        this.input.addEventListener('input', (e) => {
            this.handleInput(e.target.value);
        });
        
        // 聚焦事件
        this.input.addEventListener('focus', () => {
            this.showDropdown();
        });
        
        // 失焦事件
        this.input.addEventListener('blur', (e) => {
            setTimeout(() => {
                this.hideDropdown();
            }, 150);
        });
        
        // 鍵盤事件
        this.input.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 點擊下拉選單外部
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
            noResults.className = 'no-results';
            noResults.textContent = '查無相符的科目';
            this.dropdown.appendChild(noResults);
            return;
        }
        
        this.filteredAccounts.forEach((account, index) => {
            const option = document.createElement('div');
            option.className = 'account-option';
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
        
        switch (this.searchType) {
            case 'code':
                this.input.value = account.code;
                break;
            case 'name':
                this.input.value = account.name;
                break;
            case 'both':
            default:
                this.input.value = `${account.code} - ${account.name}`;
                break;
        }
        
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

// 全域變數
let accountsData = [];
let accountSelectors = new Map(); // 存儲每個輸入框對應的選擇器

function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function setDefaultDates() {
    const dateInput = document.getElementById('entry-date');
    if (!dateInput.value) dateInput.value = getCurrentDate();
}

async function loadAccountsData() {
    try {
        const response = await fetch('http://127.0.0.1:8443/api/accounts');
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

    // 為現有的輸入框設置科目選擇器
    initializeAccountSelectors();
}

function initializeAccountSelectors() {
    // 為所有現有的科目輸入框初始化選擇器
    document.querySelectorAll('.journal-row').forEach(row => {
        setupRowAccountSelectors(row);
    });
}

function setupRowAccountSelectors(row) {
    const codeInput = row.querySelector('.account-code-input');
    const nameInput = row.querySelector('.account-name-input');
    
    if (!codeInput || !nameInput) return;
    
    // 如果已經初始化過，先清除
    if (accountSelectors.has(codeInput)) {
        accountSelectors.delete(codeInput);
    }
    if (accountSelectors.has(nameInput)) {
        accountSelectors.delete(nameInput);
    }
    
    // 創建科目代碼選擇器
    const codeSelector = new AccountSelector(codeInput, {
        accounts: accountsData,
        searchType: 'code',
        placeholder: '搜尋科目編號...',
        onSelect: (account) => {
            nameInput.value = account.name;
            const nameSelector = accountSelectors.get(nameInput);
            if (nameSelector) {
                nameSelector.selectedAccount = account;
            }
        }
    });
    
    // 創建科目名稱選擇器
    const nameSelector = new AccountSelector(nameInput, {
        accounts: accountsData,
        searchType: 'name',
        placeholder: '搜尋科目名稱...',
        onSelect: (account) => {
            codeInput.value = account.code;
            codeSelector.selectedAccount = account;
        }
    });
    
    // 儲存選擇器引用
    accountSelectors.set(codeInput, codeSelector);
    accountSelectors.set(nameInput, nameSelector);
    
    // 設置借貸金額的互斥邏輯
    const debitInput = row.querySelector('.debit-amount');
    const creditInput = row.querySelector('.credit-amount');
    
    if (debitInput && creditInput) {
        setupAmountInputs(debitInput, creditInput);
    }
}

function setupAmountInputs(debitInput, creditInput) {
    // 移除可能存在的事件監聽器標記
    debitInput.removeAttribute('data-events-bound');
    creditInput.removeAttribute('data-events-bound');
    
    if (!debitInput.hasAttribute('data-events-bound')) {
        debitInput.addEventListener('input', () => {
            if (debitInput.value && parseFloat(debitInput.value) > 0) {
                creditInput.disabled = true;
                creditInput.value = '0';
                creditInput.style.backgroundColor = '#f5f5f5';
            } else {
                creditInput.disabled = false;
                creditInput.style.backgroundColor = '';
            }
            updateBalanceSummary();
        });
        debitInput.setAttribute('data-events-bound', 'true');
    }

    if (!creditInput.hasAttribute('data-events-bound')) {
        creditInput.addEventListener('input', () => {
            if (creditInput.value && parseFloat(creditInput.value) > 0) {
                debitInput.disabled = true;
                debitInput.value = '0';
                debitInput.style.backgroundColor = '#f5f5f5';
            } else {
                debitInput.disabled = false;
                debitInput.style.backgroundColor = '';
            }
            updateBalanceSummary();
        });
        creditInput.setAttribute('data-events-bound', 'true');
    }
}

function formatAmount(num) {
    return num.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    });
}

function updateBalanceSummary() {
    let totalDebit = 0;
    let totalCredit = 0;

    document.querySelectorAll('input[name="debit[]"]').forEach(input => {
        totalDebit += parseFloat(input.value || '0');
    });

    document.querySelectorAll('input[name="credit[]"]').forEach(input => {
        totalCredit += parseFloat(input.value || '0');
    });

    const diff = totalDebit - totalCredit;

    document.getElementById('total-debit').textContent = formatAmount(totalDebit);
    document.getElementById('total-credit').textContent = formatAmount(totalCredit);

    const diffSpan = document.getElementById('balance-diff');
    diffSpan.textContent = formatAmount(diff);
    diffSpan.style.color = diff === 0 ? 'green' : 'red';
}

function addEntryRow() {
    const table = document.getElementById('entries-table');
    const newRow = table.rows[1].cloneNode(true);

    // 清空新行的輸入值
    Array.from(newRow.querySelectorAll('input')).forEach(i => {
        i.value = '';
        i.disabled = false;
        i.style.backgroundColor = '';
        i.removeAttribute('data-events-bound');
    });

    const currentRowCount = table.rows.length - 1;
    if (currentRowCount >= 2) {
        newRow.cells[newRow.cells.length - 1].innerHTML = '<button type="button" class="remove-row">-</button>';
    } else {
        newRow.cells[newRow.cells.length - 1].innerHTML = '';
    }

    table.appendChild(newRow);

    // 為新行設置科目選擇器
    setupRowAccountSelectors(newRow);
}

// 事件監聽器
document.getElementById('add-row').onclick = addEntryRow;

document.getElementById('entries-table').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('remove-row')) {
        const row = e.target.closest('tr');
        
        // 清理該行的選擇器
        const codeInput = row.querySelector('.account-code-input');
        const nameInput = row.querySelector('.account-name-input');
        
        if (accountSelectors.has(codeInput)) {
            accountSelectors.delete(codeInput);
        }
        if (accountSelectors.has(nameInput)) {
            accountSelectors.delete(nameInput);
        }
        
        row.remove();
        updateBalanceSummary();
    }
});

document.getElementById('journal-entry-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const entryDate = document.getElementById('entry-date').value;
    const details = [];
    const rows = document.querySelectorAll('#entries-table tr');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const codeInput = row.querySelector('.account-code-input');
        const nameInput = row.querySelector('.account-name-input');
        const debit = row.querySelector('input[name="debit[]"]').value || '0';
        const credit = row.querySelector('input[name="credit[]"]').value || '0';
        const description = row.querySelector('input[name="description[]"]').value;

        // 獲取選中的科目
        const codeSelector = accountSelectors.get(codeInput);
        const selectedAccount = codeSelector ? codeSelector.getSelectedAccount() : null;
        
        if (selectedAccount) {
            details.push({
                accountCode: parseInt(selectedAccount.code),
                debit: parseFloat(debit),
                credit: parseFloat(credit),
                description
            });
        } else if (codeInput.value && nameInput.value) {
            // 如果沒有通過選擇器選擇，但有輸入值，嘗試匹配
            const matchedAccount = accountsData.find(a => 
                a.code === codeInput.value || a.name === nameInput.value
            );
            if (matchedAccount) {
                details.push({
                    accountCode: parseInt(matchedAccount.code),
                    debit: parseFloat(debit),
                    credit: parseFloat(credit),
                    description
                });
            }
        }
    }

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
        const res = await fetch('http://localhost:8080/api/journal-entries', {
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
    addEntryRow(); // 新增第二筆
    updateBalanceSummary();
});