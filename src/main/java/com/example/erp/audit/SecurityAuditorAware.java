package com.example.erp.audit;

import java.util.Optional;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.example.erp.entity.UserInfo;
import com.example.erp.repository.UserInfoRepository;
import com.example.erp.security.CustomUserDetails;

@Component
public class SecurityAuditorAware implements AuditorAware<Long> {

    private final UserInfoRepository userInfoRepository;

    SecurityAuditorAware(UserInfoRepository userInfoRepository) {
        this.userInfoRepository = userInfoRepository;
    }
  @Override
  public Optional<Long> getCurrentAuditor() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) return Optional.empty();

    Object principal = auth.getPrincipal();
    if (principal instanceof CustomUserDetails cud) {
        String email = cud.getUsername(); // 假設 username 存 email
        return userInfoRepository.findByUEmail(email)
                .map(UserInfo::getId)
                .map(Long::valueOf);
    }

    return Optional.empty();
  }
}
