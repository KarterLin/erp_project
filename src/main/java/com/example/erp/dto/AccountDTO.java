package com.example.erp.dto;

public class AccountDTO {
    private Long id;
    private String code;
    private String name;
    private String type;
    private Long parentId;
    private boolean isActive;
    private String parentName; // 用於顯示父科目名稱

    // 無參構造器
    public AccountDTO() {}

    // 全參構造器
    public AccountDTO(Long id, String code, String name, String type, Long parentId, boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isActive = isActive;
    }

    // 包含父科目名稱的構造器
    public AccountDTO(Long id, String code, String name, String type, Long parentId, boolean isActive, String parentName) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.isActive = isActive;
        this.parentName = parentName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    @Override
    public String toString() {
        return "AccountDTO{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", parentId=" + parentId +
                ", isActive=" + isActive +
                ", parentName='" + parentName + '\'' +
                '}';
    }
}