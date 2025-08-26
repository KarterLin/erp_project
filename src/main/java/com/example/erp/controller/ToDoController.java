package com.example.erp.controller;

import com.example.erp.dto.ToDoEntryDTO;
import com.example.erp.service.ToDoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://127.0.0.1:5500")
@RestController
@RequestMapping("/api/todo")
public class ToDoController {

    @Autowired
    private ToDoService toDoService;

    /**
     * 獲取所有待辦分錄（按傳票編號分組）
     */
    @GetMapping("/entries")
    public List<ToDoEntryDTO> getAllToDoEntries() {
        return toDoService.getAllToDoEntries();
    }
}