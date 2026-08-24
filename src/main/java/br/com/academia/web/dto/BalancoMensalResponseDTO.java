package br.com.academia.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record BalancoMensalResponseDTO(
        int ano,
        int mes,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal saldoLiquido,
        List<TransacaoResponseDTO> transacoes
) {}
