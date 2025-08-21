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

// 無形資產類型對應的攤提科目映射
const intangibleAmortizationOptions = {
    '專利權': {
        assetCode: '1781000',
        amortizationCode: '1781001',
        expenseCode: '6103006',
        disabled: true,
        autoSelect: '1781001'
    },
    '商標權': {
        assetCode: '1782000',
        amortizationCode: '1782001',
        expenseCode: '6103007',
        disabled: true,
        autoSelect: '1782001'
    },
    '電腦軟體': {
        assetCode: '1783000',
        amortizationCode: '1783001',
        expenseCode: '6103008',
        disabled: true,
        autoSelect: '1783001'
    }
};

// 科目代碼對應名稱
const accountNames = {
    '1781001': '累計攤銷-專利權',
    '1782001': '累計攤銷-商標權',
    '1783001': '累計攤銷-電腦軟體',
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

// 更新每期攤提科目選單
function updateIntangibleAmortizationSubject(selectedType) {
    const amortizationSubjectSelect = document.getElementById('amortization-subject');
    if (!amortizationSubjectSelect) return;
    
    // 清空現有選項
    amortizationSubjectSelect.innerHTML = '';
    
    if (!selectedType || !intangibleAmortizationOptions[selectedType]) {
        // 恢復預設選項
        amortizationSubjectSelect.innerHTML = `
            <option value="">請選擇</option>
            <option value="1781001">累計攤銷-專利權</option>
            <option value="1782001">累計攤銷-商標權</option>
            <option value="1783001">累計攤銷-電腦軟體</option>
        `;
        amortizationSubjectSelect.disabled = false;
        amortizationSubjectSelect.style.backgroundColor = '';
        amortizationSubjectSelect.style.color = '';
        return;
    }

    const config = intangibleAmortizationOptions[selectedType];
    
    // 添加對應的選項
    const option = document.createElement('option');
    option.value = config.amortizationCode;
    option.textContent = getAccountNameByCode(config.amortizationCode);
    amortizationSubjectSelect.appendChild(option);

    // 設置是否禁用選單
    if (config.disabled) {
        amortizationSubjectSelect.disabled = true;
        amortizationSubjectSelect.style.backgroundColor = '#f5f5f5';
        amortizationSubjectSelect.style.color = '#999';
        
        if (config.autoSelect) {
            amortizationSubjectSelect.value = config.autoSelect;
        }
    } else {
        amortizationSubjectSelect.disabled = false;
        amortizationSubjectSelect.style.backgroundColor = '';
        amortizationSubjectSelect.style.color = '';
    }
}

// 驗證表單數據
function validateFormData(formData) {
    const errors = [];
    
    if (!formData.entryDate) {
        errors.push('請選擇入帳日期');
    }
    
    if (!formData.assetAccount) {
        errors.push('請選擇無形資產類型');
    }
    
    if (!formData.assetName || formData.assetName.trim() === '') {
        errors.push('請輸入無形資產名稱');
    }
    
    if (!formData.creditAccountCode) {
        errors.push('請選擇對應貸方科目');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
        errors.push('請輸入正確的金額（大於0）');
    }
    
    // 驗證使用年限
    const years = parseInt(formData.usageYears) || 0;
    const months = parseInt(formData.month) || 0;
    
    if (years === 0 && months === 0) {
        errors.push('請至少輸入使用年限（年或月）');
    }
    
    if (months > 11) {
        errors.push('使用月份不能超過11個月');
    }
    
    return errors;
}

// 構建符合後端 AssetAmortizationRequest 格式的 JSON 數據
function buildRequestData() {
    // 獲取表單數據
    const entryDate = document.getElementById('entry-date').value;
    const intangibleType = document.getElementById('intangible-type').value;
    const assetName = document.getElementById('intangible-name').value.trim();
    const creditAccountCode = document.getElementById('credit-account').value;
    const amount = document.getElementById('amount').value;
    const salvageValue = document.getElementById('residual-value').value || '0';
    const usageYears = document.getElementById('useful-life-years').value || '0';
    const month = document.getElementById('useful-life-months').value || '0';
    const description = document.getElementById('description').value.trim();
    
    // 根據無形資產類型獲取對應的資產科目代碼
    let assetAccountCode = null;
    if (intangibleAmortizationOptions[intangibleType]) {
        assetAccountCode = intangibleAmortizationOptions[intangibleType].assetCode;
    }
    
    // 構建請求數據，完全對應後端 AssetAmortizationRequest 類
    const requestData = {
        entryDate: entryDate,                    // LocalDate
        assetAccount: intangibleType,          // String - 無形資產類型（用於後端判斷科目）
        assetName: assetName,                    // String - 資產名稱（僅用於顯示）
        creditAccountCode: creditAccountCode,    // String - 貸方科目
        amount: parseFloat(amount),              // BigDecimal
        salvageValue: parseFloat(salvageValue),  // BigDecimal
        usageYears: parseInt(usageYears),        // Integer
        month: parseInt(month),                  // Integer  
        description: description || `購入${intangibleType}-${assetName}`, // String - 更清楚的預設摘要
        // 額外提供資產科目代碼（如果後端需要）
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

// 無形資產表單提交處理
async function handleIntangibleFormSubmission() {
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
        
        console.log('準備送出的無形資產數據:', requestData);
        console.log('JSON字串:', JSON.stringify(requestData, null, 2));
        
        // 送出請求到後端
        const response = await fetch(`${AMORTIZATION_API}/intangible`, {
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
            alert(message || '無形資產分錄已成功提交！');
            
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
            alert(`提交失敗 (${response.status}): ${errorMessage}\n\n可能的原因：\n1. 後端需要根據 intangibleType 而非 assetName 來判斷科目\n2. 科目設定不完整\n3. 數據格式問題`);
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
        updateIntangibleAmortizationSubject('');
        
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
    console.log('無形資產攤提頁面初始化開始...');
    
    // 設置預設日期
    setDefaultDates();
    
    // 設置表單提交事件監聽器
    const journalForm = document.getElementById('journal-entry-form');
    if (journalForm) {
        journalForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await handleIntangibleFormSubmission();
        });
    }
    
    // 設置重置按鈕事件監聽器
    const resetButton = document.getElementById('reset-form');
    if (resetButton) {
        resetButton.addEventListener('click', resetForm);
    }
    
    // 設置無形資產類型選擇變化監聽
    const intangibleTypeSelect = document.getElementById('intangible-type');
    if (intangibleTypeSelect) {
        intangibleTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            updateIntangibleAmortizationSubject(selectedType);
        });
        
        // 初始化攤提科目選單
        updateIntangibleAmortizationSubject(intangibleTypeSelect.value);
    }
    
    // 設置實時驗證
    setupRealTimeValidation();
    
    // 開發模式提示
    if (DEBUG_MODE) {
        console.log('DEBUG_MODE 已啟用 - 將顯示 JSON 預覽');
    }
    
    console.log('無形資產攤提頁面初始化完成！');
});