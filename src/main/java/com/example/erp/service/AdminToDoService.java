package com.example.erp.service;

import com.example.erp.dto.AdminApprovalRequest;
import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.dto.ToDoEntryDTO.ToDoDetailDTO;
import com.example.erp.entity.EntryStatus;
import com.example.erp.entity.JournalEntry;
import com.example.erp.entity.JournalDetail;
import com.example.erp.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminToDoService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 獲取所有待審核的分錄（只顯示 PENDING 狀態）
     */
    public List<ToDoEntryDTO> getPendingEntries() {
        // 使用 JPQL 查詢只有 PENDING 狀態的分錄
        String jpql = "SELECT DISTINCT je FROM JournalEntry je " +
                     "LEFT JOIN FETCH je.details jd " +
                     "LEFT JOIN FETCH jd.account " +
                     "WHERE je.status = :status " +
                     "ORDER BY je.entryDate DESC, je.voucherNumber DESC";
        
        List<JournalEntry> journalEntries = entityManager.createQuery(jpql, JournalEntry.class)
                                                        .setParameter("status", EntryStatus.PENDING)
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
                todoEntry.setStatus("已提交待審核"); // PENDING 狀態顯示為中文
                
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
     * 更新分錄狀態
     */
    @Transactional
    public void updateEntryStatus(AdminApprovalRequest request) {
        // 根據傳票編號查找分錄
        JournalEntry entry = journalEntryRepository.findByVoucherNumber(request.getVoucherNumber());
        
        if (entry == null) {
            throw new RuntimeException("找不到傳票編號: " + request.getVoucherNumber());
        }

        // 只允許更新 PENDING 狀態的分錄
        if (entry.getStatus() != EntryStatus.PENDING) {
            throw new RuntimeException("只能更新待審核狀態的分錄");
        }

        // 更新狀態
        switch (request.getStatus().toUpperCase()) {
            case "APPROVED":
                entry.setStatus(EntryStatus.APPROVED);
                break;
            case "REJECTED":
                entry.setStatus(EntryStatus.REJECTED);
                break;
            default:
                throw new RuntimeException("無效的狀態: " + request.getStatus());
        }

        // 保存更新
        journalEntryRepository.save(entry);
        
        // TODO: 這裡可以記錄審核日誌，包含審核原因
        // 可能需要創建一個審核記錄表來保存 reason
    }
}