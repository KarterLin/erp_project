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

// 無形資產類型對應的攤提科目映射 - 改為使用中文，與後端對應
const intangibleAmortizationOptions = {
    '專利權': {
        assetCode: '1781000',      // 專利權
        amortizationCode: '1781001', // 累計攤銷-專利權
        expenseCode: '6103006',    // 攤銷費用-專利權
        disabled: true,
        autoSelect: '1781001'
    },
    '商標權': {
        assetCode: '1782000',      // 商標權
        amortizationCode: '1782001', // 累計攤銷-商標權
        expenseCode: '6103007',    // 攤銷費用-商標權
        disabled: true,
        autoSelect: '1782001'
    },
    '電腦軟體': {
        assetCode: '1783000',      // 電腦軟體
        amortizationCode: '1783001', // 累計攤銷-電腦軟體
        expenseCode: '6103008',    // 攤銷費用-電腦軟體
        disabled: true,
        autoSelect: '1783001'
    }
};

// 更新每期攤提科目選單
function updateIntangibleAmortizationSubject(selectedType) {
    const amortizationSubjectSelect = document.getElementById('amortization-subject');
    if (!amortizationSubjectSelect) return;
    
    // 清空現有選項
    amortizationSubjectSelect.innerHTML = '';
    
    if (!selectedType || !intangibleAmortizationOptions[selectedType]) {
        // 如果沒有選擇或選擇了未定義的選項，恢復預設選項
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
        
        // 自動選擇對應的值
        if (config.autoSelect) {
            amortizationSubjectSelect.value = config.autoSelect;
        }
    } else {
        amortizationSubjectSelect.disabled = false;
        amortizationSubjectSelect.style.backgroundColor = '';
        amortizationSubjectSelect.style.color = '';
    }
}

// 根據科目代碼獲取科目名稱
function getAccountNameByCode(code) {
    const accountNames = {
        '1781001': '累計攤銷-專利權',
        '1782001': '累計攤銷-商標權', 
        '1783001': '累計攤銷-電腦軟體'
    };
    return accountNames[code] || code;
}

// 無形資產表單提交處理
async function handleIntangibleFormSubmission() {
    const entryDate = document.getElementById('entry-date').value;
    const intangibleType = document.getElementById('intangible-type').value;
    const intangibleName = document.getElementById('intangible-name').value;
    const creditAccount = document.getElementById('credit-account').value;
    const amount = document.getElementById('amount').value;
    const residualValue = document.getElementById('residual-value').value;
    const usefulLifeYears = document.getElementById('useful-life-years').value;
    const usefulLifeMonths = document.getElementById('useful-life-months').value;
    const description = document.getElementById('description').value;

    // 基本驗證
    if (!entryDate) return alert('請選擇入帳日期');
    if (!intangibleType) return alert('請選擇無形資產類型');
    if (!intangibleName) return alert('請輸入無形資產名稱');
    if (!creditAccount) return alert('請選擇對應貸方科目');
    if (!amount || parseFloat(amount) <= 0) return alert('請輸入正確的金額');
    if (!usefulLifeYears && !usefulLifeMonths) return alert('請輸入使用年限');

    // 構建符合後端 AssetAmortizationRequest 格式的數據
    const formData = {
        entryDate: entryDate,
        assetName: intangibleName,
        intangibleType: intangibleType,  // 新增：傳送無形資產類型
        creditAccountCode: creditAccount,
        amount: parseFloat(amount),
        salvageValue: parseFloat(residualValue || '0'),
        usageYears: parseInt(usefulLifeYears || '0'),
        month: parseInt(usefulLifeMonths || '0'),
        description: description || `購入${intangibleName}`
    };

    console.log('無形資產數據:', formData);
    
    try {
        const response = await fetch(`${AMORTIZATION_API}/intangible`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const message = await response.text();
            alert(message || '無形資產分錄已提交！');
            document.getElementById('journal-entry-form').reset();
            setDefaultDates();
            updateIntangibleAmortizationSubject('');
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
        handleIntangibleFormSubmission();
    });
}

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', function () {
    // 設置預設日期
    setDefaultDates();

    // 無形資產類型選擇變化監聽
    const intangibleTypeSelect = document.getElementById('intangible-type');
    if (intangibleTypeSelect) {
        intangibleTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            updateIntangibleAmortizationSubject(selectedType);
        });

        // 初始化攤提科目選單
        updateIntangibleAmortizationSubject(intangibleTypeSelect.value);
    }

    console.log('無形資產表單已初始化');
});