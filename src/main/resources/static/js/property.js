// API 端點配置
const API_BASE_URL = 'https://127.0.0.1:8443/api';

// 全域變數儲存資料
let fixedAssetsData = [];
let intangibleAssetsData = [];

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
            fixedAssetsData = data; // 儲存到全域變數
            populateFixedAssetTable(data);
        } else {
            console.error('載入固定資產失敗:', response.statusText);
            fixedAssetsData = [];
            showEmptyTable('fixed-asset-table', '無固定資產資料');
        }
    } catch (error) {
        console.error('載入固定資產網路錯誤:', error);
        fixedAssetsData = [];
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
            intangibleAssetsData = data; // 儲存到全域變數
            populateIntangibleAssetTable(data);
        } else {
            console.error('載入無形資產失敗:', response.statusText);
            intangibleAssetsData = [];
            showEmptyTable('intangible-asset-table', '無無形資產資料');
        }
    } catch (error) {
        console.error('載入無形資產網路錯誤:', error);
        intangibleAssetsData = [];
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

// ===== Excel 匯出功能 =====

// 準備固定資產 Excel 資料
function prepareFixedAssetExcelData() {
    if (!fixedAssetsData || fixedAssetsData.length === 0) {
        return [
            ['類型', '取得日期', '財產編號', '財產名稱', '原始取得成本', '預計殘值', '累計折舊', '帳面淨額'],
            ['暫無資料', '', '', '', '', '', '', '']
        ];
    }

    const headers = ['類型', '取得日期', '財產編號', '財產名稱', '原始取得成本', '預計殘值', '累計折舊', '帳面淨額'];
    const rows = fixedAssetsData.map(item => [
        item.type || '',
        formatDate(item.entryDate),
        item.assetCode || '',
        item.assetName || '',
        item.totalAmount || 0,
        item.salvageValue || 0,
        item.accumulateAmount || 0,
        item.netAmount || 0
    ]);

    return [headers, ...rows];
}

// 準備無形資產 Excel 資料
function prepareIntangibleAssetExcelData() {
    if (!intangibleAssetsData || intangibleAssetsData.length === 0) {
        return [
            ['類型', '取得日期', '財產編號', '財產名稱', '原始取得成本', '預計殘值', '累計攤銷', '帳面淨額'],
            ['暫無資料', '', '', '', '', '', '', '']
        ];
    }

    const headers = ['類型', '取得日期', '財產編號', '財產名稱', '原始取得成本', '預計殘值', '累計攤銷', '帳面淨額'];
    const rows = intangibleAssetsData.map(item => [
        item.type || '',
        formatDate(item.entryDate),
        item.assetCode || '',
        item.assetName || '',
        item.totalAmount || 0,
        item.salvageValue || 0,
        item.accumulateAmount || 0,
        item.netAmount || 0
    ]);

    return [headers, ...rows];
}

// 匯出 Excel 檔案
function exportToExcel() {
    const exportButton = document.getElementById('export-excel');
    if (exportButton) {
        exportButton.textContent = '匯出中...';
        exportButton.disabled = true;
    }

    try {
        // 建立新的工作簿
        const workbook = XLSX.utils.book_new();

        // 準備固定資產工作表資料
        const fixedAssetData = prepareFixedAssetExcelData();
        const fixedAssetWorksheet = XLSX.utils.aoa_to_sheet(fixedAssetData);

        // 準備無形資產工作表資料
        const intangibleAssetData = prepareIntangibleAssetExcelData();
        const intangibleAssetWorksheet = XLSX.utils.aoa_to_sheet(intangibleAssetData);

        // 設置列寬
        const columnWidths = [
            { wch: 12 }, // 類型
            { wch: 12 }, // 取得日期
            { wch: 15 }, // 財產編號
            { wch: 25 }, // 財產名稱
            { wch: 15 }, // 原始取得成本
            { wch: 12 }, // 預計殘值
            { wch: 12 }, // 累計折舊/攤銷
            { wch: 12 }  // 帳面淨額
        ];

        fixedAssetWorksheet['!cols'] = columnWidths;
        intangibleAssetWorksheet['!cols'] = columnWidths;

        // 加入工作表到工作簿
        XLSX.utils.book_append_sheet(workbook, fixedAssetWorksheet, '固定資產');
        XLSX.utils.book_append_sheet(workbook, intangibleAssetWorksheet, '無形資產');

        // 產生檔案名稱（包含當前日期）
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const fileName = `資產清單_${dateString}.xlsx`;

        // 寫出檔案
        XLSX.writeFile(workbook, fileName);

        console.log('Excel 檔案已匯出:', fileName);
    } catch (error) {
        console.error('匯出 Excel 時發生錯誤:', error);
        alert('匯出失敗，請稍後重試');
    } finally {
        if (exportButton) {
            exportButton.innerHTML = '<span class="export-icon">📊</span>匯出 Excel';
            exportButton.disabled = false;
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

    // 綁定匯出按鈕事件
    const exportButton = document.getElementById('export-excel');
    if (exportButton) {
        exportButton.addEventListener('click', exportToExcel);
    }
    
    // 初始載入資料
    refreshAllData();
    
    console.log('資產清單頁面已初始化');
});