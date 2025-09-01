package com.example.erp.service;

import com.example.erp.dto.AdminApprovalRequest;
import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.dto.ToDoEntryDTO.ToDoDetailDTO;
import com.example.erp.entity.JournalEntry;
import com.example.erp.entity.EntryStatus;
import com.example.erp.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.sql.Date;
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
        // 使用原生 SQL 查詢以包含用戶資訊，只查詢待審核狀態
        String sql = """
            SELECT DISTINCT 
                je.entry_date,
                je.voucher_number,
                je.status,
                u.account as input_user
            FROM journal_entry je
            LEFT JOIN user_info u ON je.user_id = u.id
            WHERE je.status = 'PENDING'
            ORDER BY je.entry_date ASC, je.voucher_number ASC
        """;

        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();
        
        Map<String, ToDoEntryDTO> groupedEntries = new LinkedHashMap<>();
        
        for (Object[] row : results) {
            String voucherNumber = (String) row[1];
            
            if (!groupedEntries.containsKey(voucherNumber)) {
                ToDoEntryDTO todoEntry = new ToDoEntryDTO();
                todoEntry.setEntryDate(((Date) row[0]).toLocalDate());
                todoEntry.setVoucherNumber(voucherNumber);
                todoEntry.setStatus((String) row[2]); // 直接使用資料庫狀態
                todoEntry.setInputUser((String) row[3]); // 輸入人員
                
                // 獲取該傳票的詳細資料
                todoEntry.setDetails(getDetailsForVoucher(voucherNumber));
                
                groupedEntries.put(voucherNumber, todoEntry);
            }
        }
        
        return new ArrayList<>(groupedEntries.values());
    }

    /**
     * 獲取指定傳票的詳細資料
     */
    private List<ToDoDetailDTO> getDetailsForVoucher(String voucherNumber) {
        String detailSql = """
            SELECT 
                a.code,
                a.name,
                jd.debit,
                jd.credit,
                jd.description
            FROM journal_detail jd
            JOIN journal_entry je ON jd.journal_entry_id = je.id
            JOIN account a ON jd.account_id = a.id
            WHERE je.voucher_number = ?
            ORDER BY jd.id
        """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> detailResults = entityManager.createNativeQuery(detailSql)
                .setParameter(1, voucherNumber)
                .getResultList();
        
        List<ToDoDetailDTO> details = new ArrayList<>();
        
        for (Object[] row : detailResults) {
            ToDoDetailDTO detail = new ToDoDetailDTO();
            detail.setAccountCode((String) row[0]);
            detail.setAccountName((String) row[1]);
            detail.setDebitAmount((BigDecimal) row[2]);
            detail.setCreditAmount((BigDecimal) row[3]);
            detail.setDescription((String) row[4]);
            
            details.add(detail);
        }
        
        return details;
    }

    /**
     * 更新分錄狀態（核准/退回）
     */
    @Transactional
    public void updateEntryStatus(AdminApprovalRequest request) {
        try {
            System.out.println("開始處理審核請求: " + request.getVoucherNumber() + ", 狀態: " + request.getStatus());
            
            // 先檢查傳票是否存在
            JournalEntry entry = journalEntryRepository.findByVoucherNumber(request.getVoucherNumber());
            
            if (entry == null) {
                throw new RuntimeException("找不到傳票編號: " + request.getVoucherNumber());
            }
            
            System.out.println("找到傳票，當前狀態: " + entry.getStatus());
            
            // 檢查當前狀態是否為待審核
            if (entry.getStatus() != EntryStatus.PENDING) {
                throw new RuntimeException("傳票 " + request.getVoucherNumber() + " 不在待審核狀態，無法處理");
            }
            
            // 更新狀態和原因
            if ("APPROVED".equals(request.getStatus())) {
                entry.setStatus(EntryStatus.APPROVED);
                System.out.println("設定狀態為 APPROVED");
            } else if ("REJECTED".equals(request.getStatus())) {
                entry.setStatus(EntryStatus.REJECTED);
                System.out.println("設定狀態為 REJECTED");
            } else {
                throw new RuntimeException("無效的狀態: " + request.getStatus());
            }
            
            // 設定審核原因
            entry.setReason(request.getReason());
            System.out.println("設定原因: " + request.getReason());
            
            // 保存更新
            journalEntryRepository.save(entry);
            System.out.println("成功保存更新");
            
        } catch (Exception e) {
            System.err.println("更新狀態時發生錯誤: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("更新狀態失敗: " + e.getMessage(), e);
        }
    }
}