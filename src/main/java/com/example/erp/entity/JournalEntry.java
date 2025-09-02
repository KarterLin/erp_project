package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "journal_entry")
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "voucher_number")
    private String voucherNumber;

    @CreatedBy
    @Column(name = "user_id")
    private Long userId;   // 自動帶入目前使用者 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EntryStatus status = EntryStatus.PENDING; // 預設待審核
    
    // 審核原因欄位
    @Column(name = "reason", length = 500)
    private String reason;
    
    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL)
    private List<JournalDetail> details;

    // 與 UserInfo 的關係（用於查詢輸入人員資訊）
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private UserInfo userInfo;

    // 手寫的 getter/setter 方法保持原樣
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<JournalDetail> getDetails() {
        return details;
    }

    public void setDetails(List<JournalDetail> details) {
        this.details = details;
    }

    public String getVoucherNumber() {
        return voucherNumber;
    }

    public void setVoucherNumber(String voucherNumber) {
        this.voucherNumber = voucherNumber;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public EntryStatus getStatus() {
        return status;
    }

    public void setStatus(EntryStatus status) {
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }
}