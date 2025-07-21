package com.example.erp.util;

import java.time.LocalDate;

public class OpenDateValidator {
	 // 預設開帳日，可擴充成從 DB 或設定檔載入
    private static final LocalDate OPEN_DATE = LocalDate.of(2025, 1, 1);

    // 檢查指定日期是否合法（不可早於開帳日）
    public static void validate(LocalDate date) {
        if (date.isBefore(OPEN_DATE)) {
            throw new IllegalArgumentException("日期不可早於開帳日：" + OPEN_DATE);
        }
    }

    // 檢查區間是否合法
    public static void validateRange(LocalDate start, LocalDate end) {
        if (start.isBefore(OPEN_DATE)) {
            throw new IllegalArgumentException("開始日期不可早於開帳日：" + OPEN_DATE);
        }
        if (end.isBefore(start)) {
            throw new IllegalArgumentException("結束日期不可早於開始日期！");
        }
    }

    // 取得目前設定的開帳日（如需顯示）
    public static LocalDate getOpenDate() {
        return OPEN_DATE;
    }

}
