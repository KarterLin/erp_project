// API 基礎 URL
const API_BASE_URL = 'http://localhost:8080/api';

// 全局變數存儲當前查詢結果，用於匯出功能
let currentVoucherData = [];

// DOM 載入完成後執行
document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

// 初始化頁面
function initializePage() {
    // 初始化日期選擇器
    initializeDatePicker();
    
    // 載入科目下拉選單
    loadAccounts();
    
    // 綁定事件監聽器
    bindEventListeners();
    
    // 初始載入所有傳票資料
    searchVouchers();
}

// 初始化日期選擇器
function initializeDatePicker() {
    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        locale: "zh"
    });
}

// 載入科目下拉選單
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`);
        if (response.ok) {
            const accounts = await response.json();
            populateAccountSelect(accounts);
        } else {
            console.error('載入科目失敗:', response.status);
        }
    } catch (error) {
        console.error('載入科目錯誤:', error);
    }
}

// 填入科目下拉選單
function populateAccountSelect(accounts) {
    const selectElement = document.getElementById('suject');
    
    // 清空現有選項（除了「全部」）
    selectElement.innerHTML = '<option value="">全部</option>';
    
    // 添加科目選項
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.name;
        option.textContent = `${account.code} - ${account.name}`;
        selectElement.appendChild(option);
    });
}

// 綁定事件監聽器
function bindEventListeners() {
    // 查詢按鈕
    document.getElementById('searchBtn').addEventListener('click', searchVouchers);
    
    // 清空按鈕
    document.getElementById('clearBtn').addEventListener('click', clearForm);
    
    // 匯出按鈕
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // Enter 鍵觸發查詢
    ['dateRange', 'summonsId', 'summary'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchVouchers();
            }
        });
    });
    
    // 下拉選單改變時自動查詢
    document.getElementById('suject').addEventListener('change', searchVouchers);
}

// 清空表單
function clearForm() {
    document.getElementById('dateRange').value = '';
    document.getElementById('summonsId').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('suject').selectedIndex = 0;
    
    // 清空表格並重新載入所有資料
    searchVouchers();
}

// 查詢傳票
async function searchVouchers() {
    const searchParams = getSearchParameters();
    
    // 顯示載入狀態
    showLoading(true);
    
    try {
        // 統一使用 POST 搜尋 API
        const vouchers = await performSearch(searchParams);
        
        // 處理並顯示結果
        currentVoucherData = vouchers;
        displayVouchers(vouchers);
        
    } catch (error) {
        console.error('查詢錯誤:', error);
        showError('查詢失敗，請稍後再試');
    } finally {
        showLoading(false);
    }
}

// 執行搜尋 - 統一使用 POST 方法
async function performSearch(searchParams) {
    console.log('搜尋參數:', searchParams); // 除錯用
    
    // 驗證日期區間的邏輯正確性
    if (searchParams.startDate && searchParams.endDate) {
        console.log('日期區間驗證:');
        console.log('  開始日期:', searchParams.startDate);
        console.log('  結束日期:', searchParams.endDate);
        
        // 確保結束日期不早於開始日期
        if (searchParams.startDate > searchParams.endDate) {
            console.warn('警告: 結束日期早於開始日期');
            alert('結束日期不能早於開始日期');
            return [];
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/vouchers/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams)
        });
        
        console.log('Response status:', response.status); // 除錯用
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('後端錯誤回應:', errorText);
            throw new Error(`搜尋失敗: ${response.status} - ${response.statusText}\n詳細錯誤: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('後端返回資料筆數:', result.length); // 除錯用
        
        // 前端額外驗證：過濾掉不在日期範圍內的資料
        if (searchParams.startDate && searchParams.endDate && result.length > 0) {
            const filteredResult = result.filter(voucher => {
                if (!voucher.voucherDate) return false;
                
                let voucherDateStr;
                if (Array.isArray(voucher.voucherDate)) {
                    // 處理 [year, month, day] 格式
                    const [year, month, day] = voucher.voucherDate;
                    voucherDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                } else if (typeof voucher.voucherDate === 'string') {
                    // 處理字符串格式
                    if (voucher.voucherDate.includes('-')) {
                        voucherDateStr = voucher.voucherDate.split('T')[0]; // 移除時間部分
                    } else {
                        voucherDateStr = voucher.voucherDate;
                    }
                } else {
                    return false;
                }
                
                // 檢查日期是否在範圍內
                const isInRange = voucherDateStr >= searchParams.startDate && voucherDateStr <= searchParams.endDate;
                
                if (!isInRange) {
                    console.log('過濾掉超出範圍的資料:', voucherDateStr, '不在', searchParams.startDate, '至', searchParams.endDate, '範圍內');
                }
                
                return isInRange;
            });
            
            console.log('前端過濾後資料筆數:', filteredResult.length);
            return filteredResult;
        }
        
        return result;
        
    } catch (error) {
        console.error('搜尋請求錯誤:', error);
        throw error;
    }
}

