package com.example.erp.service;

import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.dto.ToDoEntryDTO.ToDoDetailDTO;
import com.example.erp.entity.JournalEntry;
import com.example.erp.entity.JournalDetail;
import com.example.erp.entity.EntryStatus;
import com.example.erp.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ToDoService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 獲取所有待辦分錄，按傳票編號分組
     */
    public List<ToDoEntryDTO> getAllToDoEntries() {
        // 使用 JPQL 查詢所有分錄，並預先載入關聯資料
        String jpql = "SELECT DISTINCT je FROM JournalEntry je " +
                     "LEFT JOIN FETCH je.details jd " +
                     "LEFT JOIN FETCH jd.account " +
                     "ORDER BY je.entryDate DESC, je.voucherNumber DESC";
        
        List<JournalEntry> journalEntries = entityManager.createQuery(jpql, JournalEntry.class)
                                                        .getResultList();
        
        // 按傳票編號分組
        Map<String, ToDoEntryDTO> groupedEntries = new LinkedHashMap<>();
        
        for (JournalEntry entry : journalEntries) {
            String voucherNumber = entry.getVoucherNumber();
            
            // 如果該傳票編號還沒有被處理過
            if (!groupedEntries.containsKey(voucherNumber)) {
                ToDoEntryDTO todoEntry = new ToDoEntryDTO();
                todoEntry.setEntryDate(entry.getEntryDate());
                todoEntry.setVoucherNumber(voucherNumber);
                todoEntry.setStatus(getStatusDisplayText(entry.getStatus()));
                
                // 處理該分錄的詳細資料
                List<ToDoDetailDTO> details = new ArrayList<>();
                
                if (entry.getDetails() != null) {
                    for (JournalDetail detail : entry.getDetails()) {
                        ToDoDetailDTO detailDTO = new ToDoDetailDTO();
                        detailDTO.setAccountCode(detail.getAccount().getCode());
                        detailDTO.setAccountName(detail.getAccount().getName());
                        detailDTO.setDebitAmount(detail.getDebit());
                        detailDTO.setCreditAmount(detail.getCredit());
                        detailDTO.setDescription(detail.getDescription());
                        
                        details.add(detailDTO);
                    }
                }
                
                todoEntry.setDetails(details);
                groupedEntries.put(voucherNumber, todoEntry);
            }
        }
        
        return new ArrayList<>(groupedEntries.values());
    }
    
    /**
     * 將資料庫狀態轉換為顯示文字
     */
    private String getStatusDisplayText(EntryStatus status) {
        if (status == null) return "未知狀態";
        
        switch (status) {
            case PENDING:
                return "已提交待審核";
            case APPROVED:
                return "已審核通過";
            case REJECTED:
                return "已退回";
            default:
                return "未知狀態";
        }
    }
}