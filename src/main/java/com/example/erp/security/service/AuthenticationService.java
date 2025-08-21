package com.example.erp.security.service;

import com.example.erp.payload.request.AuthenticationRequest;
import com.example.erp.payload.response.AuthenticationResponse;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
}
