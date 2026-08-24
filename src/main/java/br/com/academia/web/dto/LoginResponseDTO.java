package br.com.academia.web.dto;

import br.com.academia.domain.enums.Role;

public record LoginResponseDTO(
        String token,
        String tipo,
        Long usuarioId,
        String nome,
        String email,
        Role role
) {
    public LoginResponseDTO(String token, Long usuarioId, String nome, String email, Role role) {
        this(token, "Bearer", usuarioId, nome, email, role);
    }
}
