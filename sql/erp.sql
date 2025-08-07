CREATE TABLE account (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(255) NOT NULL UNIQUE,              -- 科目代碼（如1001）
  name VARCHAR(100) NOT NULL,                    -- 科目名稱（如：銀行存款）
  type ENUM('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,  -- 科目分類
  parent_id BIGINT DEFAULT NULL,                 -- 父科目（樹狀用，可為NULL）
  is_active BOOLEAN DEFAULT TRUE                 -- 是否啟用
);


CREATE TABLE journal_entry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entry_date DATE NOT NULL,                      -- 分錄日期
  voucher_number VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 建立時間
);


CREATE TABLE journal_detail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  journal_entry_id BIGINT NOT NULL,              -- 所屬分錄主表
  account_id BIGINT NOT NULL,                    -- 對應科目
  debit DECIMAL(12,2) DEFAULT 0.00,              -- 借方金額
  credit DECIMAL(12,2) DEFAULT 0.00,             -- 貸方金額
  description VARCHAR(255) ,                     -- 分錄描述
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  
  FULLTEXT KEY description (description),

  FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES account(id)
);

CREATE TABLE amortization_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    journal_detail_id BIGINT NOT NULL,  -- 原始資產明細
    category ENUM('PREPAID_EXPENSE', 'AMORTIZATION', 'FIXED_ASSET', 'INTANGIBLE_ASSET') NOT NULL,
    asset_code VARCHAR(50),
    asset_name VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    last_generated_date DATE ,
    total_amount DECIMAL(18,2) NOT NULL,
    monthly_amount DECIMAL(18,2) NOT NULL,
    months INT NOT NULL,
    residual_value DECIMAL(18,2) DEFAULT 0,
    depreciation_account_id BIGINT, -- 折舊費用科目
    credit_account_id BIGINT,
    status ENUM('ACTIVE', 'FINISHED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (journal_detail_id) REFERENCES journal_detail(id),
    FOREIGN KEY (depreciation_account_id) REFERENCES account(id),
    FOREIGN KEY (credit_account_id) REFERENCES account(id)
);


