// API 端點配置
const API_BASE_URL = 'https://127.0.0.1:8443/api';

// 獲取當前日期
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 設置預設日期
function setDefaultDates() {
    const dateInput = document.getElementById('entry-date');
    if (!dateInput.value) dateInput.value = getCurrentDate();
}

// 格式化日期顯示
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 格式化數字顯示
function formatNumber(number) {
    if (number === null || number === undefined) return '0.00';
    return parseFloat(number).toLocaleString('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

// 載入固定資產清單
async function loadFixedAssets() {
    try {
        const response = await fetch(`${API_BASE_URL}/fixed-asset`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            populateFixedAssetTable(data);
        } else {
            console.error('載入固定資產失敗:', response.statusText);
            showEmptyTable('fixed-asset-table', '無固定資產資料');
        }
    } catch (error) {
        console.error('載入固定資產網路錯誤:', error);
        showEmptyTable('fixed-asset-table', '載入失敗，請檢查網路連接');
    }
}

// 載入無形資產清單
async function loadIntangibleAssets() {
    try {
        const response = await fetch(`${API_BASE_URL}/intangible-asset`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            populateIntangibleAssetTable(data);
        } else {
            console.error('載入無形資產失敗:', response.statusText);
            showEmptyTable('intangible-asset-table', '無無形資產資料');
        }
    } catch (error) {
        console.error('載入無形資產網路錯誤:', error);
        showEmptyTable('intangible-asset-table', '載入失敗，請檢查網路連接');
    }
}

// 填充固定資產表格
function populateFixedAssetTable(data) {
    const tbody = document.querySelector('#fixed-asset-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        showEmptyTableRow(tbody, '暫無固定資產資料');
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type || ''}</td>
            <td>${formatDate(item.entryDate)}</td>
            <td>${item.assetCode || ''}</td>
            <td>${item.assetName || ''}</td>
            <td style="text-align: right;">${formatNumber(item.totalAmount)}</td>
            <td style="text-align: right;">${formatNumber(item.salvageValue)}</td>
            <td style="text-align: right;">${formatNumber(item.accumulateAmount)}</td>
            <td style="text-align: right;">${formatNumber(item.netAmount)}</td>
        `;
        tbody.appendChild(row);
    });
}

// 填充無形資產表格
function populateIntangibleAssetTable(data) {
    const tbody = document.querySelector('#intangible-asset-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data || data.length === 0) {
        showEmptyTableRow(tbody, '暫無無形資產資料');
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type || ''}</td>
            <td>${formatDate(item.entryDate)}</td>
            <td>${item.assetCode || ''}</td>
            <td>${item.assetName || ''}</td>
            <td style="text-align: right;">${formatNumber(item.totalAmount)}</td>
            <td style="text-align: right;">${formatNumber(item.salvageValue)}</td>
            <td style="text-align: right;">${formatNumber(item.accumulateAmount)}</td>
            <td style="text-align: right;">${formatNumber(item.netAmount)}</td>
        `;
        tbody.appendChild(row);
    });
}

// 顯示空表格行
function showEmptyTableRow(tbody, message) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="8" style="text-align: center; color: #999; padding: 20px;">${message}</td>`;
    tbody.appendChild(row);
}

// 顯示空表格（用於錯誤情況）
function showEmptyTable(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) {
        showEmptyTableRow(tbody, message);
    }
}

// 載入預付費用（目前暫無對應API，顯示空資料）
function loadPrepaidExpenses() {
    const tbody = document.querySelector('#prepaid-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    showEmptyTableRow(tbody, '暫無預付費用資料');
}

// 刷新所有資料
async function refreshAllData() {
    const refreshButton = document.getElementById('refresh-data');
    if (refreshButton) {
        refreshButton.textContent = '載入中...';
        refreshButton.disabled = true;
    }
    
    try {
        // 並行載入所有資料
        await Promise.all([
            loadPrepaidExpenses(),
            loadFixedAssets(),
            loadIntangibleAssets()
        ]);
        
        console.log('所有資產資料已刷新');
    } catch (error) {
        console.error('刷新資料時發生錯誤:', error);
        alert('刷新資料失敗，請稍後重試');
    } finally {
        if (refreshButton) {
            refreshButton.textContent = '刷新資料';
            refreshButton.disabled = false;
        }
    }
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function () {
    // 設置預設日期
    setDefaultDates();
    
    // 綁定刷新按鈕事件
    const refreshButton = document.getElementById('refresh-data');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshAllData);
    }
    
    // 初始載入資料
    refreshAllData();
    
    console.log('資產清單頁面已初始化');
});