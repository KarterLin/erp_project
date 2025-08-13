package com.example.erp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.PropertyListDTO;
import com.example.erp.entity.Category;
import com.example.erp.service.PropertyListService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Property List", description = "資產清單查詢 API")
public class PropertyListController {
	
	@Autowired
	private PropertyListService propertyListService;
	
	
	 @Operation(
		        summary = "取得固定資產清單",
		        description = "回傳所有固定資產（Category = FIXED_ASSET）的清單資料"
		    )
	@GetMapping("api/fixed-asset")
	public List<PropertyListDTO> getFAProperty(){
		return propertyListService.getPropertyList(Category.FIXED_ASSET);
	}

	 
	@Operation(
		        summary = "取得無形資產清單",
		        description = "回傳所有無形資產（Category = INTANGIBLE_ASSET）的清單資料"
		    ) 
	@GetMapping("api/intangible-asset")
	public List<PropertyListDTO> getIAProperty(){
		return propertyListService.getPropertyList(Category.INTANGIBLE_ASSET);
	}
}
