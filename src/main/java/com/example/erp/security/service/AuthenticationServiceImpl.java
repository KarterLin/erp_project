package com.example.erp.security.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.erp.payload.request.AuthenticationRequest;
import com.example.erp.payload.response.AuthenticationResponse;
import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;
import com.example.erp.security.enums.TokenType;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {
	 	private final PasswordEncoder passwordEncoder;
	    private final JwtService jwtService;
	    private final UserInfoRepository userRepository;
	    private final AuthenticationManager authenticationManager;
	    private final RefreshTokenService refreshTokenService;
	    private static final Logger log = LoggerFactory.getLogger(AuthenticationServiceImpl.class);
	    
	    // 產生 JWT access token & Refresh Token
	    @Override
	    public AuthenticationResponse authenticate(AuthenticationRequest request) {
	    	// Spring Security 驗證帳號密碼
	    	authenticationManager.authenticate(
	        		new UsernamePasswordAuthenticationToken(
	        				request.getUEmail(),
	        				request.getPassword()
	        ));
	    	log.info("Login request: email={}, rawPassword={}", request.getUEmail(), request.getPassword());   
	    	// 查詢使用者
	        var user = userRepository.findByUEmail(request.getUEmail()).orElseThrow(() -> 
	        						new IllegalArgumentException("Invalid email or password."));
	        // 檢查帳號狀態 (避免未啟用帳號登入)
	        if (user.getStatus() == null || user.getStatus() == 0) {
	            throw new IllegalStateException("帳號尚未啟用，請先完成 Email 驗證");
	        };
	        // 產生 JWT 與 Refresh Token
	        CustomUserDetails userDetails = new CustomUserDetails(user);
	        var jwt = jwtService.generateToken(userDetails);
	        var refreshToken = refreshTokenService.createRefreshToken(user.getId());
	        var authorities = user.getRole().getAuthorities()
	        		.stream()
	                .map(GrantedAuthority::getAuthority)
	                .toList();
	        
	         return AuthenticationResponse.builder()
	                .accessToken(jwt)
	                .email(user.getuEmail())
	                .id(user.getId())
	                .roles(authorities)
	                .refreshToken(refreshToken.getToken())
	                .tokenType( TokenType.BEARER.name())
	                .build();
	    }
	    
}
