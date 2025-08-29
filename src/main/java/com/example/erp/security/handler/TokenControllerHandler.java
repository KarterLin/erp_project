package com.example.erp.security.handler;

import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.example.erp.security.enums.Role;



@RestControllerAdvice
public class TokenControllerHandler {
	
	// 全域處理自定義 TokenException，可根據不同狀態碼（401 / 403）回傳前端
	@ExceptionHandler(TokenException.class)
	public ResponseEntity<ErrorResponse> handleTokenException(TokenException ex, WebRequest request) {
        // 建立自訂錯誤回應物件
        final ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())             	  // 發生時間
                .error("Token Error")                  		 // 錯誤類型
                .status(ex.getStatus())                		 // 從 TokenException 取得對應 HTTP 狀態碼
                .message(ex.getMessage())             // 詳細訊息
                .path(request.getDescription(false))    // API 路徑
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(ex.getStatus()));
    }
	// 處理 @Valid 驗證失敗的情況，將欄位錯誤轉成 Map 回傳
	@ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
	
	// 處理 JSON 解析錯誤，例如前端送的 roles 不合法
	@ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleException(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>("Cannot parse JSON :: accepted roles " + Arrays.toString(Role.values()), HttpStatus.BAD_REQUEST);
    }
	
}
