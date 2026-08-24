package br.com.academia.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordTest {

    @Test
    void testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String validHash = "$2a$10$XfAh1Ayi.LfG0nVRgux5veFuHvd17T2Z0JmBipw4F9aZtK.H2gXby";
        System.out.println("CORRESPONDE AO HASH VÁLIDO: " + encoder.matches(rawPassword, validHash));
        assertTrue(encoder.matches(rawPassword, validHash));
    }
}
