package com.example.erp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;

import io.lettuce.core.dynamic.annotation.Param;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
	Optional<Account> findByCode(String code);
	@Query("SELECT a.code FROM Account a WHERE a.name = :name")
	Optional<String> findCodeByName(@Param("name") String name);

	@Query("SELECT new com.example.erp.dto.AccountDTO(a.code, a.name) FROM Account a WHERE a.id <> 65")
	List<AccountDTO> findAllToDTO();

	@Query("SELECT new com.example.erp.dto.AccountDTO(a.code, a.name) FROM Account a WHERE a.code IN :codes")
	List<AccountDTO> findAccountsByCodes(@Param("codes") List<String> codes);


}
