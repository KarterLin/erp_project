package com.example.erp.payload.response;

import java.time.Instant;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
	private int status;
	private String message;
	private Instant timestamp;
	private T data; // 可選的回傳資料

	// 成功（帶資料）
	public static <T> ApiResponse<T> success(String message, T data) {
		return ApiResponse.<T>builder().status(HttpStatus.OK.value()).message(message).timestamp(Instant.now())
				.data(data).build();
	}

	// 成功（純訊息）
	public static <T> ApiResponse<T> success(String message) {
		return ApiResponse.<T>builder().status(HttpStatus.OK.value()).message(message).timestamp(Instant.now()).build();
	}

	// 失敗
	public static <T> ApiResponse<T> error(String message) {
		return ApiResponse.<T>builder().status(HttpStatus.BAD_REQUEST.value()).message(message).timestamp(Instant.now())
				.build();
	}
}
