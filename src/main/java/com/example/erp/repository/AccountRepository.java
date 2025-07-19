package com.example.erp.repository;

import com.example.erp.dto.AccountDTO;
import com.example.erp.entity.Account;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
	Optional<Account> findByCode(String code);
	
	@Query("SELECT new com.example.erp.dto.AccountDTO(a.code, a.name) FROM Account a")
	List<AccountDTO> findAllToDTO();

}
