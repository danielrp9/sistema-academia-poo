package br.com.academia.domain.repository;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.enums.StatusAgendamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByClienteId(Long clienteId);

    Page<Agendamento> findByClienteId(Long clienteId, Pageable pageable);

    List<Agendamento> findByStatus(StatusAgendamento status);

    /**
     * Verifica se existe conflito de horário em uma sala específica para agendamentos não cancelados.
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Agendamento a
        WHERE a.sala.id = :salaId
          AND a.status <> br.com.academia.domain.enums.StatusAgendamento.CANCELADO
          AND a.dataHoraInicio < :fim
          AND a.dataHoraFim > :inicio
          AND (:agendamentoId IS NULL OR a.id <> :agendamentoId)
    """)
    boolean existeConflitoHorarioSala(
            @Param("salaId") Long salaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("agendamentoId") Long agendamentoId
    );

    /**
     * Verifica se o cliente possui agendamento confirmado ativo no instante informado (usado pela Catraca).
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Agendamento a
        WHERE a.cliente.id = :clienteId
          AND a.status = br.com.academia.domain.enums.StatusAgendamento.CONFIRMADO
          AND :instante BETWEEN a.dataHoraInicio AND a.dataHoraFim
    """)
    boolean possuiAgendamentoAtivoNoInstante(
            @Param("clienteId") Long clienteId,
            @Param("instante") LocalDateTime instante
    );

    /**
     * Busca o agendamento ativo de um cliente para um determinado instante.
     */
    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.cliente.id = :clienteId
          AND a.status = br.com.academia.domain.enums.StatusAgendamento.CONFIRMADO
          AND :instante BETWEEN a.dataHoraInicio AND a.dataHoraFim
    """)
    Optional<Agendamento> buscarAgendamentoAtivoNoInstante(
            @Param("clienteId") Long clienteId,
            @Param("instante") LocalDateTime instante
    );

    /**
     * Busca todos os agendamentos PRELIMINARES com data de início próxima ou ultrapassada
     * para execução da rotina automática de cancelamento.
     */
    @Query("""
        SELECT a FROM Agendamento a
        WHERE a.status = br.com.academia.domain.enums.StatusAgendamento.PRELIMINAR
          AND a.dataHoraInicio <= :dataLimite
    """)
    List<Agendamento> buscarPreliminaresExpirados(@Param("dataLimite") LocalDateTime dataLimite);

    /**
     * Busca agendamentos em um intervalo de datas.
     */
    List<Agendamento> findByDataHoraInicioBetween(LocalDateTime inicio, LocalDateTime fim);
}
