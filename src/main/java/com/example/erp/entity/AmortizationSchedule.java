package com.example.erp.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "amortization_schedule")
public class AmortizationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 關聯到來源分錄明細
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_detail_id", nullable = false)
    private JournalDetail journalDetail;

    // 類別（預付費用 / 固定資產 / 無形資產）
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Category category;

    // 資產編號
    @Column(name = "asset_code", length = 50)
    private String assetCode;

    // 資產名稱
    @Column(name = "asset_name", length = 255)
    private String assetName;

    // 攤提開始與結束日期
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // 總金額（扣除殘值後）
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    // 每月攤提金額
    @Column(name = "monthly_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal monthlyAmount;

    // 總期數（以月為單位）
    @Column(nullable = false)
    private Integer months;

    // 殘值
    @Column(name = "residual_value", precision = 18, scale = 2)
    private BigDecimal residualValue = BigDecimal.ZERO;

    // 借方帳戶（折舊費用、攤銷費用)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depreciation_account_id")
    private Account depreciationAccount;
    
    // 貸方帳戶（累積折舊、累積攤銷等）
    @ManyToOne
    @JoinColumn(name = "credit_account_id")
    private Account assetAccount;
    
    @OneToMany(mappedBy = "amortizationSchedule")
    private List<JournalDetail> generatedDetails = new ArrayList<>();
    
    

    public List<JournalDetail> getGeneratedDetails() {
		return generatedDetails;
	}

	public void setGeneratedDetails(List<JournalDetail> generatedDetails) {
		this.generatedDetails = generatedDetails;
	}

	public Account getAssetAccount() {
		return assetAccount;
	}

	public void setAssetAccount(Account assetAccount) {
		this.assetAccount = assetAccount;
	}

	// 狀態
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleStatus status = ScheduleStatus.ACTIVE;

    // 建立與更新時間
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // 最後一次產生攤提分錄的日期
    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    public AmortizationSchedule() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public JournalDetail getJournalDetail() {
		return journalDetail;
	}

	public void setJournalDetail(JournalDetail journalDetail) {
		this.journalDetail = journalDetail;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public String getAssetCode() {
		return assetCode;
	}

	public void setAssetCode(String assetCode) {
		this.assetCode = assetCode;
	}

	public String getAssetName() {
		return assetName;
	}

	public void setAssetName(String assetName) {
		this.assetName = assetName;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDate startDate) {
		this.startDate = startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDate endDate) {
		this.endDate = endDate;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public BigDecimal getMonthlyAmount() {
		return monthlyAmount;
	}

	public void setMonthlyAmount(BigDecimal monthlyAmount) {
		this.monthlyAmount = monthlyAmount;
	}

	public Integer getMonths() {
		return months;
	}

	public void setMonths(Integer months) {
		this.months = months;
	}

	public BigDecimal getResidualValue() {
		return residualValue;
	}

	public void setResidualValue(BigDecimal residualValue) {
		this.residualValue = residualValue;
	}

	public Account getDepreciationAccount() {
		return depreciationAccount;
	}

	public void setDepreciationAccount(Account depreciationAccount) {
		this.depreciationAccount = depreciationAccount;
	}

	public ScheduleStatus getStatus() {
		return status;
	}

	public void setStatus(ScheduleStatus status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public LocalDate getLastGeneratedDate() {
		return lastGeneratedDate;
	}

	public void setLastGeneratedDate(LocalDate lastGeneratedDate) {
		this.lastGeneratedDate = lastGeneratedDate;
	}

    // ===== Getter & Setter =====
    
}

