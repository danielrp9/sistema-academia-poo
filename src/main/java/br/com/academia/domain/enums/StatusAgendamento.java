package br.com.academia.domain.enums;

public enum StatusAgendamento {
    PRELIMINAR("Preliminar - Aguardando Confirmação"),
    CONFIRMADO("Confirmado"),
    CANCELADO("Cancelado");

    private final String descricao;

    StatusAgendamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
