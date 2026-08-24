package br.com.academia.web.controller;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.repository.UsuarioRepository;
import br.com.academia.web.dto.UsuarioResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
@Tag(name = "Usuários", description = "Listagem, busca e gestão de status de clientes e colaboradores")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping
    @Operation(summary = "Listar usuários paginados", description = "Retorna lista de clientes e colaboradores com filtro opcional por nome.")
    public ResponseEntity<Page<UsuarioResponseDTO>> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<Usuario> pagina;
        if (nome != null && !nome.isBlank()) {
            pagina = usuarioRepository.findByNomeContainingIgnoreCase(nome, pageable);
        } else {
            pagina = usuarioRepository.findAll(pageable);
        }

        return ResponseEntity.ok(pagina.map(UsuarioResponseDTO::fromEntity));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna os detalhes de um usuário específico.")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(UsuarioResponseDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar ou Inativar usuário", description = "Altera o status de acesso do usuário no sistema e na catraca.")
    public ResponseEntity<Void> alternarStatus(
            @PathVariable Long id,
            @RequestParam boolean ativo) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário", id));

        if (ativo) {
            usuario.ativar();
        } else {
            usuario.desativar();
        }
        usuarioRepository.save(usuario);

        return ResponseEntity.noContent().build();
    }
}
