// subsidiaryLedger.js - 修正版本，參考 entriesManagement.js 的實現

// AccountSelector 類別 - 科目選擇器（從 entriesManagement.js 複製）
class AccountSelector {
    constructor(inputElement, options = {}) {
        this.input = inputElement;
        this.dropdown = inputElement.nextElementSibling;
        this.accounts = options.accounts || [];
        this.onSelect = options.onSelect || (() => {});
        this.searchType = options.searchType || 'both'; // 'code', 'name', 'both'
        this.placeholder = options.placeholder || '搜尋科目代碼或名稱...';
        
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
        
        // 如果輸入為空，清除選中的科目
        if (!value.trim()) {
            this.selectedAccount = null;
        }
    }
    
    filterAccounts(searchValue) {
        if (!searchValue.trim()) {
            this.filteredAccounts = [...this.accounts];
            return;
        }
        
        const search = searchValue.toLowerCase();
        this.filteredAccounts = this.accounts.filter(account => {
            return account.code.toLowerCase().includes(search) || 
                   account.name.toLowerCase().includes(search);
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
    
    updateAccounts(newAccounts) {
        this.accounts = newAccounts;
        this.filteredAccounts = [...newAccounts];
        this.renderDropdown();
    }
}

// API 基礎 URL
const API_BASE_URL = 'https://127.0.0.1:8443/api';

// 全域變數
let currentLedgerData = [];
let currentDateRange = null;
let allAccounts = [];
let subjectSelector = null;

// 初始化
document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

// 初始化頁面
function initializePage() {
    // 初始化日期選擇器
    initializeDatePicker();
    
    // 載入科目選項
    loadAccountOptions();
    
    // 綁定按鈕事件
    bindButtonEvents();
    
    // 初始載入資料（空白狀態）
    loadInitialData();
}

// 初始化日期選擇器
function initializeDatePicker() {
    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        locale: "zh",
        allowInput: true,
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length === 2) {
                currentDateRange = {
                    startDate: formatDate(selectedDates[0]),
                    endDate: formatDate(selectedDates[1])
                };
                console.log("選擇日期區間:", currentDateRange);
            }
        }
    });
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 載入科目選項
async function loadAccountOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`);
        if (!response.ok) throw new Error('載入科目失敗');
        
        allAccounts = await response.json();
        console.log('載入的科目資料:', allAccounts);
        initializeSubjectSelector();
    } catch (error) {
        console.error('載入科目錯誤:', error);
        // 使用備用資料
        allAccounts = [
            { code: "1001000", name: '現金' },
            { code: "1002000", name: '銀行存款' },
            { code: "2001000", name: '應付帳款' },
            { code: "3001000", name: '資本' },
            { code: "4001000", name: '銷貨收入' },
            { code: "5001000", name: '銷貨成本' }
        ];
        initializeSubjectSelector();
    }
}

// 初始化科目選擇器
function initializeSubjectSelector() {
    const subjectInput = document.getElementById('suject');
    if (subjectInput) {
        subjectSelector = new AccountSelector(subjectInput, {
            accounts: allAccounts,
            placeholder: '搜尋科目代碼或名稱...',
            onSelect: (account) => {
                console.log('選擇的科目:', account);
                // 選擇科目後自動觸發查詢
                performSearch();
            }
        });
    }
}

// 綁定按鈕事件
function bindButtonEvents() {
    // 查詢按鈕
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 清空按鈕
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearchConditions);
    }
    
    // 匯出按鈕
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
    
    // Enter 鍵觸發查詢
    document.getElementById('dateRange').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// 執行搜尋
async function performSearch() {
    // 準備搜尋條件
    const searchRequest = getSearchParameters();
    
    console.log('搜尋條件:', searchRequest);
    
    // 顯示載入狀態
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchRequest)
        });
        
        if (!response.ok) throw new Error('搜尋失敗');
        
        const data = await response.json();
        console.log('後端返回資料筆數:', data.length);
        
        // 只顯示選定科目的相關資料
        const filteredData = filterDataBySelectedAccount(data);
        
        currentLedgerData = filteredData;
        renderLedgerTable(filteredData);
        
    } catch (error) {
        console.error('搜尋錯誤:', error);
        showError('搜尋失敗：' + error.message);
    } finally {
        showLoading(false);
    }
}

// 取得搜尋參數
function getSearchParameters() {
    const dateRange = document.getElementById('dateRange').value;
    
    const params = {};
    
    // 處理日期區間
    if (dateRange) {
        console.log('原始日期範圍:', dateRange);
        
        let startDateStr, endDateStr;
        
        if (dateRange.includes(' 至 ')) {
            const dates = dateRange.split(' 至 ');
            if (dates.length === 2) {
                startDateStr = dates[0].trim();
                endDateStr = dates[1].trim();
            }
        } else if (dateRange.includes(' to ')) {
            const dates = dateRange.split(' to ');
            if (dates.length === 2) {
                startDateStr = dates[0].trim();
                endDateStr = dates[1].trim();
            }
        } else {
            startDateStr = dateRange.trim();
            endDateStr = dateRange.trim();
        }
        
        if (startDateStr && endDateStr) {
            const startDate = validateAndFormatDate(startDateStr);
            const endDate = validateAndFormatDate(endDateStr);
            
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
                console.log('最終設定的日期參數:', { startDate, endDate });
            }
        }
    }
    
    // 處理科目查詢
    if (subjectSelector && subjectSelector.getSelectedAccount()) {
        const selectedAccount = subjectSelector.getSelectedAccount();
        console.log('選擇的科目代碼:', selectedAccount.code);
        params.account = selectedAccount.code;
    }
    
    console.log('最終搜尋參數:', params);
    return params;
}

// 驗證並格式化日期（從 entriesManagement.js 複製）
function validateAndFormatDate(dateString) {
    if (!dateString) return null;
    
    console.log('驗證日期輸入:', dateString);
    
    try {
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.log('日期格式化:', dateString, '-> 已是正確格式');
            return dateString;
        }
        
        if (dateString.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
            const formatted = dateString.replace(/\//g, '-');
            console.log('日期格式化:', dateString, '->', formatted);
            return formatted;
        }
        
        const date = new Date(dateString + 'T00:00:00');
        
        if (isNaN(date.getTime())) {
            console.warn('無效的日期:', dateString);
            return null;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day}`;
        console.log('日期格式化:', dateString, '->', formatted);
        
        return formatted;
    } catch (error) {
        console.warn('日期格式化錯誤:', dateString, error);
        return null;
    }
}

