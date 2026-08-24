package br.com.academia.service;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.exception.RegraDeNegocioException;
import br.com.academia.domain.repository.UsuarioRepository;
import br.com.academia.infra.security.TokenService;
import br.com.academia.web.dto.LoginRequestDTO;
import br.com.academia.web.dto.LoginResponseDTO;
import br.com.academia.web.dto.RegistroUsuarioRequestDTO;
import br.com.academia.web.dto.UsuarioResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AutenticacaoService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + username));
    }

    @Transactional
    public UsuarioResponseDTO registrar(RegistroUsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new RegraDeNegocioException("Já existe um usuário cadastrado com o e-mail informado.");
        }

        if (usuarioRepository.existsByCpf(dto.cpf())) {
            throw new RegraDeNegocioException("Já existe um usuário cadastrado com o CPF informado.");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.nome())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha()))
                .cpf(dto.cpf())
                .telefone(dto.telefone())
                .endereco(dto.endereco())
                .role(dto.role())
                .ativo(true)
                .build();

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(salvo);
    }

    public LoginResponseDTO autenticar(LoginRequestDTO dto, AuthenticationManager authenticationManager) {
        var authToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());
        Authentication authentication = authenticationManager.authenticate(authToken);

        Usuario usuario = (Usuario) authentication.getPrincipal();
        String tokenJWT = tokenService.gerarToken(usuario);

        return new LoginResponseDTO(
                tokenJWT,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole()
        );
    }
}
