package br.com.academia.web.controller;

import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.service.PlanoService;
import br.com.academia.web.dto.PlanoRequestDTO;
import br.com.academia.web.dto.PlanoResponseDTO;
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
@RequestMapping("/api/planos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Planos e Precificação", description = "Gerenciamento dinâmico de planos, pacotes e valores de diárias e mensalidades")
public class PlanoController {

    private final PlanoService planoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Criar plano ou modalidade", description = "Cadastra uma nova opção de diária, mensalidade ou pacote.")
    public ResponseEntity<PlanoResponseDTO> criar(@RequestBody @Valid PlanoRequestDTO dto) {
        PlanoResponseDTO response = planoService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar plano", description = "Atualiza nome, modalidade, preço ou validade de um plano.")
    public ResponseEntity<PlanoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid PlanoRequestDTO dto) {

        PlanoResponseDTO response = planoService.atualizar(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativar ou inativar plano", description = "Altera a visibilidade do plano no catálogo.")
    public ResponseEntity<Void> alternarStatus(
            @PathVariable Long id,
            @RequestParam boolean ativo) {

        planoService.alternarStatus(id, ativo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar plano por ID", description = "Retorna os detalhes de um plano específico.")
    public ResponseEntity<PlanoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(planoService.buscarPorId(id));
    }

    @GetMapping("/ativos")
    @Operation(summary = "Listar planos ativos", description = "Retorna todos os planos atualmente disponíveis para contratação.")
    public ResponseEntity<List<PlanoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(planoService.listarAtivos());
    }

    @GetMapping("/modalidade/{modalidade}")
    @Operation(summary = "Listar planos por modalidade", description = "Filtra planos ativos por DIARIA ou MENSALIDADE.")
    public ResponseEntity<List<PlanoResponseDTO>> listarPorModalidade(@PathVariable ModalidadeAgendamento modalidade) {
        return ResponseEntity.ok(planoService.listarPorModalidade(modalidade));
    }

    @GetMapping
    @Operation(summary = "Listar todos os planos paginados", description = "Retorna a lista paginada de todos os planos cadastrados.")
    public ResponseEntity<Page<PlanoResponseDTO>> listarPaginado(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(planoService.listarPaginado(pageable));
    }
}
