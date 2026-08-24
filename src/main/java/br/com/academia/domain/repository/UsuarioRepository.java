package br.com.academia.domain.repository;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    List<Usuario> findByRole(Role role);

    List<Usuario> findByAtivoTrue();

    Page<Usuario> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
