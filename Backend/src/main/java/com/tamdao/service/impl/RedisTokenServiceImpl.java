package com.tamdao.service.impl;

import com.tamdao.service.RedisTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisTokenServiceImpl implements RedisTokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "rt:";
    private static final String BLACKLIST_PREFIX = "bl:";

    @Override
    public void saveRefreshToken(Long userId, String tokenId, String refreshToken, long durationMs) {
        String key = REFRESH_TOKEN_PREFIX + userId + ":" + tokenId;
        redisTemplate.opsForValue().set(key, refreshToken, durationMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean isValidRefreshToken(Long userId, String tokenId, String refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + userId + ":" + tokenId;
        String storedToken = redisTemplate.opsForValue().get(key);
        return storedToken != null && storedToken.equals(refreshToken);
    }

    @Override
    public void deleteRefreshToken(Long userId, String tokenId) {
        String key = REFRESH_TOKEN_PREFIX + userId + ":" + tokenId;
        redisTemplate.delete(key);
    }

    @Override
    public void revokeAllUserTokens(Long userId) {
        String pattern = REFRESH_TOKEN_PREFIX + userId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.warn("Revoked all refresh tokens for userId: {}", userId);
        }
    }

    @Override
    public void blacklistAccessToken(String accessToken, long remainingTtlMs) {
        if (remainingTtlMs <= 0) return;
        String key = BLACKLIST_PREFIX + accessToken;
        redisTemplate.opsForValue().set(key, "logout", remainingTtlMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public boolean isBlacklisted(String accessToken) {
        String key = BLACKLIST_PREFIX + accessToken;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }
}
