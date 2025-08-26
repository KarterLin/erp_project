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

			//  karter 開發用，請視情況移除 (請正式版後刪除)
	        "/api/**", // 開發用，請視情況移除
	        // 靜態資源與 HTML 頁面白名單
	        "/js/**",
	        "/css/**",
	        "/images/**",
	        "/static/**",
	        "/*.html",
	        "/journalEntries.html",
	        "/fixedAssets.html"
	    };
}
