package com.tamdao.controller;

import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.request.ForgotPasswordRequest;
import com.tamdao.payload.request.LoginDto;
import com.tamdao.payload.request.LogoutRequest;
import com.tamdao.payload.request.RefreshTokenRequest;
import com.tamdao.payload.request.ResetPasswordRequest;
import com.tamdao.payload.response.ApiResponse;
import com.tamdao.payload.response.AuthResponse;
import com.tamdao.payload.response.TokenRefreshResponse;
import com.tamdao.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signupHandler(
            @RequestBody @Valid UserDTO req) {
        AuthResponse response = authService.signup(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginHandler(
            @RequestBody LoginDto req) {
        AuthResponse response = authService.login(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @RequestBody @Valid RefreshTokenRequest request) {
        TokenRefreshResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody(required = false) LogoutRequest request) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        authService.logout(authHeader, refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {
        authService.createPasswordResetToken(request.getEmail());
        return ResponseEntity.ok("A Reset link was sent to your email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok("Password reset successful");
    }
}
