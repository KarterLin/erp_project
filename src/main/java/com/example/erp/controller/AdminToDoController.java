package com.example.erp.controller;

import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.dto.AdminApprovalRequest;
import com.example.erp.service.AdminToDoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/admin/todo")
public class AdminToDoController {

    @Autowired
    private AdminToDoService adminToDoService;

    /**
     * 獲取所有待審核的分錄（只顯示 PENDING 狀態）
     */
    @GetMapping("/pending-entries")
    public List<ToDoEntryDTO> getPendingEntries() {
        return adminToDoService.getPendingEntries();
    }

    /**
     * 更新分錄狀態（核准/退回）
     */
    @PostMapping("/update-status")
    public ResponseEntity<String> updateEntryStatus(@RequestBody AdminApprovalRequest request) {
        try {
            adminToDoService.updateEntryStatus(request);
            return ResponseEntity.ok("狀態更新成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("更新失敗: " + e.getMessage());
        }
    }
}