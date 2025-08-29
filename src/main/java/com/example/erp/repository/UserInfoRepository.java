package com.example.erp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.UserInfo;



@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long>{
	Optional<UserInfo> findByUEmail(String uEmail);
	
	@Modifying
	@Transactional
	@Query("UPDATE UserInfo u SET u.cId = :companyId WHERE u.uEmail = :uEmail")
	void updateCompanyId(@Param("uEmail")String uEmail,@Param("companyId") Long companyId);
	
	@Modifying
    @Transactional
    @Query(value = "UPDATE UserInfo u SET u.status = 1 WHERE u.uEmail = ?1")
    void enableUser(String email);   // status= 0:待啟用/1:啟用/2:停用

}
