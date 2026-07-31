package com.tamdao.exception;

import com.tamdao.payload.response.ApiResponse;
import com.tamdao.payload.response.FieldErrorDetail;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<Void> response = ApiResponse.error(errorCode.getCode(), ex.getMessage());
        return new ResponseEntity<>(response, errorCode.getHttpStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpringSecurityAccessDeniedException(AccessDeniedException ex) {
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.UNAUTHORIZED.getCode(), "Bạn không có quyền truy cập tài nguyên này");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.UNAUTHENTICATED.getCode(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.UNAUTHENTICATED.getCode(), "Tên đăng nhập hoặc mật khẩu không chính xác");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        List<FieldErrorDetail> fieldErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(new FieldErrorDetail(fieldError.getField(), fieldError.getDefaultMessage()));
        }

        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.INVALID_REQUEST.getCode(),
                "Dữ liệu đầu vào không hợp lệ",
                fieldErrors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String errorMessage = "Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc hệ thống.";
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();

        if (rootMsg != null) {
            if (rootMsg.contains("products.sku") || rootMsg.contains("products.UK") || rootMsg.contains("UKfhmd06dsmj6k0n90swsh8ie9g")) {
                errorMessage = "Mã sản phẩm (SKU) đã tồn tại trong hệ thống. Vui lòng sử dụng mã SKU khác.";
            } else if (rootMsg.contains("users.email") || rootMsg.contains("users.UK")) {
                errorMessage = "Địa chỉ email này đã được sử dụng bởi một tài khoản khác.";
            }
        }

        ApiResponse<Void> response = ApiResponse.error(ErrorCode.DATA_INTEGRITY_VIOLATION.getCode(), errorMessage);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex, WebRequest req) {
        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.UNCATEGORIZED_EXCEPTION.getCode(),
                "An unexpected error occurred. Please try again later."
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
