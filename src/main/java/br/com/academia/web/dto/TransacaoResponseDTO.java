package br.com.academia.web.dto;

import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.enums.CategoriaTransacao;
import br.com.academia.domain.enums.TipoTransacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransacaoResponseDTO(
        Long id,
        TipoTransacao tipo,
        CategoriaTransacao categoria,
        BigDecimal valor,
        LocalDateTime dataTransacao,
        String descricao,
        Long usuarioResponsavelId,
        String usuarioResponsavelNome,
        Long agendamentoId,
        Long produtoId,
        Integer quantidadeProduto
) {
    public static TransacaoResponseDTO fromEntity(TransacaoFinanceira transacao) {
        return new TransacaoResponseDTO(
                transacao.getId(),
                transacao.getTipo(),
                transacao.getCategoria(),
                transacao.getValor(),
                transacao.getDataTransacao(),
                transacao.getDescricao(),
                transacao.getUsuarioResponsavel() != null ? transacao.getUsuarioResponsavel().getId() : null,
                transacao.getUsuarioResponsavel() != null ? transacao.getUsuarioResponsavel().getNome() : null,
                transacao.getAgendamento() != null ? transacao.getAgendamento().getId() : null,
                transacao.getProduto() != null ? transacao.getProduto().getId() : null,
                transacao.getQuantidadeProduto()
        );
    }
}
