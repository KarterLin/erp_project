// 需要get 
// 1.後端 科目編號 為 "accountCode" 
// 2.後端 科目名稱為 "accountName"
// post 出
// 1.入帳日期 在後端為 "entryDate"
// 2.科目編號 在後端為 "accountCode" 
// 3.科目名稱 在後端為 "accountName"
// 4.借方名稱 在後端為 "debit"
// 5.貸方名稱 在後端為 "credit"
// 6.摘要 在後端為 "description"

let accountsData = [];

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
        const response = await fetch('http://localhost:8080/api/accounts');
        if (response.ok) {
            accountsData = await response.json(); // 直接用原始欄位 code, name
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

    populateAllAccountSelects();
    // 為初始行設置事件監聽器
    document.querySelectorAll('.journal-row').forEach(setupRowEvents);
}

// 初始化所有下拉選單選項
function populateAllAccountSelects() {
    document.querySelectorAll('.account-code').forEach(select => {
        if (select.options.length <= 1) { // 只有當選單為空時才填充
            select.innerHTML = '<option value="">請選擇科目編號</option>';
            accountsData.forEach(account => {
                const option = document.createElement('option');
                option.value = account.code;
                option.textContent = account.code;
                select.appendChild(option);
            });
        }
    });

    document.querySelectorAll('.account-name').forEach(select => {
        if (select.options.length <= 1) { // 只有當選單為空時才填充
            select.innerHTML = '<option value="">請選擇科目名稱</option>';
            accountsData.forEach(account => {
                const option = document.createElement('option');
                option.value = account.name;
                option.textContent = account.name;
                select.appendChild(option);
            });
        }
    });
}

// 為單一行設置選項和事件監聽器
function setupRowEvents(row) {
    const codeSelect = row.querySelector('.account-code');
    const nameSelect = row.querySelector('.account-name');
    const debitInput = row.querySelector('.debit-amount');
    const creditInput = row.querySelector('.credit-amount');

    // 填充選項（只有當選單為空時）
    if (codeSelect.options.length <= 1) {
        codeSelect.innerHTML = '<option value="">請選擇科目編號</option>';
        accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.code;
            option.textContent = account.code;
            codeSelect.appendChild(option);
        });
    }

    if (nameSelect.options.length <= 1) {
        nameSelect.innerHTML = '<option value="">請選擇科目名稱</option>';
        accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.name;
            option.textContent = account.name;
            nameSelect.appendChild(option);
        });
    }

    // 設置連動事件（使用標記來避免重複綁定）
    if (!codeSelect.hasAttribute('data-events-bound')) {
        codeSelect.addEventListener('change', () => {
            const matched = accountsData.find(acc => acc.code === codeSelect.value);
            nameSelect.value = matched ? matched.name : '';
        });
        codeSelect.setAttribute('data-events-bound', 'true');
    }

    if (!nameSelect.hasAttribute('data-events-bound')) {
        nameSelect.addEventListener('change', () => {
            const matched = accountsData.find(acc => acc.name === nameSelect.value);
            codeSelect.value = matched ? matched.code : '';
        });
        nameSelect.setAttribute('data-events-bound', 'true');
    }

    // 借方金額輸入時的處理
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

    // 貸方金額輸入時的處理
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

// 刪除不再需要的函數
function handleAccountCodeChange(select) {
    const row = select.closest('tr');
    const nameSelect = row.querySelector('.account-name');
    const selected = accountsData.find(a => a.code == select.value);
    nameSelect.value = selected ? selected.name : '';
}

function handleAccountNameChange(select) {
    const row = select.closest('tr');
    const codeSelect = row.querySelector('.account-code');
    const selected = accountsData.find(a => a.name === select.value);
    codeSelect.value = selected ? selected.code : '';
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
    document.getElementById('total-debit').textContent = totalDebit.toFixed(2);
    document.getElementById('total-credit').textContent = totalCredit.toFixed(2);
    const diffSpan = document.getElementById('balance-diff');
    diffSpan.textContent = diff.toFixed(2);
    diffSpan.style.color = diff === 0 ? 'green' : 'red';
}

function addEntryRow() {
    const table = document.getElementById('entries-table');
    const newRow = table.rows[1].cloneNode(true);

    // 清空新行的輸入值
    Array.from(newRow.querySelectorAll('input')).forEach(i => {
        i.value = '';
        i.disabled = false;
    });
    Array.from(newRow.querySelectorAll('select')).forEach(s => s.selectedIndex = 0);

    // 移除事件綁定標記，這樣新行可以重新綁定事件
    Array.from(newRow.querySelectorAll('select, input')).forEach(element => element.removeAttribute('data-events-bound'));

    const currentRowCount = table.rows.length - 1; // 不含表頭
    if (currentRowCount >= 2) {
        newRow.cells[newRow.cells.length - 1].innerHTML = '<button type="button" class="remove-row">-</button>';
    } else {
        newRow.cells[newRow.cells.length - 1].innerHTML = '';
    }

    table.appendChild(newRow);

    // 為新行設置選項和事件監聽器
    setupRowEvents(newRow);
}

document.getElementById('entries-table').addEventListener('input', function (e) {
    if (e.target.name === 'debit[]' || e.target.name === 'credit[]') {
        updateBalanceSummary();
    }
});

document.getElementById('entries-table').addEventListener('change', function (e) {
    if (e.target.classList.contains('account-code')) handleAccountCodeChange(e.target);
    else if (e.target.classList.contains('account-name')) handleAccountNameChange(e.target);
});

document.getElementById('add-row').onclick = addEntryRow;

document.getElementById('entries-table').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('remove-row')) {
        e.target.closest('tr').remove();
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
        const accountCode = row.querySelector('select[name="accountCode[]"]').value;
        const accountName = row.querySelector('select[name="accountName[]"]').value;
        const debit = row.querySelector('input[name="debit[]"]').value || '0';
        const credit = row.querySelector('input[name="credit[]"]').value || '0';
        const description = row.querySelector('input[name="description[]"]').value;

        if (accountCode && accountName) {
            details.push({
                accountCode: parseInt(accountCode), // 轉換為數字
                debit: parseFloat(debit),
                credit: parseFloat(credit),
                description
            });
        }
    }

    if (details.length === 0) return alert('請至少填寫一筆分錄');

    const totalDebit = details.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = details.reduce((sum, e) => sum + e.credit, 0);
    if (totalDebit !== totalCredit) return alert(`借貸不相符！\n借方總額：${totalDebit}，貸方總額：${totalCredit}`);

    // 構建新的JSON格式
    const journalEntry = {
        entryDate: entryDate,
        details: details
    };

    // 顯示將要發送的JSON格式供檢查
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

