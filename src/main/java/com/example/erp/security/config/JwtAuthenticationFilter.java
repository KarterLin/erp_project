package com.example.erp.security.config;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import io.micrometer.common.util.StringUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.example.erp.security.CustomUserDetailsService;
import com.example.erp.security.service.JwtService;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;
	
	private final AntPathMatcher pathMatcher = new AntPathMatcher();
	
	
	@Override
    protected void doFilterInternal(
           @NonNull HttpServletRequest request,
           @NonNull HttpServletResponse response,
           @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
		// 嘗試從 Cookie 或 Authorization Header 取得 JWT
        String jwt = jwtService.getJwtFromCookies(request);
        final String authHeader = request.getHeader("Authorization");
        // 白名單判斷
        String path = request.getServletPath();
        // System.out.println(">>> requestURI = " + path);
        
       for (String pattern : SecurityWhitelist.ENDPOINTS) {
            if (pathMatcher.match(pattern, path)) {
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        // 沒有 JWT或請求是 "/auth"，直接放行，不做驗證
        if((jwt == null && (authHeader ==  null || !authHeader.startsWith("Bearer "))) 
        		){
            filterChain.doFilter(request, response);
            return;
        }
        // 從Authorization Header取Jwt
        if (jwt == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7); 
        }
        // 從 JWT 中解析使用者 email
       final String userEmail = jwtService.extractUserName(jwt);
        
       if(StringUtils.isNotEmpty(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null){

           // 取得UserDetails
           UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

           // 驗證 JWT 是否有效
           if(jwtService.isTokenValid(jwt, userDetails)){

               // 建立 Spring Security 認證物件
               SecurityContext context = SecurityContextHolder.createEmptyContext();
               UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                       userDetails,   // principal
                       null,                // credentials（JWT 已驗證，不需要密碼）
                       userDetails.getAuthorities() // 使用者角色/權限
               );

               // 將 request 的資訊加到 authToken
               authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

               // 將認證資訊放到 SecurityContext，Spring Security 之後就會認可這個使用者
               context.setAuthentication(authToken);
               SecurityContextHolder.setContext(context);
           }
       }
       // 繼續請求鏈（一定要放最後，否則請求會被攔截）
       filterChain.doFilter(request,response);
   }
	
}
