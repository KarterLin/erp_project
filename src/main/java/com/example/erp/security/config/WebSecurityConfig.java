package com.example.erp.security.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.example.erp.security.handler.CustomAccessDeniedHandler;
import com.example.erp.security.handler.Http401UnauthorizedEntryPoint;




@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig{
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final Http401UnauthorizedEntryPoint unauthorizedEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
	
    private static final Long MAX_AGE = 3600L;  // 瀏覽器快取存活時間
    private static final int CORS_FILTER_ORDER = -100;  // Filter 註冊順序
    
	public WebSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, AuthenticationProvider authenticationProvider,
													Http401UnauthorizedEntryPoint unauthorizedEntryPoint, CustomAccessDeniedHandler accessDeniedHandler) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.authenticationProvider = authenticationProvider;
		this.unauthorizedEntryPoint = unauthorizedEntryPoint;
		this.accessDeniedHandler = accessDeniedHandler;
	}
    
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
	        .csrf(csrf -> csrf.disable())
	     // No session will be created or used by Spring Security
	        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
		 // Apply JWT filter
	        .authenticationProvider(authenticationProvider)
	        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
	     // Authorization rules
	        .authorizeHttpRequests(request -> request
	        		.requestMatchers(SecurityWhitelist.ENDPOINTS).permitAll()
	        		.requestMatchers("/api/admin/**").hasRole("ADMIN")
	        		.requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
	        		.anyRequest().authenticated()
	        )
	        
	     // Exception handling
	        .exceptionHandling(exception -> exception
	        	    .authenticationEntryPoint(unauthorizedEntryPoint)
	        	    .accessDeniedHandler(accessDeniedHandler));
	        
	    return http.build();
	}
	
	@Bean
	public FilterRegistrationBean<CorsFilter> corsFilter() {
	    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
	    CorsConfiguration config = new CorsConfiguration();
	    config.setAllowCredentials(true);
	    config.addAllowedOriginPattern("http://127.0.0.1:5501");
	    config.addAllowedOriginPattern("http://localhost:4200");  // 一般for Angular/React，待改
	    config.addAllowedHeader(CorsConfiguration.ALL);
	    config.addAllowedMethod(CorsConfiguration.ALL);
	    config.setMaxAge(MAX_AGE);
	    source.registerCorsConfiguration("/**", config);
	    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));

	    // should be set order to -100 because we need to CorsFilter before SpringSecurityFilter
	    bean.setOrder(CORS_FILTER_ORDER);
	    return bean;
	}
	
	
}
