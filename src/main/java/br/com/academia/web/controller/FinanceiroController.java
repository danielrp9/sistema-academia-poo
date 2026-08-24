package br.com.academia.web.controller;

import br.com.academia.domain.entity.Usuario;
import br.com.academia.service.FinanceiroService;
import br.com.academia.web.dto.BalancoMensalResponseDTO;
import br.com.academia.web.dto.TransacaoRequestDTO;
import br.com.academia.web.dto.TransacaoResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Financeiro", description = "Lançamento de despesas operacionais e consolidação de DRE / Balanço Mensal (Apenas ADMIN)")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @PostMapping("/despesas")
    @Operation(summary = "Lançar despesa operacional", description = "Registra uma despesa administrativa, de limpeza, insumos, manutenção ou pagamento de instrutor.")
    public ResponseEntity<TransacaoResponseDTO> lancarDespesa(
            @RequestBody @Valid TransacaoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioLogado) {

        TransacaoResponseDTO response = financeiroService.lancarDespesaOperacional(dto, usuarioLogado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/balanco-mensal")
    @Operation(summary = "Gerar balanço mensal e DRE", description = "Gera o balanço consolidado de receitas, despesas e lucro/saldo líquido para o mês e ano informados.")
    public ResponseEntity<BalancoMensalResponseDTO> gerarBalancoMensal(
            @RequestParam int ano,
            @RequestParam int mes) {

        BalancoMensalResponseDTO balanco = financeiroService.gerarBalancoMensal(ano, mes);
        return ResponseEntity.ok(balanco);
    }

    @GetMapping("/transacoes")
    @Operation(summary = "Listar transações contábeis por período", description = "Retorna uma lista paginada de lançamentos financeiros entre duas datas.")
    public ResponseEntity<Page<TransacaoResponseDTO>> listarTransacoes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(financeiroService.listarTransacoesPorPeriodo(inicio, fim, pageable));
    }
}
