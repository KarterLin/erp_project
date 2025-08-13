package com.example.erp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.dto.BalanceSheetDTO;
import com.example.erp.repository.BalanceSheetRepository;

@Service
public class BalanceSheetService {

    private final BalanceSheetRepository balanceSheetRepository;

    public BalanceSheetService(BalanceSheetRepository balanceSheetRepository) {
        this.balanceSheetRepository = balanceSheetRepository;
    }

    // 手動寫建構子，注入 repository
    public List<BalanceSheetDTO> getParentBalances(LocalDate startDate, LocalDate endDate) {
    List<Object[]> results = balanceSheetRepository.findParentBalancesByDateRange(startDate, endDate);
    List<BalanceSheetDTO> dtoList = new ArrayList<>();

    for (Object[] row : results) {
        Long parentId = ((Number) row[0]).longValue();
        BigDecimal balance = (BigDecimal) row[1];

        dtoList.add(new BalanceSheetDTO(parentId, null, balance));
    }

    return dtoList;
}

}
