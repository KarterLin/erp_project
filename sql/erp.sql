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
  
  amortization_schedule_id BIGINT NULL,

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

CREATE TABLE `company_info` (
  `id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
  `company_name` varchar(255) DEFAULT NULL,
  `taxid` varchar(255) UNIQUE,
  `responsible_person` varchar(255) DEFAULT NULL,
  `res_phone` varchar(255) DEFAULT NULL,
  `res_email` varchar(255) DEFAULT NULL
) 
CREATE TABLE `user_info` (
  `id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
  `account` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE,
  `role` varchar(20) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `company_id` bigint(20) DEFAULT NULL
 )
ALTER TABLE `user_info`
	ADD KEY `company_id` (`company_id`);
CREATE TABLE `confirmation_tokens` (
  `id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
)
ALTER TABLE `confirmation_tokens`
  ADD CONSTRAINT `FKrj6hpi5gy4mkxydpuoynffd0i` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`id`);
CREATE TABLE `refresh_token` (
  `id` bigint(20) PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `token` varchar(255) NOT UNIQUE,
  `expiry_date` datetime(6) NOT NULL,
  `revoked` tinyint(1) NOT NULL
ALTER TABLE `refresh_token`
  ADD CONSTRAINT `FKkupq8l7d5fqk56k0r5ynumimt` FOREIGN KEY (`user_id`) REFERENCES `user_info` (`id`);  
CREATE TABLE `permission` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE,
  `description` varchar(255) DEFAULT NULL
)
CREATE TABLE `role_permission` (
  `role` varchar(20) PRIMARY KEY,
  `permission_id` int(11) NOT NULL
)	
ALTER TABLE `role_permission`
  ADD CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE;