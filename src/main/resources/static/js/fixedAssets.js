// API 端點配置
const API_BASE_URL = 'http://localhost:8080/api';
const AMORTIZATION_API = `${API_BASE_URL}/amortization`;

// 開發模式 - 設為 true 可以顯示 JSON 預覽和詳細日誌
const DEBUG_MODE = true;

// 獲取當前日期 (YYYY-MM-DD 格式)
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 設置預設日期
function setDefaultDates() {
    const dateInput = document.getElementById('entry-date');
    if (!dateInput.value) {
        dateInput.value = getCurrentDate();
    }
}

// 固定資產類型對應的折舊科目映射
const fixedAssetDepreciationOptions = {
    '土地': {
        assetCode: '1411000',
        depreciationCode: null,
        expenseCode: null,
        message: '土地無需折舊',
        disabled: true,
        autoSelect: null
    },
    '房屋及建物': {
        assetCode: '1431000',
        depreciationCode: '1439000',
        expenseCode: '6103001',
        disabled: true,
        autoSelect: '1439000'
    },
    '資訊設備': {
        assetCode: '1441000',
        depreciationCode: '1449000',
        expenseCode: '6103002',
        disabled: true,
        autoSelect: '1449000'
    },
    '辦公設備': {
        assetCode: '1451000',
        depreciationCode: '1459000',
        expenseCode: '6103003',
        disabled: true,
        autoSelect: '1459000'
    },
    '運輸設備': {
        assetCode: '1461000',
        depreciationCode: '1469000',
        expenseCode: '6103004',
        disabled: true,
        autoSelect: '1469000'
    },
    '什項設備': {
        assetCode: '1471000',
        depreciationCode: '1479000',
        expenseCode: '6103005',
        disabled: true,
        autoSelect: '1479000'
    }
};

// 科目代碼對應名稱
const accountNames = {
    '1439000': '累積折舊-房屋及建物',
    '1449000': '累積折舊-資訊設備',
    '1459000': '累積折舊-辦公設備',
    '1469000': '累積折舊-運輸設備',
    '1479000': '累積折舊-什項設備',
    '1111000': '庫存現金',
    '1113001': '銀行存款–合庫南港活存',
    '1113011': '銀行存款–國泰南港活存',
    '1113021': '銀行存款–富邦南港活存',
    '1113031': '銀行存款–玉山南港活存',
    '2151000': '應付費用'
};

// 根據科目代碼獲取科目名稱
function getAccountNameByCode(code) {
    return accountNames[code] || code;
}

// 設置欄位的啟用/禁用狀態
function setFieldDisabled(fieldId, disabled, clearValue = false) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.disabled = disabled;
    
    if (disabled) {
        field.style.backgroundColor = '#f5f5f5';
        field.style.color = '#999';
        field.style.cursor = 'not-allowed';
        if (clearValue) {
            field.value = '';
        }
    } else {
        field.style.backgroundColor = '';
        field.style.color = '';
        field.style.cursor = '';
    }
}

