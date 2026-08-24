package br.com.academia.domain.repository;

import br.com.academia.domain.entity.Sala;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {

    List<Sala> findByAtivaTrue();

    Page<Sala> findByAtivaTrue(Pageable pageable);

    Optional<Sala> findByNomeIgnoreCase(String nome);

    List<Sala> findByTipoIgnoreCaseAndAtivaTrue(String tipo);

    Page<Sala> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByNomeIgnoreCase(String nome);
}
