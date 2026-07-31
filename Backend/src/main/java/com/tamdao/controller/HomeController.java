package com.tamdao.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping
    public ResponseEntity<String> homeControllerHandler() {
        return ResponseEntity.ok("Welcome to DMart POS System");
    }
}
