
  -- 02_foreign_keys.sql
-- 請在 erp.sql 建完表後，再執行本檔

-- 可選：若既有資料可能違反 FK，先暫時關閉檢查
-- SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE journal_detail
  ADD CONSTRAINT fk_jd_amort
  FOREIGN KEY (amortization_schedule_id)
  REFERENCES amortization_schedule(id)
  ON DELETE CASCADE;

-- journal_entry.user_id FK
ALTER TABLE journal_entry
  ADD CONSTRAINT fk_journal_entry_user
  FOREIGN KEY (user_id) REFERENCES user_info(id);
  
-- account 親子關係（可選；若不想限制可略過）
ALTER TABLE account
  ADD CONSTRAINT fk_account_parent
  FOREIGN KEY (parent_id) REFERENCES account(id)
  ON DELETE SET NULL;

-- journal_detail -> journal_entry（刪主表連動刪明細）
ALTER TABLE journal_detail
  ADD CONSTRAINT fk_detail_entry
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id)
  ON DELETE CASCADE;

-- journal_detail -> account
ALTER TABLE journal_detail
  ADD CONSTRAINT fk_detail_account
  FOREIGN KEY (account_id) REFERENCES account(id);

-- 注意：journal_detail.amortization_schedule_id 是否加 FK 會造成雙向關聯，
-- 可能使插入順序複雜化，常見做法是「只在 amortization_schedule 這邊建立 FK」，維持單向。

-- amortization_schedule -> journal_detail
ALTER TABLE amortization_schedule
  ADD CONSTRAINT fk_amort_detail
  FOREIGN KEY (journal_detail_id) REFERENCES journal_detail(id);

-- amortization_schedule -> account（折舊費用科目）
ALTER TABLE amortization_schedule
  ADD CONSTRAINT fk_amort_depr_account
  FOREIGN KEY (depreciation_account_id) REFERENCES account(id);

-- amortization_schedule -> account（相對貸方科目）
ALTER TABLE amortization_schedule
  ADD CONSTRAINT fk_amort_credit_account
  FOREIGN KEY (credit_account_id) REFERENCES account(id);

-- user_info -> company_info
ALTER TABLE user_info
  ADD CONSTRAINT fk_user_company
  FOREIGN KEY (company_id) REFERENCES company_info(id);

-- confirmation_tokens -> user_info
ALTER TABLE confirmation_tokens
  ADD CONSTRAINT fk_conf_token_user
  FOREIGN KEY (user_id) REFERENCES user_info(id);

-- refresh_token -> user_info
ALTER TABLE refresh_token
  ADD CONSTRAINT fk_refresh_user
  FOREIGN KEY (user_id) REFERENCES user_info(id);

-- role_permission -> permission（role 欄位不設 FK，因為以字串保存 enum）
ALTER TABLE role_permission
  ADD CONSTRAINT fk_role_permission_permission
  FOREIGN KEY (permission_id) REFERENCES permission(id)
  ON DELETE CASCADE;

-- 可選：重新開啟 FK 檢查
-- SET FOREIGN_KEY_CHECKS = 1;
