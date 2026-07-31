package com.tamdao.service.impl;

import com.tamdao.configurations.JwtProvider;
import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.UserMapper;
import com.tamdao.modal.PasswordResetToken;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.response.AuthResponse;
import com.tamdao.payload.response.TokenRefreshResponse;
import com.tamdao.repository.PasswordResetTokenRepository;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.AuthService;
import com.tamdao.service.EmailService;
import com.tamdao.service.RedisTokenService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserImplementation customUserImplementation;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final RedisTokenService redisTokenService;

    @Value("${app.frontend.reset-url}")
    private String frontendResetUrl;

    @Override
    public AuthResponse signup(UserDTO req) {
        User user = userRepository.findByEmail(req.getEmail());
        if (user != null) {
            throw new BusinessException(ErrorCode.USER_EXISTED, "Email id already registered ");
        }

        if (req.getRole().equals(UserRole.ROLE_ADMIN)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Role admin is not allowed");
        }

        User createdUser = new User();
        createdUser.setEmail(req.getEmail());
        createdUser.setPassword(passwordEncoder.encode(req.getPassword()));
        createdUser.setCreatedAt(LocalDateTime.now());
        createdUser.setPhone(req.getPhone());
        createdUser.setFullName(req.getFullName());
        createdUser.setLastLogin(LocalDateTime.now());
        createdUser.setRole(req.getRole());

        User savedUser = userRepository.save(createdUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtProvider.generateToken(authentication);

        String refreshToken = generateAndSaveRefreshToken(savedUser.getId());

        AuthResponse response = new AuthResponse();
        response.setTitle("Welcome " + createdUser.getEmail());
        response.setMessage("Register success");
        response.setUser(UserMapper.toDTO(savedUser));
        response.setJwt(jwt);
        response.setRefreshToken(refreshToken);
        return response;
    }

    @Override
    public AuthResponse login(String username, String password) {
        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtProvider.generateToken(authentication);

        User user = userRepository.findByEmail(username);
        if (user == null && username != null) {
            user = userRepository.findByEmail(username.trim().toLowerCase());
        }

        // Check store status
        if (user != null && user.getRole() != UserRole.ROLE_ADMIN && user.getRole() != UserRole.ROLE_STORE_ADMIN) {
            com.tamdao.modal.Store userStore = user.getStore();
            if (userStore == null && user.getBranch() != null) {
                userStore = user.getBranch().getStore();
            }

            if (userStore != null && userStore.getStatus() != com.tamdao.domain.StoreStatus.ACTIVE) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "Tài khoản của bạn tạm thời bị khóa do cửa hàng đang ở trạng thái: " + userStore.getStatus());
            }
        }

        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }

        String refreshToken = null;
        if (user != null) {
            refreshToken = generateAndSaveRefreshToken(user.getId());
        }

        AuthResponse response = new AuthResponse();
        response.setTitle("Login success");
        response.setMessage("Welcome Back" + username);
        response.setJwt(token);
        response.setRefreshToken(refreshToken);
        response.setUser(UserMapper.toDTO(user));

        return response;
    }

    @Override
    public TokenRefreshResponse refreshToken(String refreshTokenStr) {
        if (refreshTokenStr == null || refreshTokenStr.isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Refresh token không được để trống");
        }

        String[] parts = refreshTokenStr.split(":");
        if (parts.length < 3) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Refresh token không đúng định dạng");
        }

        Long userId;
        try {
            userId = Long.parseLong(parts[0]);
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Refresh token không đúng định dạng");
        }

        String tokenId = parts[1];

        // Validate token in Redis
        boolean isValid = redisTokenService.isValidRefreshToken(userId, tokenId, refreshTokenStr);

        if (!isValid) {
            // Theft detection (Reuse Attack): Token cũ không còn trong Redis -> Hủy toàn bộ token của user
            log.warn("Refresh Token reuse detected for userId: {}. Revoking all tokens!", userId);
            redisTokenService.revokeAllUserTokens(userId);
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Refresh token đã hết hạn hoặc đã được sử dụng trước đó");
        }

        // Xóa Refresh Token cũ (Rotation)
        redisTokenService.deleteRefreshToken(userId, tokenId);

        // Lấy thông tin user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User không tồn tại"));

        // Tạo Authentication cho user
        Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );

        String newAccessToken = jwtProvider.generateToken(auth);
        String newRefreshToken = generateAndSaveRefreshToken(user.getId());

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public void logout(String accessTokenHeader, String refreshTokenStr) {
        // Blacklist Access Token
        if (accessTokenHeader != null && accessTokenHeader.startsWith("Bearer ")) {
            String accessToken = accessTokenHeader.substring(7);
            long remainingTtl = jwtProvider.getRemainingExpirationMs(accessToken);
            if (remainingTtl > 0) {
                redisTokenService.blacklistAccessToken(accessToken, remainingTtl);
            }
        }

        // Revoke Refresh Token
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            String[] parts = refreshTokenStr.split(":");
            if (parts.length >= 2) {
                try {
                    Long userId = Long.parseLong(parts[0]);
                    String tokenId = parts[1];
                    redisTokenService.deleteRefreshToken(userId, tokenId);
                } catch (Exception ignored) {
                }
            }
        }
    }

    private String generateAndSaveRefreshToken(Long userId) {
        String tokenId = UUID.randomUUID().toString();
        String secret = UUID.randomUUID().toString();
        String refreshTokenStr = userId + ":" + tokenId + ":" + secret;

        redisTokenService.saveRefreshToken(userId, tokenId, refreshTokenStr, JwtProvider.REFRESH_TOKEN_EXPIRATION);
        return refreshTokenStr;
    }

    public Authentication authenticate(String email, String password) {
        try {
            UserDetails userDetails = customUserImplementation.loadUserByUsername(email);
            if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
                throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
            }
            return new UsernamePasswordAuthenticationToken(email, null, userDetails.getAuthorities());
        } catch (Exception e) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }
    }

    @Transactional
    public void createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND, "user not found with given email");
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendResetUrl + token;
        String subject = "Password Reset Request";
        String body = "You requested to reset your password. Use this link (valid 5 minutes): " + resetLink;

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            throw new BadCredentialsException("Invalid or expired token");
        }

        PasswordResetToken resetToken = optionalToken.get();

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadCredentialsException("Invalid or expired token");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }
}
