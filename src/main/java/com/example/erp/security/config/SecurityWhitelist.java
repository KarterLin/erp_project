package com.example.erp.security.config;
 
public class SecurityWhitelist {
    public static final String[] ENDPOINTS = {
            "/api/register/**",
            "/api/v1/auth/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/configuration/security",
            "/swagger-ui/**",
            "/webjars/**",
            "/error",
            "/favicon.ico",
 
        };
}
 
 