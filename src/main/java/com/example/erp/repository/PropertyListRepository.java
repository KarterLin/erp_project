package com.example.erp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.erp.dto.PropertyListDTO;
import com.example.erp.entity.AmortizationSchedule;
import com.example.erp.entity.Category;

import io.lettuce.core.dynamic.annotation.Param;


public interface PropertyListRepository extends JpaRepository<AmortizationSchedule, Long> {
	@Query("""
			SELECT new com.example.erp.dto.PropertyListDTO(
			    ac.name,
			    a.startDate,
			    a.assetCode,
			    a.assetName,
			    a.totalAmount,
			    a.residualValue,
			    SUM(COALESCE(d.credit, 0)),
			    a.totalAmount-SUM(COALESCE(d.credit, 0))
			)
			FROM AmortizationSchedule a
			JOIN a.journalDetail d
			JOIN d.account ac
			WHERE a.category = :category
			GROUP BY ac.name, a.startDate, a.assetCode, a.assetName, a.totalAmount, a.residualValue
			ORDER BY a.assetCode
			""")
			List<PropertyListDTO> findPropertyListByCategory(@Param("category") Category category);


}