// 更新每期折舊科目選單以及相關欄位的狀態
function updateFixedAssetDepreciationSubject(selectedType) {
    const depreciationSubjectSelect = document.getElementById('depreciation-subject');
    if (!depreciationSubjectSelect) return;
    
    // 清空現有選項
    depreciationSubjectSelect.innerHTML = '';
    
    const isLand = selectedType === '土地';
    
    // 設置相關欄位的啟用/禁用狀態
    if (isLand) {
        // 土地：禁用預估剩餘殘值和使用年限
        setFieldDisabled('residual-value', true, true);
        setFieldDisabled('useful-life-years', true, true);
        setFieldDisabled('useful-life-months', true, true);
    } else {
        // 非土地：啟用預估剩餘殘值和使用年限
        setFieldDisabled('residual-value', false);
        setFieldDisabled('useful-life-years', false);
        setFieldDisabled('useful-life-months', false);
    }
    
    if (!selectedType || !fixedAssetDepreciationOptions[selectedType]) {
        // 恢復預設選項
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

// 驗證表單數據 - 完全按照 amortization.js 的邏輯
function validateFormData(formData) {
    const errors = [];
    
    if (!formData.entryDate) {
        errors.push('請選擇入帳日期');
    }
    
    if (!formData.assetAccount) {
        errors.push('請選擇固定資產類型');
    }
    
    if (!formData.assetName || formData.assetName.trim() === '') {
        errors.push('請輸入固定資產名稱');
    }
    
    if (!formData.creditAccountCode) {
        errors.push('請選擇對應貸方科目');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
        errors.push('請輸入正確的金額（大於0）');
    }
    
    // 驗證使用年限（土地除外）
    if (formData.assetAccount !== '土地') {
        const years = parseInt(formData.usageYears) || 0;
        const months = parseInt(formData.month) || 0;
        
        if (years === 0 && months === 0) {
            errors.push('除土地外，其他資產請至少輸入使用年限（年或月）');
        }
        
        if (months > 11) {
            errors.push('使用月份不能超過11個月');
        }
    }
    
    return errors;
}

// 構建符合後端 AssetAmortizationRequest 格式的 JSON 數據 - 完全按照 amortization.js 的成功模式
function buildRequestData() {
    // 獲取表單數據
    const entryDate = document.getElementById('entry-date').value;
    const fixedAssetType = document.getElementById('fixed-asset-type').value;
    const assetName = document.getElementById('fixed-asset-name').value.trim();
    const creditAccountCode = document.getElementById('credit-account').value;
    const amount = document.getElementById('amount').value;
    
    // 針對土地特殊處理：如果是土地，殘值和使用年限設為0
    let salvageValue, usageYears, month;
    if (fixedAssetType === '土地') {
        salvageValue = '0';
        usageYears = '0';
        month = '0';
    } else {
        salvageValue = document.getElementById('residual-value').value || '0';
        usageYears = document.getElementById('useful-life-years').value || '0';
        month = document.getElementById('useful-life-months').value || '0';
    }
    
    const description = document.getElementById('description').value.trim();
    
    // 構建請求數據，完全對應 amortization.js 成功的格式
    const requestData = {
        entryDate: entryDate,                    // LocalDate
        assetAccount: fixedAssetType,            // String - 固定資產類型（對應 amortization 的 assetAccount）
        assetName: assetName,                    // String - 資產名稱（僅用於顯示）
        creditAccountCode: creditAccountCode,    // String - 貸方科目
        amount: parseFloat(amount),              // BigDecimal
        salvageValue: parseFloat(salvageValue),  // BigDecimal
        usageYears: parseInt(usageYears),        // Integer
        month: parseInt(month),                  // Integer  
        description: description || `購入${fixedAssetType}-${assetName}` // String - 更清楚的預設摘要
    };
    
    return requestData;
}

// 顯示 JSON 預覽（開發用）
function showJsonPreview(data) {
    if (!DEBUG_MODE) return;
    
    const previewDiv = document.getElementById('json-preview');
    const contentPre = document.getElementById('json-content');
    
    if (previewDiv && contentPre) {
        contentPre.textContent = JSON.stringify(data, null, 2);
        previewDiv.style.display = 'block';
    }
}

// 固定資產表單提交處理 - 完全按照 amortization.js 的成功邏輯
async function handleFixedAssetFormSubmission() {
    try {
        // 構建請求數據
        const requestData = buildRequestData();
        
        // 驗證數據
        const errors = validateFormData(requestData);
        if (errors.length > 0) {
            alert('請修正以下錯誤：\n' + errors.join('\n'));
            return;
        }
        
        // 顯示 JSON 預覽（開發用）
        showJsonPreview(requestData);
        
        console.log('準備送出的固定資產數據:', requestData);
        console.log('JSON字串:', JSON.stringify(requestData, null, 2));
        
        // 送出請求到後端
        const response = await fetch(`${AMORTIZATION_API}/fixed`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('HTTP回應狀態:', response.status);
        
        // 處理回應
        if (response.ok) {
            const message = await response.text();
            console.log('成功回應:', message);
            alert(message || '固定資產分錄已成功提交！');
            
            // 重置表單
            resetForm();
        } else {
            // 嘗試解析錯誤回應
            let errorMessage = '';
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorJson = await response.json();
                    console.error('後端JSON錯誤回應:', errorJson);
                    errorMessage = errorJson.message || errorJson.error || `HTTP ${response.status} 錯誤`;
                } catch (jsonError) {
                    console.error('無法解析錯誤JSON:', jsonError);
                    errorMessage = await response.text();
                }
            } else {
                errorMessage = await response.text();
            }
            
            console.error('後端回應錯誤:', response.status, errorMessage);
            alert(`提交失敗 (${response.status}): ${errorMessage}\n\n可能的原因：\n1. 後端需要根據 assetAccount 而非 assetName 來判斷科目\n2. 科目設定不完整\n3. 數據格式問題`);
        }
    } catch (error) {
        console.error('網路或其他錯誤:', error);
        alert('提交失敗：網路連接錯誤，請檢查後端服務是否正常運行');
    }
}

// 重置表單
function resetForm() {
    const form = document.getElementById('journal-entry-form');
    if (form) {
        form.reset();
        setDefaultDates();
        updateFixedAssetDepreciationSubject('');
        
        // 隱藏 JSON 預覽
        const previewDiv = document.getElementById('json-preview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
        }
    }
}

// 表單實時驗證
function setupRealTimeValidation() {
    const amountInput = document.getElementById('amount');
    const salvageInput = document.getElementById('residual-value');
    const yearsInput = document.getElementById('useful-life-years');
    const monthsInput = document.getElementById('useful-life-months');
    
    // 金額驗證
    if (amountInput) {
        amountInput.addEventListener('blur', function() {
            const value = parseFloat(this.value);
            if (this.value && (isNaN(value) || value <= 0)) {
                this.style.borderColor = 'red';
                this.title = '金額必須大於0';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }
    
    // 殘值驗證
    if (salvageInput) {
        salvageInput.addEventListener('blur', function() {
            // 如果欄位被禁用，跳過驗證
            if (this.disabled) return;
            
            const value = parseFloat(this.value);
            if (this.value && (isNaN(value) || value < 0)) {
                this.style.borderColor = 'red';
                this.title = '殘值不能小於0';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }
    
    // 使用月份驗證
    if (monthsInput) {
        monthsInput.addEventListener('blur', function() {
            // 如果欄位被禁用，跳過驗證
            if (this.disabled) return;
            
            const value = parseInt(this.value);
            if (this.value && (isNaN(value) || value < 0 || value > 11)) {
                this.style.borderColor = 'red';
                this.title = '月份必須在0-11之間';
            } else {
                this.style.borderColor = '';
                this.title = '';
            }
        });
    }
}

// DOM 載入完成後的初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('固定資產攤提頁面初始化開始...');
    
    // 設置預設日期
    setDefaultDates();
    
    // 設置表單提交事件監聽器
    const journalForm = document.getElementById('journal-entry-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleFixedAssetFormSubmission();
        });
    }
    
    // 設置重置按鈕事件監聽器
    const resetButton = document.getElementById('reset-form');
    if (resetButton) {
        resetButton.addEventListener('click', resetForm);
    }
    
    // 設置固定資產類型選擇變化監聽
    const fixedAssetTypeSelect = document.getElementById('fixed-asset-type');
    if (fixedAssetTypeSelect) {
        fixedAssetTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            updateFixedAssetDepreciationSubject(selectedType);
        });
        
        // 初始化折舊科目選單
        updateFixedAssetDepreciationSubject(fixedAssetTypeSelect.value);
    }
    
    // 設置實時驗證
    setupRealTimeValidation();
    
    // 開發模式提示
    if (DEBUG_MODE) {
        console.log('DEBUG_MODE 已啟用 - 將顯示 JSON 預覽');
    }
    
    console.log('固定資產攤提頁面初始化完成！');
});