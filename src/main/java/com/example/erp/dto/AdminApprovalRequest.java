package com.example.erp.dto;

/**
 * 管理員審核請求DTO
 */
public class AdminApprovalRequest {
    private String voucherNumber;  // 傳票編號
    private String status;         // 新狀態 (APPROVED/REJECTED)
    private String reason;         // 原因

    // Constructors
    public AdminApprovalRequest() {}

    public AdminApprovalRequest(String voucherNumber, String status, String reason) {
        this.voucherNumber = voucherNumber;
        this.status = status;
        this.reason = reason;
    }

    // Getters and Setters
    public String getVoucherNumber() {
        return voucherNumber;
    }

    public void setVoucherNumber(String voucherNumber) {
        this.voucherNumber = voucherNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}