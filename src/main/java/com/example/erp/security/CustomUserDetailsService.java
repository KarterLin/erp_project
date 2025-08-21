package com.example.erp.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.erp.entity.UserInfo;
import com.example.erp.repository.UserInfoRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserInfoRepository userRepository;
	private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);
	
	
	@Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		log.info("Login attempt: {}, rawPassword from request = {}", email);
		
		UserInfo user = userRepository.findByUEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found" + email));
		
		
		return new CustomUserDetails(user);
		
    }
	
}
