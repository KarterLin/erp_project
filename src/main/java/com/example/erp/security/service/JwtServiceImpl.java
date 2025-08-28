package com.example.erp.security.service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import com.example.erp.security.CustomUserDetails;

@Service
public class JwtServiceImpl implements JwtService{
	@Value("${application.security.jwt.secret-key}")
    private String secretKey;
	@Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;
    @Value("${application.security.jwt.cookie-name}")
    private String jwtCookieName;

    @Override
    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
 // 產生 JWT (帶 authorities)
    @Override
    public String generateToken(CustomUserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        List<String> authorities = userDetails.getAuthorities()
                .stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList());

        extraClaims.put("authorities", authorities);
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }
    
 // 驗證 token 是否有效
    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUserName(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    
 // 建立 JWT Cookie
    @Override
    public ResponseCookie generateJwtCookie(String jwt) {
        return ResponseCookie.from(jwtCookieName, jwt)
                .path("/")
                .maxAge(24 * 60 * 60) // 24 hours
                .httpOnly(true)
                .secure(true)
                .sameSite("None")  		// 前後端跨來源必須None
                .build();
    }
    
 // 從 Cookie 取出 JWT
    @Override
    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookieName);
        if (cookie != null) {
            return cookie.getValue();
        } else {
            return null;
        }
    }
    
 // 清除 JWT Cookie
    @Override
    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookieName, "")
                .path("/")
                .httpOnly(true)
                .maxAge(0)
                .build();
    }
    
 // ===== private methods =====
    // 建立token
    private String buildToken(Map<String, Object> extraClaims, CustomUserDetails userDetails, long expiration) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    // 判斷是否過期
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    // 抽取到期時間
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    // 抽取指定Claims欄位
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token);
        return claimsResolvers.apply(claims);
    }
    // 解開JWT，丟例外 (JwtException)或回傳一個 Claims 物件，裡面包含所有 payload 資訊
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    //把 SecretKey 轉換成 JWT 簽章可以用的金鑰 (Key 物件)
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    
}
    
    

