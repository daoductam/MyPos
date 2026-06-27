package com.tamdao.exception;


import com.tamdao.payload.response.ExceptionResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {


	@ExceptionHandler(UserException.class)
	public ResponseEntity<ExceptionResponse> UserExceptionHandler(
			UserException ex, WebRequest req) {
		ExceptionResponse response = new ExceptionResponse(
				ex.getMessage(),
				req.getDescription(false), LocalDateTime.now());
		return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ExceptionResponse> AuthenticationExceptionHandler(
			AuthenticationException ex, WebRequest req) {
		ExceptionResponse response = new ExceptionResponse(
				ex.getMessage(),
				req.getDescription(false),
				LocalDateTime.now()
		);
		return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ExceptionResponse> BadCredentialsExceptionHandler(
			BadCredentialsException ex, WebRequest req) {
		ExceptionResponse response = new ExceptionResponse(
				ex.getMessage(),
				req.getDescription(false),
				LocalDateTime.now()
		);
		return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ExceptionResponse> ResourceNotFoundExceptionHandler(
			ResourceNotFoundException ex, WebRequest req) {
		ExceptionResponse response = new ExceptionResponse(
				ex.getMessage(),
				req.getDescription(false),
				LocalDateTime.now()
		);
		return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
	}



	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ExceptionResponse> handleDataIntegrityViolationException(
			DataIntegrityViolationException ex, WebRequest req) {
		
		String errorMessage = "Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc hệ thống.";
		String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
		
		if (rootMsg != null) {
			if (rootMsg.contains("products.sku") || rootMsg.contains("products.UK") || rootMsg.contains("UKfhmd06dsmj6k0n90swsh8ie9g")) {
				errorMessage = "Mã sản phẩm (SKU) đã tồn tại trong hệ thống. Vui lòng sử dụng mã SKU khác.";
			} else if (rootMsg.contains("users.email") || rootMsg.contains("users.UK")) {
				errorMessage = "Địa chỉ email này đã được sử dụng bởi một tài khoản khác.";
			}
		}

		ExceptionResponse response = new ExceptionResponse(
				errorMessage,
				req.getDescription(false),
				LocalDateTime.now()
		);
		return new ResponseEntity<>(response, HttpStatus.CONFLICT);
	}




	@ExceptionHandler(Exception.class)
	public ResponseEntity<ExceptionResponse> ExceptionHandler(Exception ex,
															  WebRequest req) {
		// Log the actual exception internally (in a real project)
		// For security, return a generic message to the client for unknown exceptions
		ExceptionResponse response = new ExceptionResponse(
				"An unexpected error occurred. Please try again later.",
				req.getDescription(false),
				LocalDateTime.now()
		);

		return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
