package br.com.academia.domain.enums;

public enum TipoSala {
    SPINNING("Sala de Spinning"),
    MUSCULACAO("Sala de Musculação"),
    FIT_DANCE("Sala de Fit Dance"),
    PILATES("Sala de Pilates");

    private final String descricao;

    TipoSala(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
