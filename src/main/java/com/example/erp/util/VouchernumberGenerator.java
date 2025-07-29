package com.example.erp.util;

import java.time.LocalDate;

public class VouchernumberGenerator {
	
	
	public static String generate(LocalDate entryDate, long sequenceNumber) {	
        String rocYear = String.valueOf(entryDate.getYear() - 1911);
        String monthDay = String.format("%02d%02d", entryDate.getMonthValue(), entryDate.getDayOfMonth());
        String base = rocYear + monthDay;
        String sequence = String.format("%03d", sequenceNumber); // 補足三位數
        return base + sequence;
    }

    
}