// 過濾資料，只顯示選定科目的相關資料
function filterDataBySelectedAccount(data) {
    if (!subjectSelector || !subjectSelector.getSelectedAccount()) {
        return data; // 如果沒有選擇科目，返回所有資料
    }
    
    const selectedAccountCode = subjectSelector.getSelectedAccount().code;
    console.log('過濾科目代碼:', selectedAccountCode);
    
    const filteredData = data.filter(item => {
        return item.accountCode === selectedAccountCode;
    });
    
    console.log('過濾前資料筆數:', data.length);
    console.log('過濾後資料筆數:', filteredData.length);
    
    return filteredData;
}

// 清空搜尋條件
function clearSearchConditions() {
    // 清空日期選擇器
    const dateInput = document.getElementById('dateRange');
    if (dateInput._flatpickr) {
        dateInput._flatpickr.clear();
    }
    currentDateRange = null;
    
    // 清空科目選擇器
    if (subjectSelector) {
        subjectSelector.clear();
    }
    
    // 清空表格
    clearTable();
}

// 渲染明細分類帳表格
function renderLedgerTable(data) {
    const tbody = document.getElementById('ledgerTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    data.forEach(item => {
        const tr = document.createElement('tr');
        
        // 計算借/貸方向
        const debitAmount = item.debitAmount || 0;
        const creditAmount = item.creditAmount || 0;
        const direction = debitAmount > 0 ? '借' : (creditAmount > 0 ? '貸' : '-');
        
        tr.innerHTML = `
            <td>${formatDisplayDate(item.voucherDate)}</td>
            <td>${item.voucherNumber || ''}</td>
            <td>${item.accountCode || ''}</td>
            <td>${item.accountName || ''}</td>
            <td class="amount">${debitAmount > 0 ? formatAmount(debitAmount) : ''}</td>
            <td class="amount">${creditAmount > 0 ? formatAmount(creditAmount) : ''}</td>
            <td>${direction}</td>
            <td>${item.summary || item.description || ''}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// 格式化顯示日期（參考 entriesManagement.js）
function formatDisplayDate(dateString) {
    console.log('格式化日期輸入:', dateString, '類型:', typeof dateString);
    
    if (!dateString) {
        console.log('日期為空');
        return '';
    }
    
    try {
        let date;
        
        if (typeof dateString === 'string') {
            if (dateString.includes('-')) {
                date = new Date(dateString + 'T00:00:00');
            } else {
                date = new Date(dateString);
            }
        } else if (Array.isArray(dateString) && dateString.length >= 3) {
            date = new Date(dateString[0], dateString[1] - 1, dateString[2]);
        } else {
            date = new Date(dateString);
        }
        
        console.log('轉換後的 Date 物件:', date);
        
        if (isNaN(date.getTime())) {
            console.log('無效的日期');
            return '';
        }
        
        const formatted = date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        console.log('格式化後的日期:', formatted);
        return formatted;
        
    } catch (error) {
        console.warn('日期格式化錯誤:', dateString, error);
        return dateString ? dateString.toString() : '';
    }
}

// 格式化金額
function formatAmount(amount) {
    if (amount === 0 || amount === null || amount === undefined) return '0.00';
    return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

// 清空表格
function clearTable() {
    const tbody = document.getElementById('ledgerTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (tbody) {
        tbody.innerHTML = '';
    }
    
    noDataMessage.style.display = 'none';
    currentLedgerData = [];
}

// 顯示載入狀態
function showLoading(isLoading) {
    const loadingMessage = document.getElementById('loadingMessage');
    const tableContainer = document.querySelector('.table-container');
    
    if (isLoading) {
        loadingMessage.style.display = 'block';
        if (tableContainer) tableContainer.style.opacity = '0.5';
    } else {
        loadingMessage.style.display = 'none';
        if (tableContainer) tableContainer.style.opacity = '1';
    }
}

// 顯示錯誤訊息
function showError(message) {
    alert(message);
}

// 初始載入資料
function loadInitialData() {
    console.log('明細分類帳頁面已載入');
}

// 匯出Excel功能
function exportToExcel() {
    if (!currentLedgerData || currentLedgerData.length === 0) {
        alert('沒有資料可以匯出，請先查詢資料');
        return;
    }

    try {
        console.log('準備匯出資料:', currentLedgerData);
        
        const exportData = prepareExportData(currentLedgerData);
        console.log('處理後的匯出資料:', exportData);
        
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // 設定欄位寬度
        const colWidths = [
            { wch: 12 }, // 日期
            { wch: 15 }, // 傳票編號
            { wch: 15 }, // 科目代碼
            { wch: 20 }, // 科目名稱
            { wch: 15 }, // 借方金額
            { wch: 15 }, // 貸方金額
            { wch: 8 },  // 借/貸
            { wch: 30 }  // 摘要
        ];
        worksheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, '明細分類帳');
        
        // 產生檔案名稱
        let fileName = '明細分類帳';
        if (currentDateRange) {
            fileName += `_${currentDateRange.startDate}_${currentDateRange.endDate}`;
        }
        
        // 如果有選擇科目，加入科目資訊
        if (subjectSelector && subjectSelector.getSelectedAccount()) {
            const selectedAccount = subjectSelector.getSelectedAccount();
            fileName += `_${selectedAccount.code}`;
        }
        
        fileName += '.xlsx';
        
        XLSX.writeFile(workbook, fileName);
        console.log('匯出完成:', fileName);
        
    } catch (error) {
        console.error('匯出錯誤:', error);
        alert('匯出失敗：' + error.message);
    }
}

// 準備匯出資料
function prepareExportData(data) {
    return data.map(item => {
        const debitAmount = item.debitAmount || 0;
        const creditAmount = item.creditAmount || 0;
        const direction = debitAmount > 0 ? '借' : (creditAmount > 0 ? '貸' : '-');
        
        return {
            '日期': formatDisplayDate(item.voucherDate),
            '傳票編號': item.voucherNumber || '',
            '科目代碼': item.accountCode || '',
            '科目名稱': item.accountName || '',
            '借方金額': debitAmount > 0 ? formatAmount(debitAmount) : '0',
            '貸方金額': creditAmount > 0 ? formatAmount(creditAmount) : '0',
            '借/貸': direction,
            '摘要': item.summary || item.description || ''
        };
    });
}