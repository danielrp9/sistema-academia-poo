package br.com.academia.web.controller;

import br.com.academia.service.SalaService;
import br.com.academia.web.dto.SalaRequestDTO;
import br.com.academia.web.dto.SalaResponseDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Salas", description = "CRUD e gerenciamento dinâmico de salas e espaços da academia")
public class SalaController {

    private final SalaService salaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Criar nova sala", description = "Registra um novo espaço/sala com capacidade configurável.")
    public ResponseEntity<SalaResponseDTO> criar(@RequestBody @Valid SalaRequestDTO dto) {
        SalaResponseDTO response = salaService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Atualizar sala", description = "Atualiza nome, tipo, capacidade ou descrição da sala.")
    public ResponseEntity<SalaResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid SalaRequestDTO dto) {

        SalaResponseDTO response = salaService.atualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar ou Inativar sala", description = "Altera a disponibilidade da sala para novos agendamentos.")
    public ResponseEntity<Void> alternarStatus(
            @PathVariable Long id,
            @RequestParam boolean ativo) {

        salaService.alternarStatus(id, ativo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar sala por ID", description = "Retorna os detalhes de uma sala específica.")
    public ResponseEntity<SalaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(salaService.buscarPorId(id));
    }

    @GetMapping("/ativas")
    @Operation(summary = "Listar salas ativas", description = "Retorna todas as salas ativas disponíveis para agendamento.")
    public ResponseEntity<List<SalaResponseDTO>> listarAtivas() {
        return ResponseEntity.ok(salaService.listarAtivas());
    }

    @GetMapping
    @Operation(summary = "Listar todas as salas paginadas", description = "Retorna a listagem completa de salas cadastradas.")
    public ResponseEntity<Page<SalaResponseDTO>> listarPaginado(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(salaService.listarPaginado(pageable));
    }
}
