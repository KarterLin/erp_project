package com.example.erp.security.service;

import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.erp.security.CustomUserDetails;

import jakarta.servlet.http.HttpServletRequest;

public interface JwtService {
	String extractUserName(String token);
    String generateToken(CustomUserDetails userDetails);
    boolean isTokenValid(String token, UserDetails userDetails);
    ResponseCookie generateJwtCookie(String jwt);
    String getJwtFromCookies(HttpServletRequest request);
    ResponseCookie getCleanJwtCookie();
}
