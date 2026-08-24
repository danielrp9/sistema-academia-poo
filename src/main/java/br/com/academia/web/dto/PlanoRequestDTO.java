package br.com.academia.web.dto;

import br.com.academia.domain.enums.ModalidadeAgendamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PlanoRequestDTO(
        @NotBlank(message = "O nome do plano é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String nome,

        @NotNull(message = "A modalidade é obrigatória (DIARIA ou MENSALIDADE).")
        ModalidadeAgendamento modalidade,

        Long salaId,

        @NotNull(message = "O preço do plano é obrigatório.")
        @Positive(message = "O preço deve ser maior que zero.")
        BigDecimal preco,

        @NotNull(message = "A quantidade de dias de validade é obrigatória.")
        @Positive(message = "A validade em dias deve ser maior que zero.")
        Integer diasValidade,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
        String descricao
) {}
