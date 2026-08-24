package br.com.academia.web.controller;

import br.com.academia.service.CatracaService;
import br.com.academia.web.dto.EventoCatracaRequestDTO;
import br.com.academia.web.dto.RegistroCatracaResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catraca")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Catraca", description = "Webhook e ingestão de acessos da catraca física com validação de agendamento/mensalidade")
public class CatracaController {

    private final CatracaService catracaService;

    @PostMapping("/evento")
    @Operation(summary = "Ingestão de evento de catraca", description = "Recebe eventos de ENTRADA ou SAIDA da catraca. Valida se o cliente possui agendamento confirmado ativo.")
    public ResponseEntity<RegistroCatracaResponseDTO> processarEvento(@RequestBody @Valid EventoCatracaRequestDTO dto) {
        RegistroCatracaResponseDTO response = catracaService.processarEvento(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/historico")
    @Operation(summary = "Listar histórico de acessos", description = "Retorna o registro completo de acessos de todos os clientes.")
    public ResponseEntity<Page<RegistroCatracaResponseDTO>> listarHistorico(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(catracaService.listarHistorico(pageable));
    }

    @GetMapping("/historico/cliente/{clienteId}")
    @Operation(summary = "Listar histórico de acessos por cliente", description = "Retorna o histórico de entradas e saídas de um cliente específico.")
    public ResponseEntity<Page<RegistroCatracaResponseDTO>> listarHistoricoPorCliente(
            @PathVariable Long clienteId,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(catracaService.listarHistoricoPorCliente(clienteId, pageable));
    }
}
