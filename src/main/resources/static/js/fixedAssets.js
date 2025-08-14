// API 端點配置
const API_BASE_URL = 'http://localhost:8080/api';
const AMORTIZATION_API = `${API_BASE_URL}/amortization`;

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

// 固定資產類型對應的折舊科目映射 - 改為使用中文，與後端對應
const fixedAssetDepreciationOptions = {
    '土地': {
        assetCode: '1411000',      // 土地
        depreciationCode: null,    // 土地無折舊
        expenseCode: null,         // 土地無折舊費用
        message: '土地無需折舊',
        disabled: true,
        autoSelect: null
    },
    '房屋及建物': {
        assetCode: '1431000',      // 房屋及建物
        depreciationCode: '1439000', // 累積折舊-房屋及建物
        expenseCode: '6103001',    // 折舊費用-建築物
        disabled: true,
        autoSelect: '1439000'
    },
    '資訊設備': {
        assetCode: '1441000',      // 資訊設備
        depreciationCode: '1449000', // 累積折舊-資訊設備
        expenseCode: '6103002',    // 折舊費用-資訊設備
        disabled: true,
        autoSelect: '1449000'
    },
    '辦公設備': {
        assetCode: '1451000',      // 辦公設備
        depreciationCode: '1459000', // 累積折舊-辦公設備
        expenseCode: '6103003',    // 折舊費用-辦公設備
        disabled: true,
        autoSelect: '1459000'
    },
    '運輸設備': {
        assetCode: '1461000',      // 運輸設備
        depreciationCode: '1469000', // 累積折舊-運輸設備
        expenseCode: '6103004',    // 折舊費用-運輸設備
        disabled: true,
        autoSelect: '1469000'
    },
    '什項設備': {
        assetCode: '1471000',      // 什項設備
        depreciationCode: '1479000', // 累積折舊-什項設備
        expenseCode: '6103005',    // 折舊費用-什項設備
        disabled: true,
        autoSelect: '1479000'
    }
};

// 更新每期折舊科目選單
function updateFixedAssetDepreciationSubject(selectedType) {
    const depreciationSubjectSelect = document.getElementById('depreciation-subject');
    if (!depreciationSubjectSelect) return;
    
    // 清空現有選項
    depreciationSubjectSelect.innerHTML = '';
    
    if (!selectedType || !fixedAssetDepreciationOptions[selectedType]) {
        // 如果沒有選擇或選擇了未定義的選項，恢復預設狀態
        depreciationSubjectSelect.innerHTML = `
            <option value="">請選擇</option>
            <option value="1439000">累積折舊-房屋及建物</option>
            <option value="1449000">累積折舊-資訊設備</option>
            <option value="1459000">累積折舊-辦公設備</option>
            <option value="1469000">累積折舊-運輸設備</option>
            <option value="1479000">累積折舊-什項設備</option>
        `;
        depreciationSubjectSelect.disabled = false;
        depreciationSubjectSelect.style.backgroundColor = '';
        depreciationSubjectSelect.style.color = '';
        return;
    }

    const config = fixedAssetDepreciationOptions[selectedType];
    
    // 統一設置反灰樣式
    depreciationSubjectSelect.disabled = true;
    depreciationSubjectSelect.style.backgroundColor = '#f5f5f5';
    depreciationSubjectSelect.style.color = '#999';
    
    // 特別處理土地的情況
    if (selectedType === '土地') {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = config.message; // "土地無需折舊"
        depreciationSubjectSelect.appendChild(option);
        depreciationSubjectSelect.value = '';
        return;
    }
    
    // 處理其他固定資產類型：自動帶出對應的累計折舊科目並反灰
    const option = document.createElement('option');
    option.value = config.depreciationCode;
    option.textContent = getAccountNameByCode(config.depreciationCode);
    depreciationSubjectSelect.appendChild(option);
    depreciationSubjectSelect.value = config.depreciationCode;
}

// 根據科目代碼獲取科目名稱
function getAccountNameByCode(code) {
    const accountNames = {
        '1439000': '累積折舊-房屋及建物',
        '1449000': '累積折舊-資訊設備',
        '1459000': '累積折舊-辦公設備',
        '1469000': '累積折舊-運輸設備',
        '1479000': '累積折舊-什項設備'
    };
    return accountNames[code] || code;
}

// 固定資產表單提交處理
async function handleFixedAssetFormSubmission() {
    const entryDate = document.getElementById('entry-date').value;
    const fixedAssetType = document.getElementById('fixed-asset-type').value;
    const fixedAssetName = document.getElementById('fixed-asset-name').value;
    const creditAccount = document.getElementById('credit-account').value;
    const amount = document.getElementById('amount').value;
    const residualValue = document.getElementById('residual-value').value;
    const usefulLifeYears = document.getElementById('useful-life-years').value;
    const usefulLifeMonths = document.getElementById('useful-life-months').value;
    const description = document.getElementById('description').value;

    // 基本驗證
    if (!entryDate) return alert('請選擇入帳日期');
    if (!fixedAssetType) return alert('請選擇固定資產類型');
    if (!fixedAssetName) return alert('請輸入固定資產名稱');
    if (!creditAccount) return alert('請選擇對應貸方科目');
    if (!amount || parseFloat(amount) <= 0) return alert('請輸入正確的金額');
    
    // 土地不需要使用年限，其他固定資產需要
    if (fixedAssetType !== '土地' && !usefulLifeYears && !usefulLifeMonths) {
        return alert('請輸入使用年限');
    }

    // 構建符合後端 AssetAmortizationRequest 格式的數據
    const formData = {
        entryDate: entryDate,
        assetName: fixedAssetName,
        creditAccountCode: creditAccount,
        amount: parseFloat(amount),
        salvageValue: parseFloat(residualValue || '0'),
        usageYears: parseInt(usefulLifeYears || '0'),
        month: parseInt(usefulLifeMonths || '0'),
        description: description || `購入${fixedAssetName}`
    };

    console.log('固定資產數據:', formData);
    
    try {
        const response = await fetch(`${AMORTIZATION_API}/fixed`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const message = await response.text();
            alert(message || '固定資產分錄已提交！');
            document.getElementById('journal-entry-form').reset();
            setDefaultDates();
            updateFixedAssetDepreciationSubject('');
        } else {
            const errorText = await response.text();
            console.error('提交錯誤:', errorText);
            alert(`提交失敗: ${errorText}`);
        }
    } catch (error) {
        console.error('網路錯誤:', error);
        alert('網路連接失敗，請檢查後端服務是否正常運行');
    }
}

// 表單提交事件監聽器
const journalForm = document.getElementById('journal-entry-form');
if (journalForm) {
    journalForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        handleFixedAssetFormSubmission();
    });
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function () {
    // 設置預設日期
    setDefaultDates();

    // 固定資產類型選擇變化監聽
    const fixedAssetTypeSelect = document.getElementById('fixed-asset-type');
    if (fixedAssetTypeSelect) {
        fixedAssetTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            updateFixedAssetDepreciationSubject(selectedType);
        });

        // 初始化折舊科目選單
        updateFixedAssetDepreciationSubject(fixedAssetTypeSelect.value);
    }

    console.log('固定資產表單已初始化');
});