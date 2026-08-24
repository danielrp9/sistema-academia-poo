package br.com.academia.web.controller;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.service.AutenticacaoService;
import br.com.academia.web.dto.LoginRequestDTO;
import br.com.academia.web.dto.LoginResponseDTO;
import br.com.academia.web.dto.RegistroUsuarioRequestDTO;
import br.com.academia.web.dto.UsuarioResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de login, cadastro de novos usuários e perfil")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    @Operation(summary = "Realizar login no sistema", description = "Autentica o usuário via e-mail e senha, retornando um Bearer Token JWT.")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        LoginResponseDTO response = autenticacaoService.autenticar(dto, authenticationManager);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/registro")
    @Operation(summary = "Cadastrar novo usuário", description = "Registra um novo cliente, colaborador ou administrador no sistema.")
    public ResponseEntity<UsuarioResponseDTO> registrar(@RequestBody @Valid RegistroUsuarioRequestDTO dto) {
        UsuarioResponseDTO response = autenticacaoService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obter dados do usuário autenticado", description = "Retorna os dados do usuário a partir do token JWT enviado no cabeçalho.")
    public ResponseEntity<UsuarioResponseDTO> me(@AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuarioLogado));
    }
}
