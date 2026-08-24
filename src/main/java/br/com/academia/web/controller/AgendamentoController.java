package br.com.academia.web.controller;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.service.AgendamentoService;
import br.com.academia.web.dto.AgendamentoRequestDTO;
import br.com.academia.web.dto.AgendamentoResponseDTO;
import br.com.academia.web.dto.CancelamentoAgendamentoDTO;
import br.com.academia.web.dto.ConfirmacaoAgendamentoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Agendamentos", description = "Gestão de diárias, mensalidades, confirmações e cancelamentos com estorno")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    @PostMapping
    @Operation(summary = "Criar novo agendamento preliminar", description = "Cria um agendamento no estado PRELIMINAR validando conflitos de sala e horários.")
    public ResponseEntity<AgendamentoResponseDTO> criarAgendamento(@RequestBody @Valid AgendamentoRequestDTO dto) {
        AgendamentoResponseDTO response = agendamentoService.criarAgendamentoPreliminar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar agendamento com pagamento", description = "Transaciona o agendamento para CONFIRMADO e gera o lançamento financeiro de receita.")
    public ResponseEntity<AgendamentoResponseDTO> confirmarAgendamento(
            @PathVariable Long id,
            @RequestBody @Valid ConfirmacaoAgendamentoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {

        AgendamentoResponseDTO response = agendamentoService.confirmarAgendamento(id, dto, usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar agendamento", description = "Aplica as políticas de cancelamento (Strategy) e gera o estorno/reembolso financeiro quando aplicável.")
    public ResponseEntity<AgendamentoResponseDTO> cancelarAgendamento(
            @PathVariable Long id,
            @RequestBody @Valid CancelamentoAgendamentoDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {

        AgendamentoResponseDTO response = agendamentoService.cancelarAgendamento(id, dto, usuarioLogado);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar agendamento por ID", description = "Retorna os detalhes completos de um agendamento específico.")
    public ResponseEntity<AgendamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id));
    }

    @GetMapping
    @Operation(summary = "Listar agendamentos paginados", description = "Retorna uma lista paginada de todos os agendamentos cadastrados.")
    public ResponseEntity<Page<AgendamentoResponseDTO>> listarTodos(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(agendamentoService.listarTodos(pageable));
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Listar agendamentos de um cliente", description = "Retorna todos os agendamentos pertencentes ao cliente informado.")
    public ResponseEntity<Page<AgendamentoResponseDTO>> listarPorCliente(
            @PathVariable Long clienteId,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(agendamentoService.listarPorCliente(clienteId, pageable));
    }

    @PostMapping("/rotina-expirados")
    @Operation(summary = "Executar rotina de cancelamento automático", description = "Cancela agendamentos preliminares não confirmados no prazo limite de 5 dias úteis antes do início.")
    public ResponseEntity<String> cancelarExpirados() {
        int totalCancelados = agendamentoService.cancelarPreliminaresExpirados();
        return ResponseEntity.ok(String.format("Rotina concluída com sucesso. %d agendamentos preliminares foram cancelados.", totalCancelados));
    }
}
