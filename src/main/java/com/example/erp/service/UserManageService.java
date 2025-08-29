package com.example.erp.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.entity.CompanyInfo;
import com.example.erp.entity.UserInfo;
import com.example.erp.exception.NotFoundException;
import com.example.erp.payload.response.AllUserResponse;
import com.example.erp.payload.response.ApiResponse;
import com.example.erp.repository.CompanyInfoRespository;
import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserManageService {
	private final UserInfoRepository userRepository;
	private final CompanyInfoRespository companyRepository;
	
	@Transactional(readOnly = true)
    public ApiResponse<List<AllUserResponse>> getAllUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserInfo user = userRepository.findByUEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("找不到使用者"));
        CompanyInfo company = companyRepository.findById(user.getcId())
                .orElseThrow(() -> new NotFoundException("找不到公司資料"));
        
        List<UserInfo> allUser = company.getUsers();
	
        List<AllUserResponse> responseList = allUser.stream()
                .map(AllUserResponse::fromEntity)
                .toList();
        return ApiResponse.success("帳號資料取得成功", responseList);
	}
	
	@Transactional(readOnly = true)
    public ApiResponse<AllUserResponse> getUserById(Long id) {
		UserInfo user = userRepository.findById(id)
	            .orElseThrow(() -> new NotFoundException("找不到使用者"));

	    AllUserResponse response = AllUserResponse.fromEntity(user);
	    return ApiResponse.success("帳號資料取得成功", response);
	}
	
}
	
	

