package br.com.academia.web.dto;

import br.com.academia.domain.entity.Sala;

import java.time.LocalDateTime;

public record SalaResponseDTO(
        Long id,
        String nome,
        String tipo,
        Integer capacidadeMaxima,
        Boolean ativa,
        String descricao,
        LocalDateTime criadoEm
) {
    public static SalaResponseDTO fromEntity(Sala sala) {
        return new SalaResponseDTO(
                sala.getId(),
                sala.getNome(),
                sala.getTipo(),
                sala.getCapacidadeMaxima(),
                sala.getAtiva(),
                sala.getDescricao(),
                sala.getCriadoEm()
        );
    }
}
