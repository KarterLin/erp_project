-- erp.sql
-- 只負責建立資料表與索引；外鍵請在 02_foreign_keys.sql 加

CREATE TABLE account (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(255) NOT NULL UNIQUE,                 -- 科目代碼（如1001）
  name VARCHAR(100) NOT NULL,                        -- 科目名稱（如：銀行存款）
  type ENUM('asset','liability','equity','revenue','expense') NOT NULL,
  parent_id BIGINT DEFAULT NULL,                     -- 父科目（可為 NULL）
  is_active BOOLEAN DEFAULT TRUE,
  KEY idx_account_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE journal_entry (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entry_date DATE NOT NULL,                          -- 分錄日期
  voucher_number VARCHAR(50) UNIQUE,
  user_id BIGINT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  reason VARCHAR(500) NULL,                          -- 審核原因
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE journal_detail (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  journal_entry_id BIGINT NOT NULL,                  -- 所屬分錄主表
  account_id BIGINT NOT NULL,                        -- 對應科目
  debit DECIMAL(12,2) DEFAULT 0.00,                  -- 借方金額
  credit DECIMAL(12,2) DEFAULT 0.00,                 -- 貸方金額
  description VARCHAR(255),                          -- 分錄描述
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  amortization_schedule_id BIGINT NULL,

  FULLTEXT KEY ft_detail_description (description),

  KEY idx_detail_entry_id (journal_entry_id),
  KEY idx_detail_account_id (account_id),
  KEY idx_detail_amortization_id (amortization_schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE amortization_schedule (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  journal_detail_id BIGINT NOT NULL,                 -- 原始資產明細
  category ENUM('PREPAID_EXPENSE','AMORTIZATION','FIXED_ASSET','INTANGIBLE_ASSET') NOT NULL,
  asset_code VARCHAR(50),
  asset_name VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  last_generated_date DATE,
  total_amount DECIMAL(18,2) NOT NULL,
  monthly_amount DECIMAL(18,2) NOT NULL,
  months INT NOT NULL,
  residual_value DECIMAL(18,2) DEFAULT 0,
  depreciation_account_id BIGINT,                    -- 折舊費用科目
  credit_account_id BIGINT,
  status ENUM('ACTIVE','FINISHED','CANCELLED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_amort_detail_id (journal_detail_id),
  KEY idx_amort_depr_account_id (depreciation_account_id),
  KEY idx_amort_credit_account_id (credit_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE company_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) DEFAULT NULL,
  taxid VARCHAR(255) UNIQUE,
  responsible_person VARCHAR(255) DEFAULT NULL,
  res_phone VARCHAR(255) DEFAULT NULL,
  res_email VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL,
  status INT(11) DEFAULT NULL,
  company_id BIGINT DEFAULT NULL,
  KEY idx_user_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE confirmation_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  confirmed_at DATETIME DEFAULT NULL,
  user_id BIGINT DEFAULT NULL,
  KEY idx_conf_token_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refresh_token (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT DEFAULT NULL,
  token VARCHAR(255) NOT NULL,                       -- 不設 UNIQUE（可重覆）
  expiry_date DATETIME(6) NOT NULL,
  revoked TINYINT(1) NOT NULL,
  KEY idx_refresh_user_id (user_id),
  KEY idx_refresh_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permission (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE,
  description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 建議改為多對多的複合主鍵，避免一個 role 只能對應一個 permission 的限制
CREATE TABLE role_permission (
  role VARCHAR(20) NOT NULL,
  permission_id INT(11) NOT NULL,
  PRIMARY KEY (role, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;