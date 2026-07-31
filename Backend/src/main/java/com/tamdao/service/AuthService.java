package com.tamdao.service;

import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.response.AuthResponse;
import com.tamdao.payload.response.TokenRefreshResponse;

public interface AuthService {
    AuthResponse login(String username, String password);
    AuthResponse signup(UserDTO req);

    TokenRefreshResponse refreshToken(String refreshTokenStr);
    void logout(String accessTokenHeader, String refreshTokenStr);

    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
}
