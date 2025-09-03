// 科目編號與攤提科目的映射配置
const amortizationOptions = {
    '預付租金': {
        options: [
            { value: '', text: '請選擇' },
            { value: '6102001', text: '租金支出–房子' },
            { value: '6102003', text: '租金支出–其他' }
        ],
        disabled: false // 預付租金允許使用者選擇
    },
    '預付保險費': {
        options: [
            { value: '6111005', text: '保險費' }
        ],
        disabled: true, // 預付保險費自動帶出並反灰
        autoSelect: '6111005'
    },
    '預付軟體使用費': {
        options: [
            { value: '6110003', text: '電腦使用費–軟體' }
        ],
        disabled: true, // 預付軟體使用費自動帶出並反灰
        autoSelect: '6110003'
    }
};

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

// 更新每期攤提科目選單
function updateAmortizationSubject(selectedType) {
    const amortizationSubjectSelect = document.getElementById('amortization-subject');
    if (!amortizationSubjectSelect) return;
    
    // 清空現有選項
    amortizationSubjectSelect.innerHTML = '';
    
    if (!selectedType || !amortizationOptions[selectedType]) {
        // 如果沒有選擇或選擇了未定義的選項，恢復預設選項（全部選項）
        amortizationSubjectSelect.innerHTML = `
            <option value="">請選擇</option>
            <option value="6102001">租金支出–房子</option>
            <option value="6102003">租金支出–其他</option>
            <option value="6111005">保險費</option>
            <option value="6110003">電腦使用費–軟體</option>
        `;
        amortizationSubjectSelect.disabled = false;
        amortizationSubjectSelect.style.backgroundColor = '';
        amortizationSubjectSelect.style.color = '';
        return;
    }

    const config = amortizationOptions[selectedType];
    
    // 添加對應的選項
    config.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        amortizationSubjectSelect.appendChild(optionElement);
    });

    // 根據預付費用類型設置選單狀態
    if (config.disabled) {
        // 預付保險費和預付軟體使用費：反灰並鎖定
        // 重要：先設置值，再設置disabled狀態
        if (config.autoSelect) {
            amortizationSubjectSelect.value = config.autoSelect;
        }
        
        amortizationSubjectSelect.disabled = true;
        amortizationSubjectSelect.style.backgroundColor = '#f5f5f5';
        amortizationSubjectSelect.style.color = '#999';
        
        // 確保即使disabled狀態下，表單提交時也能獲取到值
        // 添加一個隱藏的input來確保值能被提交
        let hiddenInput = document.getElementById('hidden-amortize-code');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'hidden-amortize-code';
            hiddenInput.name = 'amortizeExpenseCode';
            amortizationSubjectSelect.parentNode.appendChild(hiddenInput);
        }
        hiddenInput.value = config.autoSelect;
        
        console.log(`${selectedType} - 攤提科目已自動選擇並鎖定: ${config.autoSelect}`);
        console.log('隱藏input值:', hiddenInput.value);
    } else {
        // 預付租金：允許使用者選擇，但選項限制為租金相關
        amortizationSubjectSelect.disabled = false;
        amortizationSubjectSelect.style.backgroundColor = '';
        amortizationSubjectSelect.style.color = '';
        
        // 移除隱藏的input（如果存在）
        const hiddenInput = document.getElementById('hidden-amortize-code');
        if (hiddenInput) {
            hiddenInput.remove();
        }
        
        console.log(`${selectedType} - 攤提科目選項限制為租金相關科目`);
    }
}

// 預付費用表單提交處理
async function handlePrepaidFormSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // 構建請求資料，欄位名稱與後端DTO完全匹配
    const requestData = {
        entryDate: formData.get('entryDate'),
        expenseType: formData.get('expenseType'),
        expenseName: formData.get('expenseName'),
        creditAccountCode: formData.get('creditAccountCode'),
        amortizeExpenseCode: formData.get('amortizeExpenseCode'),
        amount: parseFloat(formData.get('amount')),
        usageMonth: parseInt(formData.get('usageMonth')),
        description: formData.get('description') || ''
    };

    // 基本驗證
    if (!requestData.entryDate) return alert('請選擇入帳日期');
    if (!requestData.expenseType) return alert('請選擇預付費用類型');
    if (!requestData.expenseName) return alert('請輸入預付費用名稱');
    if (!requestData.creditAccountCode) return alert('請選擇對應貸方科目');
    if (!requestData.amortizeExpenseCode) return alert('請選擇每期攤提科目');
    if (!requestData.amount || requestData.amount <= 0) return alert('請輸入正確的金額');
    if (!requestData.usageMonth || requestData.usageMonth <= 0) return alert('請選擇使用月數');

    // 詳細的除錯資訊
    console.log('=== 表單資料除錯 ===');
    console.log('原始FormData:');
    for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value} (${typeof value})`);
    }
    
    console.log('\n處理後的requestData:');
    Object.entries(requestData).forEach(([key, value]) => {
        console.log(`  ${key}: ${value} (${typeof value})`);
    });
    
    console.log('\n發送到後端的JSON:');
    console.log(JSON.stringify(requestData, null, 2));
    
    try {
        console.log('開始發送請求到:', 'https://127.0.0.1:8443/api/prepaid-expenses');
        
        const response = await fetch('https://127.0.0.1:8443/api/prepaid-expenses', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log('成功回應:', responseText);
            alert('預付費用分錄已成功提交！');
            document.getElementById('journal-entry-form').reset();
            setDefaultDates();
            updateAmortizationSubject('');
        } else {
            // 嘗試獲取更詳細的錯誤資訊
            let errorInfo;
            try {
                const errorText = await response.text();
                console.error('後端錯誤回應 (文字):', errorText);
                
                // 嘗試解析為JSON
                try {
                    errorInfo = JSON.parse(errorText);
                    console.error('後端錯誤回應 (JSON):', errorInfo);
                } catch (e) {
                    errorInfo = errorText;
                }
            } catch (e) {
                console.error('無法讀取錯誤回應:', e);
                errorInfo = '無法讀取錯誤訊息';
            }
            
            alert(`提交失敗：${response.status} - ${response.statusText}\n錯誤詳情: ${JSON.stringify(errorInfo, null, 2)}`);
        }
    } catch (error) {
        console.error('請求發生例外:', error);
        alert(`提交失敗，請檢查網路連線並重試\n錯誤: ${error.message}`);
    }
}

// DOMContentLoaded 事件處理
document.addEventListener("DOMContentLoaded", function () {
    // 設置預設日期
    setDefaultDates();

    // 日期輸入處理
    const wrapper = document.querySelector(".date-wrapper");
    const dateInput = document.getElementById("entry-date");

    if (wrapper && dateInput) {
        wrapper.addEventListener("click", function () {
            if (dateInput.showPicker) {
                dateInput.showPicker();
            }
            dateInput.focus();
        });
    }

    // 預付費用類型聯動功能
    const expenseTypeSelect = document.getElementById('expense-type');
    if (expenseTypeSelect) {
        // 監聽預付費用類型選擇變化
        expenseTypeSelect.addEventListener('change', function() {
            const selectedType = this.value;
            console.log('選擇的預付費用類型:', selectedType);
            updateAmortizationSubject(selectedType);
        });

        // 初始化攤提科目選單
        updateAmortizationSubject(expenseTypeSelect.value);
    }

    // 表單提交處理
    const journalForm = document.getElementById('journal-entry-form');
    if (journalForm) {
        journalForm.addEventListener('submit', handlePrepaidFormSubmission);
    }

    console.log('預付費用頁面初始化完成');
});