// 獲取搜尋參數
function getSearchParameters() {
    const dateRange = document.getElementById('dateRange').value;
    const voucherNumber = document.getElementById('summonsId').value.trim();
    const description = document.getElementById('summary').value.trim();
    const account = document.getElementById('suject').value;
    
    const params = {};
    
    // 處理日期區間 - 修復日期區間問題
    if (dateRange) {
        console.log('原始日期範圍:', dateRange); // 調試用
        
        // Flatpickr range mode 可能使用不同的分隔符
        let startDateStr, endDateStr;
        
        if (dateRange.includes(' 至 ')) {
            // 處理中文分隔符
            const dates = dateRange.split(' 至 ');
            if (dates.length === 2) {
                startDateStr = dates[0].trim();
                endDateStr = dates[1].trim();
            }
        } else if (dateRange.includes(' to ')) {
            // 處理英文分隔符
            const dates = dateRange.split(' to ');
            if (dates.length === 2) {
                startDateStr = dates[0].trim();
                endDateStr = dates[1].trim();
            }
        } else {
            // 單一日期選擇
            startDateStr = dateRange.trim();
            endDateStr = dateRange.trim();
        }
        
        console.log('分割後的日期:', { startDateStr, endDateStr }); // 調試用
        
        // 格式化日期
        if (startDateStr && endDateStr) {
            const startDate = validateAndFormatDate(startDateStr);
            const endDate = validateAndFormatDate(endDateStr);
            
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
                console.log('最終設定的日期參數:', { startDate, endDate }); // 調試用
            } else {
                console.warn('日期格式化失敗:', { startDateStr, endDateStr, startDate, endDate });
            }
        }
    }
    
    // 其他參數 - 只有在有值的時候才加入
    if (voucherNumber) {
        params.voucherNumber = voucherNumber;
    }
    if (description) {
        params.description = description;
    }
    if (account) {
        params.account = account;
    }
    
    console.log('最終搜尋參數:', params); // 調試用
    return params;
}

