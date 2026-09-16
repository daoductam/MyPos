package com.tamdao.service.impl;

import com.tamdao.modal.User;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserImplementation implements UserDetailsService {

	private final UserRepository userRepository;
	private final AuthorizationService authorizationService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null) {
            throw new UsernameNotFoundException("Username/email cannot be null");
        }

        String cleanedEmail = username.trim().toLowerCase();
        User user = userRepository.findByEmail(cleanedEmail);

        if (user == null) {
            user = userRepository.findByEmail(username);
        }

        if (user == null) {
            throw new UsernameNotFoundException("user doesn't exist with email " + username);
        }

		Collection<? extends GrantedAuthority> authorities = authorizationService
				.getAuthorities(authorizationService.getSnapshotByEmail(user.getEmail()));

		return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), authorities);
    }

}
