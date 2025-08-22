package com.example.erp.security.service;

import java.util.Optional;

import org.springframework.http.ResponseCookie;

import com.example.erp.entity.RefreshToken;
import com.example.erp.payload.request.RefreshTokenRequest;
import com.example.erp.payload.response.RefreshTokenResponse;

import jakarta.servlet.http.HttpServletRequest;

public interface RefreshTokenService {
	RefreshToken createRefreshToken(Long userId);
    RefreshToken verifyExpiration(RefreshToken token);
    Optional<RefreshToken> findByToken(String token);
    RefreshTokenResponse generateNewToken(RefreshTokenRequest request);
    ResponseCookie generateRefreshTokenCookie(String token);
    String getRefreshTokenFromCookies(HttpServletRequest request);
    void deleteByToken(String token);
    ResponseCookie getCleanRefreshTokenCookie();
}
