package br.com.academia.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SalaRequestDTO(
        @NotBlank(message = "O nome da sala é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String nome,

        @NotBlank(message = "O tipo/categoria da sala é obrigatório (ex: Musculação, Spinning, Pilates).")
        @Size(max = 50, message = "O tipo deve ter no máximo 50 caracteres.")
        String tipo,

        @NotNull(message = "A capacidade máxima é obrigatória.")
        @Positive(message = "A capacidade máxima deve ser maior que zero.")
        Integer capacidadeMaxima,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
        String descricao
) {}
