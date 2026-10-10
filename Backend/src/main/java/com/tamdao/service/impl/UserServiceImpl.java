package com.tamdao.service.impl;

import com.tamdao.configurations.JwtProvider;
import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.modal.User;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.PasswordResetTokenRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.repository.UserRepository;
import com.tamdao.repository.authorization.AuthorizationAssignmentRepository;
import com.tamdao.payload.request.ChangePasswordRequest;
import com.tamdao.payload.request.UpdateProfileRequest;
import com.tamdao.service.AuthorizationService;
import com.tamdao.service.RedisTokenService;
import com.tamdao.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final StoreRepository storeRepository;
	private final BranchRepository branchRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final AuthorizationAssignmentRepository authorizationAssignmentRepository;
	private final AuthorizationService authorizationService;
	private final RedisTokenService redisTokenService;

	@Override
	public User getUserByEmail(String email) {
		User user = userRepository.findByEmail(email);
		if (user == null) {
			throw new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found with email: " + email);
		}
		return user;
	}

	@Override
	public User getUserFromJwtToken(String jwt) {
		String email = jwtProvider.getEmailFromJwtToken(jwt);
		User user = userRepository.findByEmail(email);
		if (user == null) {
			throw new BusinessException(ErrorCode.USER_NOT_FOUND, "user not exist with email " + email);
		}
		return user;
	}

	@Override
	public User getUserById(Long id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found with id: " + id));
	}

	@Override
	public Set<User> getUserByRole(UserRole role) {
		return userRepository.findByRole(role);
	}

	@Override
	public User getCurrentUser() {
		String email = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepository.findByEmail(email);
		if (user == null) {
			throw new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found");
		}
		return user;
	}

	@Override
	@Transactional
	public User updateCurrentUser(UpdateProfileRequest request) {
		User user = getCurrentUser();
		user.setFullName(request.fullName().trim());
		user.setPhone(request.phone() == null || request.phone().isBlank()
				? null : request.phone().trim());
		return userRepository.save(user);
	}

	@Override
	@Transactional
	public void changeCurrentPassword(ChangePasswordRequest request) {
		User user = getCurrentUser();
		if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
			throw new BusinessException(ErrorCode.INVALID_REQUEST, "Current password is incorrect");
		}
		if (request.currentPassword().equals(request.newPassword())) {
			throw new BusinessException(ErrorCode.INVALID_REQUEST, "New password must be different from the current password");
		}

		user.setPassword(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
		authorizationAssignmentRepository.incrementAuthorizationVersion(user.getId());
		authorizationService.invalidate(user.getId());
		redisTokenService.revokeAllUserTokens(user.getId());
	}

	@Override
	public List<User> getUsers() {
		return userRepository.findAll();
	}
}
