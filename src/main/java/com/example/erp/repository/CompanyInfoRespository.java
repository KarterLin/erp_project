package com.example.erp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.erp.entity.CompanyInfo;




@Repository
public interface CompanyInfoRespository extends JpaRepository<CompanyInfo, Long>{
	
	boolean existsByTaxId(String taxId);
	
	Optional<CompanyInfo> findByREmail(String rEmail);  // 未驗證前rEmail必等於uEmail
	
	Optional<CompanyInfo> findByid(Long id);
}
