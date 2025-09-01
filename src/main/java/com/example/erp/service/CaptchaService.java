package com.example.erp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.example.erp.payload.response.TurnstileResponse;


@Service
public class CaptchaService {
	@Value("${turnstile.secret}")
	private String secret;

	private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

	public boolean verify(String token, String remoteIp) {
		RestTemplate rt = new RestTemplate();

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
		form.add("secret", secret);
		form.add("response", token);
		if (remoteIp != null)
			form.add("remoteip", remoteIp);

		HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);
		try {
			TurnstileResponse resp = rt.postForObject(VERIFY_URL, req, TurnstileResponse.class);
			return resp != null && resp.isSuccess();
			
		} catch (Exception e) {
			return false; // 視為驗證失敗
		}
	}
}
