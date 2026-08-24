package br.com.academia.web.dto;

import br.com.academia.domain.entity.Produto;
import br.com.academia.domain.enums.CategoriaProduto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        CategoriaProduto categoria,
        BigDecimal preco,
        Integer quantidadeEstoque,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static ProdutoResponseDTO fromEntity(Produto produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getCategoria(),
                produto.getPreco(),
                produto.getQuantidadeEstoque(),
                produto.getAtivo(),
                produto.getCriadoEm()
        );
    }
}
