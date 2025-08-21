package com.example.erp.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.erp.entity.UserInfo;


public class CustomUserDetails implements UserDetails {
	private final UserInfo user;

    public CustomUserDetails(UserInfo user) {
        this.user = user;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRole().getAuthorities(); // 從 enum Role 取出
    }
    
    @Override
    public String getPassword() {
        return user.getuPassword();
    }
    
    @Override
    public String getUsername() {
        return user.getuEmail();
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
