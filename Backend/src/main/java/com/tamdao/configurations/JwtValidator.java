package com.tamdao.configurations;

import com.tamdao.authorization.AuthorizationSnapshot;
import com.tamdao.service.AuthorizationService;
import com.tamdao.service.RedisTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtValidator extends OncePerRequestFilter {

	private static final Set<String> PUBLIC_AUTH_PATHS = Set.of(
			"/api/v1/auth/login", "/api/v1/auth/signup", "/api/v1/auth/refresh",
			"/api/v1/auth/forgot-password", "/api/v1/auth/reset-password");

	@Value("${app.jwt.secret}")
	private String secretKey;
	private SecretKey key;

	private final RedisTokenService redisTokenService;
	private final AuthorizationService authorizationService;
	private final CustomAuthenticationEntryPoint authenticationEntryPoint;

	@PostConstruct
	public void init() {
		this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return "OPTIONS".equals(request.getMethod())
				|| PUBLIC_AUTH_PATHS.contains(request.getServletPath());
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
									HttpServletResponse response,
									FilterChain filterChain)
			throws ServletException, IOException {
		String authHeader = request.getHeader(JwtConstant.JWT_HEADER);

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String jwt = authHeader.substring(7);
			try {
				if (redisTokenService.isBlacklisted(jwt)) {
					SecurityContextHolder.clearContext();
					throw new BadCredentialsException("Token has been revoked or logged out");
				}

				Claims claims = Jwts.parser()
						.verifyWith(key)
						.build()
						.parseSignedClaims(jwt)
						.getPayload();

				String email = String.valueOf(claims.get("email"));
				if (email == null || "null".equalsIgnoreCase(email)) {
					throw new BadCredentialsException("JWT subject is missing");
				}

				AuthorizationSnapshot snapshot = authorizationService.getSnapshotByEmail(email);
				Object tokenVersion = claims.get("authz_version");
				if (tokenVersion != null && Long.parseLong(String.valueOf(tokenVersion)) != snapshot.authorizationVersion()) {
					throw new BadCredentialsException("Authorization version is stale");
				}

				UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
						email, null, authorizationService.getAuthorities(snapshot));
				authentication.setDetails(snapshot);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (JwtException | IllegalArgumentException | AuthenticationException e) {
				SecurityContextHolder.clearContext();
				authenticationEntryPoint.commence(request, response,
						new BadCredentialsException("Invalid or expired JWT token", e));
				return;
			}
		}
		filterChain.doFilter(request, response);
	}

}
