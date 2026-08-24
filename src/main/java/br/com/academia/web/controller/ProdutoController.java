package br.com.academia.web.controller;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.service.ProdutoService;
import br.com.academia.web.dto.ProdutoRequestDTO;
import br.com.academia.web.dto.ProdutoResponseDTO;
import br.com.academia.web.dto.TransacaoResponseDTO;
import br.com.academia.web.dto.VendaProdutoRequestDTO;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Produtos e Lojinha", description = "Gestão de inventário, produtos da lojinha/lanchonete e vendas")
public class ProdutoController {

    private final ProdutoService produtoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Cadastrar novo produto", description = "Registra um novo item no catálogo da academia.")
    public ResponseEntity<ProdutoResponseDTO> cadastrar(@RequestBody @Valid ProdutoRequestDTO dto) {
        ProdutoResponseDTO response = produtoService.cadastrarProduto(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Atualizar produto", description = "Atualiza os dados cadastrais e o estoque de um produto existente.")
    public ResponseEntity<ProdutoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid ProdutoRequestDTO dto) {

        ProdutoResponseDTO response = produtoService.atualizarProduto(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar produto por ID", description = "Retorna os detalhes de um produto específico.")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @GetMapping
    @Operation(summary = "Listar produtos ativos", description = "Retorna uma lista paginada de produtos ativos.")
    public ResponseEntity<Page<ProdutoResponseDTO>> listarAtivos(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(produtoService.listarAtivos(pageable));
    }

    @PostMapping("/vender")
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Registrar venda de produto", description = "Realiza a baixa automática do estoque e registra a receita contábil correspondente.")
    public ResponseEntity<TransacaoResponseDTO> vender(
            @RequestBody @Valid VendaProdutoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {

        TransacaoResponseDTO response = produtoService.venderProduto(dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COLABORADOR')")
    @Operation(summary = "Desativar produto", description = "Desativa um produto do catálogo (soft delete).")
    public ResponseEntity<Void> desativar(@PathVariable Long id) {
        produtoService.desativarProduto(id);
        return ResponseEntity.noContent().build();
    }
}
