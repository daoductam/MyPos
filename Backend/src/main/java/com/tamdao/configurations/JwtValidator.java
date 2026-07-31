package com.tamdao.configurations;

import com.tamdao.service.RedisTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtValidator extends OncePerRequestFilter {

	@Value("${app.jwt.secret}")
	private String secretKey;
	private SecretKey key;

	private final RedisTokenService redisTokenService;

	@PostConstruct
	public void init() {
		this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
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
				String authorities = String.valueOf(claims.get("authorities"));

				List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);
				Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);
				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (Exception e) {
				SecurityContextHolder.clearContext();
				throw new BadCredentialsException("Invalid or expired JWT token", e);
			}
		}
		filterChain.doFilter(request, response);
	}

}
