package com.example.erp.controller;

import com.example.erp.dto.JournalEntryRequest;
import com.example.erp.entity.JournalEntry;
import com.example.erp.service.JournalEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/journal-entries")
public class JournalEntryController {

    @Autowired
    private JournalEntryService journalEntryService;
    
   

    @GetMapping
    public List<JournalEntry> getAllEntries() {
        return journalEntryService.getAllEntries();
    }

    
    @PostMapping
    public ResponseEntity<String> createEntry(@RequestBody JournalEntryRequest request) {
        journalEntryService.createEntryWithDetails(request);
        return ResponseEntity.ok("分錄已成功新增！");
    }
    
}
