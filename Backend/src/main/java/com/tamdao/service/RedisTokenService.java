package com.tamdao.service;

public interface RedisTokenService {
    void saveRefreshToken(Long userId, String tokenId, String refreshToken, long durationMs);
    boolean isValidRefreshToken(Long userId, String tokenId, String refreshToken);
    void deleteRefreshToken(Long userId, String tokenId);
    void revokeAllUserTokens(Long userId);
    void blacklistAccessToken(String accessToken, long remainingTtlMs);
    boolean isBlacklisted(String accessToken);
}
