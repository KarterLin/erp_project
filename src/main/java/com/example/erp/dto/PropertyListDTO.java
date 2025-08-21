package com.example.erp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "財產清單資料 DTO，用於呈現固定資產或無形資產的報表")
public class PropertyListDTO {
	
	@Schema(description = "類型(科目名稱)")
	private String Type;
	
	@Schema(description = "取得日期", example = "2025/01/01")
	private LocalDate entryDate;
	
	@Schema(description = "財產編號", example = "FA00001")
	private String AssetCode;
	
	@Schema(description = "財產名稱", example = "影印機")
	private String AssetName;
	
	@Schema(description = "原始取得成本", example = "50000")
	private BigDecimal TotalAmount;
	 
	@Schema(description = "預計殘值", example = "5000")
	private BigDecimal salvageValue;
	 
	@Schema(description = "累計折舊 / 累計攤銷金額", example = "25000")
	private BigDecimal AccumulateAmount;
	
	@Schema(description = "帳面淨額（原始成本 - 累計折舊）", example = "25000")
	private BigDecimal NetAmount;
	
	public PropertyListDTO(String type, LocalDate entryDate, String assetCode, String assetName,
            BigDecimal totalAmount, BigDecimal salvageValue, BigDecimal accumulateAmount, BigDecimal dummyTotalAmount) {
         this.Type = type;
         this.entryDate = entryDate;
         this.AssetCode = assetCode;
         this.AssetName = assetName;
         this.TotalAmount = totalAmount;
         this.salvageValue = salvageValue;
         this.AccumulateAmount = accumulateAmount;
         this.NetAmount = dummyTotalAmount.subtract(accumulateAmount);  // 自己在 DTO 裡做運算
}

	
	public String getType() {
		return Type;
	}
	public void setType(String type) {
		Type = type;
	}
	public LocalDate getEntryDate() {
		return entryDate;
	}
	public void setEntryDate(LocalDate entryDate) {
		this.entryDate = entryDate;
	}
	public String getAssetCode() {
		return AssetCode;
	}
	public void setAssetCode(String assetCode) {
		AssetCode = assetCode;
	}
	public String getAssetName() {
		return AssetName;
	}
	public void setAssetName(String assetName) {
		AssetName = assetName;
	}
	public BigDecimal getTotalAmount() {
		return TotalAmount;
	}
	public void setTotalAmount(BigDecimal totalAmount) {
		TotalAmount = totalAmount;
	}
	public BigDecimal getSalvageValue() {
		return salvageValue;
	}
	public void setSalvageValue(BigDecimal salvageValue) {
		this.salvageValue = salvageValue;
	}
	public BigDecimal getAccumulateAmount() {
		return AccumulateAmount;
	}
	public void setAccumulateAmount(BigDecimal accumulateAmount) {
		AccumulateAmount = accumulateAmount;
	}
	public BigDecimal getNetAmount() {
		return NetAmount;
	}
	public void setNetAmount(BigDecimal netAmount) {
		NetAmount = netAmount;
	}
	
	

}
