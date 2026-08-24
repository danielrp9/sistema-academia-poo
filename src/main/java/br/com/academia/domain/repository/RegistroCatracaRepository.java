package br.com.academia.domain.repository;

import br.com.academia.domain.entity.RegistroCatraca;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroCatracaRepository extends JpaRepository<RegistroCatraca, Long> {

    Page<RegistroCatraca> findByClienteIdOrderByRegistradoEmDesc(Long clienteId, Pageable pageable);

    List<RegistroCatraca> findByRegistradoEmBetweenOrderByRegistradoEmDesc(LocalDateTime inicio, LocalDateTime fim);

    Optional<RegistroCatraca> findFirstByClienteIdAndDataHoraSaidaIsNullOrderByDataHoraEntradaDesc(Long clienteId);

    List<RegistroCatraca> findByLiberadoFalseOrderByRegistradoEmDesc();
}
