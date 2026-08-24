package br.com.academia.domain.enums;

public enum CategoriaProduto {
    SUPLEMENTO("Suplemento"),
    BEBIDA("Bebida"),
    SNACK("Snack / Alimento"),
    VESTUARIO("Vestuário"),
    ACESSORIO("Acessório"),
    OUTROS("Outros");

    private final String descricao;

    CategoriaProduto(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
