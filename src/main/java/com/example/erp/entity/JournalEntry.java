package com.example.erp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.CreatedBy;

@Getter
@Setter
@Entity
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
    
    @OneToMany(mappedBy = "journalEntry", cascade = CascadeType.ALL)
    private List<JournalDetail> details;

    
    
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

    // getters and setters

    // public void setStatus(EntryStatus entryStatus) {
    //     throw new UnsupportedOperationException("Not supported yet.");
    // }

    // public void setStatus(EntryStatus entryStatus) {
    //     throw new UnsupportedOperationException("Not supported yet.");
    // }
}
