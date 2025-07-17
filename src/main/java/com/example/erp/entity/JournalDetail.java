package com.example.erp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "journal_detail")
public class JournalDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    private BigDecimal debit;


	private BigDecimal credit;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_system_generated")
    private Boolean isSystemGenerated = false;

    public Boolean getIsActive() {
    	return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
    	this.isActive = isActive;
    }
    
    public Boolean getIsSystemGenerated() {
    	return isSystemGenerated;
    }
    
    public void setIsSystemGenerated(Boolean isSystemGenerated) {
    	this.isSystemGenerated = isSystemGenerated;
    }
    
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public JournalEntry getJournalEntry() {
		return journalEntry;
	}

	public void setJournalEntry(JournalEntry journalEntry) {
		this.journalEntry = journalEntry;
	}

	public Account getAccount() {
		return account;
	}

	public void setAccount(Account account) {
		this.account = account;
	}

	public BigDecimal getDebit() {
		return debit;
	}

	public void setDebit(BigDecimal debit) {
		this.debit = debit;
	}

	public BigDecimal getCredit() {
		return credit;
	}

	public void setCredit(BigDecimal credit) {
		this.credit = credit;
	}

    // getters and setters
    
}
