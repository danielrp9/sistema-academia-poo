package br.com.academia.domain.enums;

public enum ModalidadeAgendamento {
    DIARIA("Diária"),
    MENSALIDADE("Mensalidade");

    private final String descricao;

    ModalidadeAgendamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
