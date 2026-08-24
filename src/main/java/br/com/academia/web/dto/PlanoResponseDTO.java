package br.com.academia.web.dto;

import br.com.academia.domain.entity.Plano;
import br.com.academia.domain.enums.ModalidadeAgendamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PlanoResponseDTO(
        Long id,
        String nome,
        ModalidadeAgendamento modalidade,
        Long salaId,
        String salaNome,
        BigDecimal preco,
        Integer diasValidade,
        String descricao,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static PlanoResponseDTO fromEntity(Plano plano) {
        return new PlanoResponseDTO(
                plano.getId(),
                plano.getNome(),
                plano.getModalidade(),
                plano.getSala() != null ? plano.getSala().getId() : null,
                plano.getSala() != null ? plano.getSala().getNome() : null,
                plano.getPreco(),
                plano.getDiasValidade(),
                plano.getDescricao(),
                plano.getAtivo(),
                plano.getCriadoEm()
        );
    }
}
