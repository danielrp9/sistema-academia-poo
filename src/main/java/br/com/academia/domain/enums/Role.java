package br.com.academia.domain.enums;

public enum Role {
    ADMIN("Administrador"),
    COLABORADOR("Colaborador"),
    CLIENTE("Cliente");

    private final String descricao;

    Role(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
