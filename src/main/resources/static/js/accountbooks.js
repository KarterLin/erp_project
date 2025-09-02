// accountbooks.js - 帳務管理頁面主要功能

// API 基礎 URL
const API_BASE_URL = 'https://127.0.0.1:8443/api';

// 全域變數
let currentTrialBalanceData = null;
let currentSubsidiaryLedgerData = null;

// 初始化
document.addEventListener("DOMContentLoaded", function () {
    initializeAccountBooksPage();
});

// 初始化帳務管理頁面
function initializeAccountBooksPage() {
    console.log('帳務管理頁面已載入');
    
    // 綁定匯出按鈕事件
    const exportButton = document.querySelector('.action-card[data-action="export"]') || 
                        document.querySelector('button.action-card');
    
    if (exportButton) {
        exportButton.addEventListener('click', handleExportAccountingData);
    } else {
        // 如果找不到現有按鈕，為匯出帳務資料的按鈕添加事件監聽器
        setTimeout(() => {
            const buttons = document.querySelectorAll('button.action-card');
            buttons.forEach(button => {
                const spanText = button.querySelector('span');
                if (spanText && spanText.textContent.includes('匯出帳務資料')) {
                    button.addEventListener('click', handleExportAccountingData);
                }
            });
        }, 100);
    }
}

// 處理匯出帳務資料
async function handleExportAccountingData() {
    const today = new Date().toISOString().slice(0, 10);
    console.log('開始匯出帳務資料，日期:', today);
    
    // 顯示載入狀態
    showExportProgress('準備匯出資料...');
    
    try {
        // 並行載入試算表和明細分類帳資料
        const [trialBalanceData, subsidiaryLedgerData] = await Promise.all([
            fetchTrialBalanceData(today),
            fetchSubsidiaryLedgerData(today)
        ]);
        
        // 更新進度
        showExportProgress('處理資料中...');
        
        // 生成Excel檔案
        await generateCombinedExcel(trialBalanceData, subsidiaryLedgerData, today);
        
        // 隱藏進度提示
        hideExportProgress();
        
    } catch (error) {
        console.error('匯出失敗:', error);
        hideExportProgress();
        alert('匯出失敗：' + error.message);
    }
}

// 獲取試算表資料
async function fetchTrialBalanceData(date) {
    console.log('載入試算表資料，日期:', date);
    
    try {
        const response = await fetch(`${API_BASE_URL}/trial-balance/${date}`);
        if (!response.ok) throw new Error('獲取試算表資料失敗');
        
        const data = await response.json();
        currentTrialBalanceData = data;
        return data;
    } catch (error) {
        console.error('載入試算表資料錯誤:', error);
        throw new Error('載入試算表資料失敗: ' + error.message);
    }
}

