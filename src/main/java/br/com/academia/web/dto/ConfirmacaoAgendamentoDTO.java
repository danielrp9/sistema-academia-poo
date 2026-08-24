package br.com.academia.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ConfirmacaoAgendamentoDTO(
        @NotNull(message = "O valor pago é obrigatório.")
        @Positive(message = "O valor pago deve ser maior que zero.")
        BigDecimal valorPago
) {}
