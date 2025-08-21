package com.example.erp.security.handler;

public class TokenException extends RuntimeException {
	
	private final int status;
	
	public TokenException(String message, int status) {
        super(message);
        this.status = status;
    }
	public int getStatus() {
        return status;
    }

    public static TokenException invalid(String token) {
        return new TokenException("Invalid token: " + token, 401);
    }

    public static TokenException expired(String token) {
        return new TokenException("Expired token: " + token, 401);
    }

    public static TokenException forbidden(String token) {
        return new TokenException("Forbidden token: " + token, 403);
    }
	
}
