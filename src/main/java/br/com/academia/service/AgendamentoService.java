package br.com.academia.service;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.entity.Sala;
import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.Role;
import br.com.academia.domain.enums.StatusAgendamento;
import br.com.academia.domain.exception.ConflitoHorarioException;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.exception.RegraDeNegocioException;
import br.com.academia.domain.repository.AgendamentoRepository;
import br.com.academia.domain.repository.SalaRepository;
import br.com.academia.domain.repository.TransacaoFinanceiraRepository;
import br.com.academia.domain.repository.UsuarioRepository;
import br.com.academia.service.factory.TransacaoFactory;
import br.com.academia.service.strategy.cancelamento.CancelamentoContext;
import br.com.academia.web.dto.AgendamentoRequestDTO;
import br.com.academia.web.dto.AgendamentoResponseDTO;
import br.com.academia.web.dto.CancelamentoAgendamentoDTO;
import br.com.academia.web.dto.ConfirmacaoAgendamentoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SalaRepository salaRepository;
    private final TransacaoFinanceiraRepository transacaoFinanceiraRepository;
    private final CancelamentoContext cancelamentoContext;

    @Transactional
    public AgendamentoResponseDTO criarAgendamentoPreliminar(AgendamentoRequestDTO dto) {
        if (!dto.dataHoraFim().isAfter(dto.dataHoraInicio())) {
            throw new RegraDeNegocioException("A data/hora de término deve ser posterior à data/hora de início.");
        }

        Usuario cliente = usuarioRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", dto.clienteId()));

        if (!cliente.isEnabled()) {
            throw new RegraDeNegocioException("O cliente informado está inativo no sistema.");
        }

        Sala sala = salaRepository.findById(dto.salaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", dto.salaId()));

        if (Boolean.FALSE.equals(sala.getAtiva())) {
            throw new RegraDeNegocioException(String.format("A sala '%s' está inativa para agendamentos.", sala.getNome()));
        }

        boolean existeConflito = agendamentoRepository.existeConflitoHorarioSala(
                sala.getId(),
                dto.dataHoraInicio(),
                dto.dataHoraFim(),
                null
        );

        if (existeConflito) {
            throw new ConflitoHorarioException(String.format(
                    "Já existe outro agendamento para a sala '%s' no intervalo de %s até %s.",
                    sala.getNome(), dto.dataHoraInicio(), dto.dataHoraFim()
            ));
        }

        Usuario instrutor = null;
        if (dto.instrutorId() != null) {
            instrutor = usuarioRepository.findById(dto.instrutorId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Instrutor", dto.instrutorId()));

            if (Role.CLIENTE.equals(instrutor.getRole())) {
                throw new RegraDeNegocioException("O usuário informado como instrutor não possui perfil de instrutor/colaborador.");
            }
        }

        Agendamento agendamento = Agendamento.builder()
                .cliente(cliente)
                .sala(sala)
                .instrutor(instrutor)
                .dataHoraInicio(dto.dataHoraInicio())
                .dataHoraFim(dto.dataHoraFim())
                .modalidade(dto.modalidade())
                .status(StatusAgendamento.PRELIMINAR)
                .preco(dto.preco())
                .build();

        Agendamento salvo = agendamentoRepository.save(agendamento);
        return AgendamentoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public AgendamentoResponseDTO confirmarAgendamento(Long agendamentoId, ConfirmacaoAgendamentoDTO dto, Usuario usuarioResponsavel) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento", agendamentoId));

        if (agendamento.isConfirmado()) {
            throw new RegraDeNegocioException("Este agendamento já se encontra confirmado.");
        }

        if (agendamento.isCancelado()) {
            throw new RegraDeNegocioException("Não é possível confirmar um agendamento cancelado.");
        }

        agendamento.confirmar(dto.valorPago());
        Agendamento agendamentoAtualizado = agendamentoRepository.save(agendamento);

        // Gera o lançamento contábil de Receita
        TransacaoFinanceira receita = TransacaoFactory.criarReceitaAgendamento(agendamentoAtualizado, usuarioResponsavel);
        transacaoFinanceiraRepository.save(receita);

        return AgendamentoResponseDTO.fromEntity(agendamentoAtualizado);
    }

    @Transactional
    public AgendamentoResponseDTO cancelarAgendamento(Long agendamentoId, CancelamentoAgendamentoDTO dto, Usuario usuarioResponsavel) {
        Agendamento agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento", agendamentoId));

        if (agendamento.isCancelado()) {
            throw new RegraDeNegocioException("O agendamento já está cancelado.");
        }

        LocalDateTime agora = LocalDateTime.now();
        BigDecimal valorReembolso = cancelamentoContext.calcularReembolso(agendamento, agora);

        agendamento.cancelar(valorReembolso, dto.motivo());
        Agendamento agendamentoCancelado = agendamentoRepository.save(agendamento);

        // Se houver valor a ser estornado, gera lançamento de Despesa de Estorno
        if (valorReembolso != null && valorReembolso.compareTo(BigDecimal.ZERO) > 0) {
            TransacaoFinanceira estorno = TransacaoFactory.criarDespesaEstorno(agendamentoCancelado, valorReembolso, usuarioResponsavel);
            transacaoFinanceiraRepository.save(estorno);
        }

        return AgendamentoResponseDTO.fromEntity(agendamentoCancelado);
    }

    /**
     * Rotina para cancelar automaticamente agendamentos preliminares não confirmados em até 5 dias úteis antes do início.
     */
    @Transactional
    public int cancelarPreliminaresExpirados() {
        LocalDateTime limite = calcularDataLimite5DiasUteis(LocalDate.now());
        List<Agendamento> expirados = agendamentoRepository.buscarPreliminaresExpirados(limite);

        for (Agendamento ag : expirados) {
            ag.cancelar(BigDecimal.ZERO, "Cancelamento automático: Não confirmado no prazo de 5 dias úteis de antecedência.");
            agendamentoRepository.save(ag);
        }
        return expirados.size();
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscarPorId(Long id) {
        return agendamentoRepository.findById(id)
                .map(AgendamentoResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Agendamento", id));
    }

    @Transactional(readOnly = true)
    public Page<AgendamentoResponseDTO> listarTodos(Pageable pageable) {
        return agendamentoRepository.findAll(pageable)
                .map(AgendamentoResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<AgendamentoResponseDTO> listarPorCliente(Long clienteId, Pageable pageable) {
        return agendamentoRepository.findByClienteId(clienteId, pageable)
                .map(AgendamentoResponseDTO::fromEntity);
    }

    private LocalDateTime calcularDataLimite5DiasUteis(LocalDate dataBase) {
        LocalDate limite = dataBase;
        int diasUteisAdicionados = 0;
        while (diasUteisAdicionados < 5) {
            limite = limite.plusDays(1);
            if (limite.getDayOfWeek() != DayOfWeek.SATURDAY && limite.getDayOfWeek() != DayOfWeek.SUNDAY) {
                diasUteisAdicionados++;
            }
        }
        return limite.atTime(23, 59, 59);
    }
}
