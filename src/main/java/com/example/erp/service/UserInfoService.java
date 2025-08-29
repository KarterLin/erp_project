package com.example.erp.service;

import org.springframework.stereotype.Service;

import com.example.erp.entity.UserInfo;
import com.example.erp.repository.UserInfoRepository;



@Service
public class UserInfoService {

	private final UserInfoRepository userRespository;
	// private String encodedPassword;
	
	public UserInfoService(UserInfoRepository userRespository) {
		this.userRespository = userRespository;
	}
	
	boolean userExists(String uEmail) {
		return userRespository.findByUEmail(uEmail).isPresent();
	}
	
	public UserInfo save(UserInfo userInfo) {
		return userRespository.save(userInfo);
	}
	public void enableUser(String email) {
		userRespository.enableUser(email);
	}
	
	public void updateCompanyId(String email, Long cId) {
		userRespository.updateCompanyId(email, cId);
	}
	
}