// 獲取明細分類帳資料
async function fetchSubsidiaryLedgerData(date) {
    console.log('載入明細分類帳資料，日期:', date);
    
    try {
        // 設定查詢參數：從當年1月1日到指定日期
        const year = new Date(date).getFullYear();
        const startDate = `${year}-01-01`;
        const endDate = date;
        
        const searchParams = {
            startDate: startDate,
            endDate: endDate
        };
        
        const response = await fetch(`${API_BASE_URL}/vouchers/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        });
        
        if (!response.ok) throw new Error('獲取明細分類帳資料失敗');
        
        const data = await response.json();
        currentSubsidiaryLedgerData = data;
        return data;
    } catch (error) {
        console.error('載入明細分類帳資料錯誤:', error);
        throw new Error('載入明細分類帳資料失敗: ' + error.message);
    }
}

// 生成合併的Excel檔案
async function generateCombinedExcel(trialBalanceData, subsidiaryLedgerData, date) {
    console.log('開始生成Excel檔案');
    
    // 檢查XLSX是否可用
    if (typeof XLSX === 'undefined') {
        throw new Error('XLSX library not loaded');
    }
    
    // 創建工作簿
    const workbook = XLSX.utils.book_new();
    
    // 生成試算表工作表
    const trialBalanceSheet = createTrialBalanceSheet(trialBalanceData, date);
    XLSX.utils.book_append_sheet(workbook, trialBalanceSheet, '試算表');
    
    // 生成明細分類帳工作表
    const subsidiaryLedgerSheet = createSubsidiaryLedgerSheet(subsidiaryLedgerData);
    XLSX.utils.book_append_sheet(workbook, subsidiaryLedgerSheet, '明細分類帳');
    
    // 生成檔案名稱
    const fileName = `帳務資料_${date}.xlsx`;
    
    // 匯出檔案
    XLSX.writeFile(workbook, fileName);
    
    console.log('Excel檔案生成完成:', fileName);
}

// 創建試算表工作表
function createTrialBalanceSheet(data, date) {
    console.log('處理試算表資料');
    
    if (!data || !data.details) {
        console.warn('試算表資料為空');
        return XLSX.utils.aoa_to_sheet([
            ['日期', '科目代碼', '會計科目名稱', 'FIN LEAD REF.', '上期餘額', '本期餘額'],
            [date, '', '無資料', '', '', '']
        ]);
    }
    
    // 準備Excel資料
    const excelData = [];
    
    // 添加標題行
    excelData.push([
        '日期',
        '科目代碼', 
        '會計科目名稱',
        'FIN LEAD REF.',
        '上期餘額',
        '本期餘額'
    ]);
    
    // 添加資料行
    data.details.forEach(item => {
        excelData.push([
            date, // 日期
            item.accountCode, // 科目代碼
            item.accountName, // 會計科目名稱
            item.parentId !== undefined && item.parentId !== null ? item.parentId : '', // FIN LEAD REF.
            '', // 上期餘額 (目前為空，如果你的API有提供可以加入)
            item.balance // 本期餘額
        ]);
    });
    
    // 創建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // 設定欄位寬度
    const colWidths = [
        { wch: 12 }, // 日期
        { wch: 15 }, // 科目代碼
        { wch: 25 }, // 會計科目名稱
        { wch: 15 }, // FIN LEAD REF.
        { wch: 15 }, // 上期餘額
        { wch: 15 }  // 本期餘額
    ];
    worksheet['!cols'] = colWidths;
    
    // 設定數字格式 (金額欄位)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = 1; R <= range.e.r; ++R) { // 從第二行開始 (跳過標題)
        // 上期餘額欄位 (第5欄, index 4)
        const cellAddress4 = XLSX.utils.encode_cell({ r: R, c: 4 });
        if (worksheet[cellAddress4] && typeof worksheet[cellAddress4].v === 'number') {
            worksheet[cellAddress4].z = '#,##0.00';
        }
        
        // 本期餘額欄位 (第6欄, index 5)
        const cellAddress5 = XLSX.utils.encode_cell({ r: R, c: 5 });
        if (worksheet[cellAddress5] && typeof worksheet[cellAddress5].v === 'number') {
            worksheet[cellAddress5].z = '#,##0.00';
        }
    }
    
    return worksheet;
}

// 創建明細分類帳工作表
function createSubsidiaryLedgerSheet(data) {
    console.log('處理明細分類帳資料');
    
    if (!data || data.length === 0) {
        console.warn('明細分類帳資料為空');
        return XLSX.utils.aoa_to_sheet([
            ['日期', '傳票編號', '科目代碼', '科目名稱', '借方金額', '貸方金額', '借/貸', '摘要'],
            ['', '', '', '無資料', '', '', '', '']
        ]);
    }
    
    // 準備匯出資料
    const exportData = data.map(item => {
        const debitAmount = item.debitAmount || 0;
        const creditAmount = item.creditAmount || 0;
        const direction = debitAmount > 0 ? '借' : (creditAmount > 0 ? '貸' : '-');
        
        return {
            '日期': formatDisplayDate(item.voucherDate),
            '傳票編號': item.voucherNumber || '',
            '科目代碼': item.accountCode || '',
            '科目名稱': item.accountName || '',
            '借方金額': debitAmount > 0 ? debitAmount : 0,
            '貸方金額': creditAmount > 0 ? creditAmount : 0,
            '借/貸': direction,
            '摘要': item.summary || item.description || ''
        };
    });
    
    // 創建工作表
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
    
    return worksheet;
}

// 格式化顯示日期（從 subsidiaryLedger.js 複製）
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

// 顯示匯出進度
function showExportProgress(message) {
    // 移除現有的進度提示
    hideExportProgress();
    
    // 創建進度提示元素
    const progressDiv = document.createElement('div');
    progressDiv.id = 'exportProgress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 16px;
        text-align: center;
    `;
    progressDiv.textContent = message;
    
    document.body.appendChild(progressDiv);
}

// 隱藏匯出進度
function hideExportProgress() {
    const progressDiv = document.getElementById('exportProgress');
    if (progressDiv) {
        progressDiv.remove();
    }
}