package com.example.erp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.erp.dto.PropertyListDTO;
import com.example.erp.entity.Category;
import com.example.erp.repository.PropertyListRepository;

@Service
public class PropertyListService {
	
	private PropertyListRepository propertyListRepository;
	
	public PropertyListService(PropertyListRepository propertyListRepository) {
		this.propertyListRepository = propertyListRepository;
	}
	
	public List<PropertyListDTO> getPropertyList(Category category){
		return propertyListRepository.findPropertyListByCategory(category);
	}

}
