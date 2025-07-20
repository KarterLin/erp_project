DELIMITER $$

CREATE PROCEDURE proc_reverse_virtual_entries(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_ref_entry_id BIGINT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_journal_detail_id BIGINT;
    DECLARE v_account_id BIGINT;
    DECLARE v_debit DECIMAL(12,2);
    DECLARE v_credit DECIMAL(12,2);
    DECLARE v_today VARCHAR(8);
    DECLARE v_voucher_number VARCHAR(20);
    DECLARE v_entry_id BIGINT;
    DECLARE v_count INT;

    -- 游標定義
    DECLARE cur CURSOR FOR
        SELECT jd.id, jd.account_id, jd.debit, jd.credit
        FROM erp.journal_detail jd
        JOIN erp.journal_entry je ON je.id = jd.journal_entry_id
        JOIN erp.account a ON a.id = jd.account_id
        WHERE a.type IN ('revenue', 'expense')
          AND jd.is_active = 1
          AND je.entry_date BETWEEN p_start_date AND p_end_date;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- 取得今天民國年月日（如：1140731）
    SET v_today = CONCAT(
        LPAD(YEAR(CURDATE()) - 1911, 3, '0'),
        LPAD(MONTH(CURDATE()), 2, '0'),
        LPAD(DAY(CURDATE()), 2, '0')
    );

    -- 計算當天已有幾筆 voucher，產生流水號
    SELECT COUNT(*) INTO v_count
    FROM erp.journal_entry
    WHERE voucher_number LIKE CONCAT(v_today, '%');

    SET v_voucher_number = CONCAT(v_today, LPAD(v_count + 1, 3, '0'));

    -- 插入新 journal_entry
    INSERT INTO erp.journal_entry(entry_date, voucher_number, created_at)
    VALUES (CURDATE(), v_voucher_number, NOW());

    SET v_entry_id = LAST_INSERT_ID();

    -- 開啟游標
    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_journal_detail_id, v_account_id, v_debit, v_credit;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 插入反向分錄
        INSERT INTO erp.journal_detail (
            journal_entry_id,
            account_id,
            debit,
            credit,
            is_active,
            is_system_generated,
            description
        )
        VALUES (
            v_entry_id,
            v_account_id,
            v_credit,  -- 原貸 → 借
            v_debit,   -- 原借 → 貸
            0,
            1,
            CONCAT('Reverse of detail_id = ', v_journal_detail_id)
        );

    END LOOP;

    CLOSE cur;
END $$

DELIMITER ;
