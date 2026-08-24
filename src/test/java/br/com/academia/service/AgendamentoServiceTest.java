package br.com.academia.service;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.entity.Sala;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.enums.Role;
import br.com.academia.domain.enums.StatusAgendamento;
import br.com.academia.domain.enums.TipoSala;
import br.com.academia.domain.repository.AgendamentoRepository;
import br.com.academia.domain.repository.SalaRepository;
import br.com.academia.domain.repository.TransacaoFinanceiraRepository;
import br.com.academia.domain.repository.UsuarioRepository;
import br.com.academia.service.strategy.cancelamento.CancelamentoContext;
import br.com.academia.service.strategy.cancelamento.PoliticaCancelamentoStrategy;
import br.com.academia.service.strategy.cancelamento.ReembolsoIntegralPreliminarStrategy;
import br.com.academia.service.strategy.cancelamento.ReembolsoParcialStrategy;
import br.com.academia.service.strategy.cancelamento.SemReembolsoStrategy;
import br.com.academia.web.dto.AgendamentoResponseDTO;
import br.com.academia.web.dto.CancelamentoAgendamentoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private SalaRepository salaRepository;

    @Mock
    private TransacaoFinanceiraRepository transacaoFinanceiraRepository;

    private AgendamentoService agendamentoService;
    private CancelamentoContext cancelamentoContext;

    private Usuario cliente;
    private Usuario admin;
    private Sala sala;

    @BeforeEach
    void setUp() {
        List<PoliticaCancelamentoStrategy> politicas = List.of(
                new ReembolsoIntegralPreliminarStrategy(),
                new ReembolsoParcialStrategy(),
                new SemReembolsoStrategy()
        );
        cancelamentoContext = new CancelamentoContext(politicas);

        agendamentoService = new AgendamentoService(
                agendamentoRepository,
                usuarioRepository,
                salaRepository,
                transacaoFinanceiraRepository,
                cancelamentoContext
        );

        cliente = Usuario.builder()
                .id(1L)
                .nome("Maria Silva")
                .email("maria@teste.com")
                .cpf("111.222.333-44")
                .role(Role.CLIENTE)
                .ativo(true)
                .build();

        admin = Usuario.builder()
                .id(2L)
                .nome("Administrador")
                .email("admin@teste.com")
                .cpf("000.000.000-00")
                .role(Role.ADMIN)
                .ativo(true)
                .build();

        sala = Sala.builder()
                .id(1L)
                .tipo("Spinning")
                .nome("Sala de Spinning")
                .capacidadeMaxima(25)
                .ativa(true)
                .build();
    }

    @Test
    @DisplayName("Strategy 1: Deve cancelar agendamento PRELIMINAR com reembolso integral de 100%")
    void deveCancelarAgendamentoPreliminarComReembolsoIntegral() {
        LocalDateTime agora = LocalDateTime.now();
        Agendamento agendamentoPreliminar = Agendamento.builder()
                .id(10L)
                .cliente(cliente)
                .sala(sala)
                .dataHoraInicio(agora.plusDays(10))
                .dataHoraFim(agora.plusDays(10).plusHours(1))
                .modalidade(ModalidadeAgendamento.DIARIA)
                .status(StatusAgendamento.PRELIMINAR)
                .preco(BigDecimal.valueOf(100.00))
                .valorPago(BigDecimal.valueOf(100.00))
                .build();

        when(agendamentoRepository.findById(10L)).thenReturn(Optional.of(agendamentoPreliminar));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelamentoAgendamentoDTO dto = new CancelamentoAgendamentoDTO("Desistência do cliente antes da confirmação.");
        AgendamentoResponseDTO resposta = agendamentoService.cancelarAgendamento(10L, dto, admin);

        assertNotNull(resposta);
        assertEquals(StatusAgendamento.CANCELADO, resposta.status());
        assertEquals(BigDecimal.valueOf(100.00), resposta.valorEstornado());
        verify(transacaoFinanceiraRepository).save(any());
    }

    @Test
    @DisplayName("Strategy 2: Deve cancelar agendamento CONFIRMADO com antecedência >= 3 dias com estorno parcial de 50%")
    void deveCancelarAgendamentoConfirmadoComReembolsoParcial50PorCento() {
        LocalDateTime agora = LocalDateTime.now();
        Agendamento agendamentoConfirmado = Agendamento.builder()
                .id(20L)
                .cliente(cliente)
                .sala(sala)
                .dataHoraInicio(agora.plusDays(5)) // 5 dias antes (>= 3 dias)
                .dataHoraFim(agora.plusDays(5).plusHours(1))
                .modalidade(ModalidadeAgendamento.DIARIA)
                .status(StatusAgendamento.CONFIRMADO)
                .preco(BigDecimal.valueOf(200.00))
                .valorPago(BigDecimal.valueOf(200.00))
                .build();

        when(agendamentoRepository.findById(20L)).thenReturn(Optional.of(agendamentoConfirmado));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelamentoAgendamentoDTO dto = new CancelamentoAgendamentoDTO("Compromisso imprevisto.");
        AgendamentoResponseDTO resposta = agendamentoService.cancelarAgendamento(20L, dto, admin);

        assertNotNull(resposta);
        assertEquals(StatusAgendamento.CANCELADO, resposta.status());
        assertEquals(BigDecimal.valueOf(100.00).setScale(2, RoundingMode.HALF_UP), resposta.valorEstornado());
        verify(transacaoFinanceiraRepository).save(any());
    }

    @Test
    @DisplayName("Strategy 3: Deve cancelar agendamento CONFIRMADO com antecedência < 3 dias sem reembolso (0%)")
    void deveCancelarAgendamentoConfirmadoSemReembolso() {
        LocalDateTime agora = LocalDateTime.now();
        Agendamento agendamentoProximo = Agendamento.builder()
                .id(30L)
                .cliente(cliente)
                .sala(sala)
                .dataHoraInicio(agora.plusHours(24)) // Apenas 24h antes (< 72h)
                .dataHoraFim(agora.plusHours(25))
                .modalidade(ModalidadeAgendamento.DIARIA)
                .status(StatusAgendamento.CONFIRMADO)
                .preco(BigDecimal.valueOf(150.00))
                .valorPago(BigDecimal.valueOf(150.00))
                .build();

        when(agendamentoRepository.findById(30L)).thenReturn(Optional.of(agendamentoProximo));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CancelamentoAgendamentoDTO dto = new CancelamentoAgendamentoDTO("Cancelamento de última hora.");
        AgendamentoResponseDTO resposta = agendamentoService.cancelarAgendamento(30L, dto, admin);

        assertNotNull(resposta);
        assertEquals(StatusAgendamento.CANCELADO, resposta.status());
        assertEquals(BigDecimal.ZERO, resposta.valorEstornado());
    }
}
