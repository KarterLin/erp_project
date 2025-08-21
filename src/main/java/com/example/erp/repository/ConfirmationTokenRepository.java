package com.example.erp.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.ConfirmationTokens;


@Repository
public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationTokens, Long> {
	
		Optional<ConfirmationTokens> findByToken(String Token);
		
		@Query("SELECT u.uEmail FROM ConfirmationTokens c JOIN UserInfo u  ON c.userId = u.id WHERE c.token = :token")
		String findEmailByToken(@Param("token") String token);
		
		@Transactional
		@Modifying
		@Query("UPDATE ConfirmationTokens c " + 
						"SET c.confirmedAt = ?2 " +
						"WHERE c.token = ?1")
		int updateConfirmedAt(String Token, LocalDateTime confirmedAt);
		//回傳受影響的資料列數量
}
