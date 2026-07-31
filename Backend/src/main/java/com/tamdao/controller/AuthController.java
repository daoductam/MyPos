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
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
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
            @RequestBody @Valid UserDTO req,
            HttpServletResponse httpServletResponse) {
        AuthResponse response = authService.signup(req);
        setRefreshTokenCookie(httpServletResponse, response.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginHandler(
            @RequestBody LoginDto req,
            HttpServletResponse httpServletResponse) {
        AuthResponse response = authService.login(req.getEmail(), req.getPassword());
        setRefreshTokenCookie(httpServletResponse, response.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletResponse httpServletResponse) {
        String tokenToUse = cookieRefreshToken != null ? cookieRefreshToken : (request != null ? request.getRefreshToken() : null);
        TokenRefreshResponse response = authService.refreshToken(tokenToUse);
        setRefreshTokenCookie(httpServletResponse, response.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) LogoutRequest request,
            HttpServletResponse httpServletResponse) {
        String refreshToken = cookieRefreshToken != null ? cookieRefreshToken : (request != null ? request.getRefreshToken() : null);
        authService.logout(authHeader, refreshToken);
        clearRefreshTokenCookie(httpServletResponse);
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

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null) return;
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
