package com.tamdao.configurations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Service
public class JwtProvider {
	@Value("${app.jwt.secret}")
	private String secretKey;

	@Value("${app.jwt.access-token-expiration-ms:900000}")
	private long accessTokenExpirationMs;

	@Value("${app.jwt.refresh-token-expiration-ms:604800000}")
	private long refreshTokenExpirationMs;

	private SecretKey key;

	public long getRefreshTokenExpirationMs() {
		return refreshTokenExpirationMs;
	}

	public long getAccessTokenExpirationMs() {
		return accessTokenExpirationMs;
	}

	@PostConstruct
	public void init() {
		this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
	}

	public String generateToken(Authentication auth){
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		String roles = populateAuthorities(authorities);

		return Jwts.builder().issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
				.claim("email", auth.getName())
				.claim("authorities", roles)
				.signWith(key)
				.compact();
	}

	public String getEmailFromJwtToken(String jwt){
		if (jwt != null && jwt.startsWith("Bearer ")) {
			jwt = jwt.substring(7);
		}
		Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(jwt).getPayload();
		return String.valueOf(claims.get("email"));
	}

	public long getRemainingExpirationMs(String jwt) {
		if (jwt != null && jwt.startsWith("Bearer ")) {
			jwt = jwt.substring(7);
		}
		try {
			Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(jwt).getPayload();
			Date expiration = claims.getExpiration();
			long remaining = expiration.getTime() - System.currentTimeMillis();
			return Math.max(remaining, 0L);
		} catch (Exception e) {
			return 0L;
		}
	}

	private String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
		Set<String> auths = new HashSet<>();

		for(GrantedAuthority authority : authorities){
			auths.add(authority.getAuthority());
		}
		return String.join(",", auths);
	}
}
