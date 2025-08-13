package com.example.erp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.erp.dto.PropertyListDTO;
import com.example.erp.entity.Category;
import com.example.erp.service.PropertyListService;

@RestController
public class PropertyListController {
	
	@Autowired
	private PropertyListService propertyListService;
	
	@GetMapping("api/fixed-asset")
	public List<PropertyListDTO> getFAProperty(){
		return propertyListService.getPropertyList(Category.FIXED_ASSET);
	}

	@GetMapping("api/intangible-asset")
	public List<PropertyListDTO> getIAProperty(){
		return propertyListService.getPropertyList(Category.INTANGIBLE_ASSET);
	}
}
