package br.com.academia.web.dto;

import br.com.academia.domain.enums.CategoriaProduto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoRequestDTO(
        @NotBlank(message = "O nome do produto é obrigatório.")
        @Size(max = 150, message = "O nome do produto deve ter no máximo 150 caracteres.")
        String nome,

        @NotNull(message = "A categoria do produto é obrigatória.")
        CategoriaProduto categoria,

        @NotNull(message = "O preço do produto é obrigatório.")
        @Positive(message = "O preço do produto deve ser maior que zero.")
        BigDecimal preco,

        @NotNull(message = "A quantidade em estoque é obrigatória.")
        @PositiveOrZero(message = "A quantidade em estoque não pode ser negativa.")
        Integer quantidadeEstoque
) {}