// 驗證並格式化日期
function validateAndFormatDate(dateString) {
    if (!dateString) return null;
    
    console.log('驗證日期輸入:', dateString); // 調試用
    
    try {
        // 直接處理 YYYY-MM-DD 格式的字符串
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            console.log('日期格式化:', dateString, '-> 已是正確格式');
            return dateString;
        }
        
        // 處理 YYYY/MM/DD 格式
        if (dateString.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
            const formatted = dateString.replace(/\//g, '-');
            console.log('日期格式化:', dateString, '->', formatted);
            return formatted;
        }
        
        // 處理其他可能的日期格式
        const date = new Date(dateString + 'T00:00:00'); // 強制設定為當地時間00:00:00
        
        // 檢查日期是否有效
        if (isNaN(date.getTime())) {
            console.warn('無效的日期:', dateString);
            return null;
        }
        
        // 格式化為 YYYY-MM-DD 格式
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

// 顯示傳票資料
function displayVouchers(vouchers) {
    const tbody = document.getElementById('voucherTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // 清空表格
    tbody.innerHTML = '';
    
    if (!vouchers || vouchers.length === 0) {
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    // 直接顯示每筆傳票明細，不分組
    vouchers.forEach(voucher => {
        // 調試用：輸出傳票資料到控制台
        console.log('Voucher data:', voucher);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatDate(voucher.voucherDate)}</td>
            <td>${voucher.voucherNumber || ''}</td>
            <td>${voucher.accountCode || ''}</td>
            <td>${voucher.accountName || ''}</td>
            <td class="amount">${voucher.debitAmount ? formatAmount(voucher.debitAmount) : '0.00'}</td>
            <td class="amount">${voucher.creditAmount ? formatAmount(voucher.creditAmount) : '0.00'}</td>
            <td>${voucher.summary || voucher.description || ''}</td>
        `;
    });
}

// 格式化金額
function formatAmount(amount) {
    if (!amount || amount === 0) return '0.00';
    
    return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// 格式化日期
function formatDate(dateString) {
    console.log('格式化日期輸入:', dateString, '類型:', typeof dateString); // 調試用
    
    if (!dateString) {
        console.log('日期為空');
        return '';
    }
    
    try {
        let date;
        
        // 處理不同的日期格式
        if (typeof dateString === 'string') {
            // 處理 YYYY-MM-DD 格式
            if (dateString.includes('-')) {
                date = new Date(dateString + 'T00:00:00');
            } else {
                date = new Date(dateString);
            }
        } else if (Array.isArray(dateString) && dateString.length >= 3) {
            // 處理 [year, month, day] 格式
            date = new Date(dateString[0], dateString[1] - 1, dateString[2]);
        } else {
            date = new Date(dateString);
        }
        
        console.log('轉換後的 Date 物件:', date);
        
        // 檢查日期是否有效
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

// 顯示載入狀態
function showLoading(isLoading) {
    const loadingMessage = document.getElementById('loadingMessage');
    const tableContainer = document.querySelector('.table-container');
    
    if (isLoading) {
        loadingMessage.style.display = 'block';
        tableContainer.style.opacity = '0.5';
    } else {
        loadingMessage.style.display = 'none';
        tableContainer.style.opacity = '1';
    }
}

// 顯示錯誤訊息
function showError(message) {
    alert(message); // 簡單的錯誤顯示，可以改為更好的UI
}

// 匯出到 Excel
function exportToExcel() {
    if (!currentVoucherData || currentVoucherData.length === 0) {
        alert('沒有資料可以匯出');
        return;
    }
    
    try {
        console.log('準備匯出資料:', currentVoucherData); // 調試用
        
        // 準備匯出資料
        const exportData = prepareExportData(currentVoucherData);
        
        console.log('處理後的匯出資料:', exportData); // 調試用
        
        // 創建工作簿
        const workbook = XLSX.utils.book_new();
        
        // 創建工作表
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // 設置列寬
        const colWidths = [
            { wch: 12 }, // 日期
            { wch: 15 }, // 傳票編號
            { wch: 15 }, // 科目代碼
            { wch: 20 }, // 科目名稱
            { wch: 15 }, // 借方金額
            { wch: 15 }, // 貸方金額
            { wch: 30 }  // 摘要
        ];
        worksheet['!cols'] = colWidths;
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, '傳票明細');
        
        // 產生檔案名稱
        const fileName = `傳票明細_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // 下載檔案
        XLSX.writeFile(workbook, fileName);
        
        console.log('匯出完成:', fileName); // 調試用
        
    } catch (error) {
        console.error('匯出錯誤:', error);
        alert('匯出失敗：' + error.message);
    }
}

// 準備匯出資料
function prepareExportData(vouchers) {
    return vouchers.map(voucher => ({
        '日期': formatDate(voucher.voucherDate),
        '傳票編號': voucher.voucherNumber || '',
        '科目代碼': voucher.accountCode || '',
        '科目名稱': voucher.accountName || '',
        '借方金額': voucher.debitAmount ? formatAmount(voucher.debitAmount) : '0.00',
        '貸方金額': voucher.creditAmount ? formatAmount(voucher.creditAmount) : '0.00',
        '摘要': voucher.summary || voucher.description || ''
    }));
}