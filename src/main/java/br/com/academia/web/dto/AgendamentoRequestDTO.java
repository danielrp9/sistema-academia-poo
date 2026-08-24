package br.com.academia.web.dto;

import br.com.academia.domain.enums.ModalidadeAgendamento;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AgendamentoRequestDTO(
        @NotNull(message = "O ID do cliente é obrigatório.")
        Long clienteId,

        @NotNull(message = "O ID da sala é obrigatório.")
        Long salaId,

        Long instrutorId,

        @NotNull(message = "A data/hora de início é obrigatória.")
        @Future(message = "A data/hora de início deve ser no futuro.")
        LocalDateTime dataHoraInicio,

        @NotNull(message = "A data/hora de término é obrigatória.")
        LocalDateTime dataHoraFim,

        @NotNull(message = "A modalidade é obrigatória (DIARIA ou MENSALIDADE).")
        ModalidadeAgendamento modalidade,

        @NotNull(message = "O preço do agendamento é obrigatório.")
        @Positive(message = "O preço deve ser maior que zero.")
        BigDecimal preco
) {}
