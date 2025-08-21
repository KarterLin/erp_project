package com.example.erp.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;
import com.example.erp.security.CustomUserDetailsService;


@Configuration
@EnableWebSecurity
public class ApplicationSecurityConfig {
	private final UserInfoRepository userRepository;
	
	public ApplicationSecurityConfig(UserInfoRepository userRepository) {
		this.userRepository = userRepository;
	}
	
	
	@Bean
	public UserDetailsService userDetailsService(){
	    return username -> userRepository.findByUEmail(username)
	    		.map(CustomUserDetails::new)  // 把 UserInfo 包成 CustomUserDetails
	    		.orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}

	@Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
	
	@Bean
	public AuthenticationProvider authenticationProvider(CustomUserDetailsService userDetailsService,
	                                                     PasswordEncoder passwordEncoder) {
	    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
	    authProvider.setUserDetailsService(userDetailsService);
	    authProvider.setPasswordEncoder(passwordEncoder);
	    return authProvider;
	}
	
	@Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
	
	
}
