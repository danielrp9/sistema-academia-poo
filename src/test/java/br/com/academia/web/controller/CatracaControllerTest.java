package br.com.academia.web.controller;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.entity.Sala;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.enums.Role;
import br.com.academia.domain.enums.StatusAgendamento;
import br.com.academia.domain.enums.TipoEventoCatraca;
import br.com.academia.domain.enums.TipoSala;
import br.com.academia.domain.repository.AgendamentoRepository;
import br.com.academia.domain.repository.SalaRepository;
import br.com.academia.domain.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CatracaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SalaRepository salaRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    private Usuario clienteAtivo;
    private Usuario clienteSemAgendamento;
    private Sala salaMusculacao;

    @BeforeEach
    void setUp() {
        clienteAtivo = usuarioRepository.save(Usuario.builder()
                .nome("Lucas Atleta")
                .email("lucas.atleta@teste.com")
                .senha("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .cpf("333.444.555-66")
                .role(Role.CLIENTE)
                .ativo(true)
                .build());

        clienteSemAgendamento = usuarioRepository.save(Usuario.builder()
                .nome("Joao Inativo")
                .email("joao.sem.plano@teste.com")
                .senha("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .cpf("777.888.999-00")
                .role(Role.CLIENTE)
                .ativo(true)
                .build());

        salaMusculacao = salaRepository.findByNomeIgnoreCase("Sala de Musculação")
                .orElseGet(() -> salaRepository.save(Sala.builder()
                        .tipo("Musculação")
                        .nome("Sala de Musculação")
                        .capacidadeMaxima(50)
                        .ativa(true)
                        .build()));

        LocalDateTime agora = LocalDateTime.now();

        // Cria e confirma um agendamento para o clienteAtivo cobrindo o horário atual
        Agendamento agendamento = Agendamento.builder()
                .cliente(clienteAtivo)
                .sala(salaMusculacao)
                .dataHoraInicio(agora.minusMinutes(15))
                .dataHoraFim(agora.plusMinutes(45))
                .modalidade(ModalidadeAgendamento.DIARIA)
                .status(StatusAgendamento.CONFIRMADO)
                .preco(BigDecimal.valueOf(35.00))
                .valorPago(BigDecimal.valueOf(35.00))
                .dataConfirmacao(agora.minusHours(1))
                .build();

        agendamentoRepository.save(agendamento);
    }

    @Test
    @WithMockUser(roles = "COLABORADOR")
    @DisplayName("Deve liberar entrada na catraca para cliente com agendamento CONFIRMADO ativo")
    void deveLiberarEntradaClienteComAgendamentoAtivo() throws Exception {
        Map<String, Object> payload = Map.of(
                "clienteId", clienteAtivo.getId(),
                "tipoEvento", TipoEventoCatraca.ENTRADA.name()
        );

        mockMvc.perform(post("/api/catraca/evento")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liberado").value(true))
                .andExpect(jsonPath("$.clienteId").value(clienteAtivo.getId()))
                .andExpect(jsonPath("$.clienteNome").value("Lucas Atleta"));
    }

    @Test
    @WithMockUser(roles = "COLABORADOR")
    @DisplayName("Deve negar entrada na catraca para cliente sem agendamento ativo e retornar 403 Forbidden")
    void deveNegarEntradaClienteSemAgendamentoAtivo() throws Exception {
        Map<String, Object> payload = Map.of(
                "clienteId", clienteSemAgendamento.getId(),
                "tipoEvento", TipoEventoCatraca.ENTRADA.name()
        );

        mockMvc.perform(post("/api/catraca/evento")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Acesso à Catraca Negado"))
                .andExpect(jsonPath("$.detail").value("Acesso negado: Nenhuma diária ou mensalidade confirmada e ativa para este horário."));
    }
}
