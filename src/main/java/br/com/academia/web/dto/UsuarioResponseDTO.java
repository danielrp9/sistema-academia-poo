package br.com.academia.web.dto;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.Role;

import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        String cpfMascarado,
        String telefone,
        String endereco,
        Role role,
        Boolean ativo,
        LocalDateTime dataCadastro
) {
    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCpfMascarado(),
                usuario.getTelefone(),
                usuario.getEndereco(),
                usuario.getRole(),
                usuario.getAtivo(),
                usuario.getDataCadastro()
        );
    }
}
