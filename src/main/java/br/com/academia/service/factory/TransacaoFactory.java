package br.com.academia.service.factory;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.entity.Produto;
import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.CategoriaTransacao;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.enums.TipoTransacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class TransacaoFactory {

    private TransacaoFactory() {
        // Construtor privado para classe utilitária de Factory
    }

    public static TransacaoFinanceira criarReceitaAgendamento(Agendamento agendamento, Usuario usuarioResponsavel) {
        CategoriaTransacao categoria = ModalidadeAgendamento.MENSALIDADE.equals(agendamento.getModalidade())
                ? CategoriaTransacao.MENSALIDADE
                : CategoriaTransacao.DIARIA;

        String descricao = String.format("Pagamento de %s - Sala: %s - Cliente: %s",
                agendamento.getModalidade().getDescricao(),
                agendamento.getSala().getNome(),
                agendamento.getCliente().getNome());

        return TransacaoFinanceira.builder()
                .tipo(TipoTransacao.RECEITA)
                .categoria(categoria)
                .valor(agendamento.getPreco())
                .dataTransacao(LocalDateTime.now())
                .descricao(descricao)
                .usuarioResponsavel(usuarioResponsavel)
                .agendamento(agendamento)
                .build();
    }

    public static TransacaoFinanceira criarReceitaVendaProduto(Produto produto, int quantidade, BigDecimal valorTotal, Usuario usuarioResponsavel) {
        String descricao = String.format("Venda de %dx '%s' (Categoria: %s)",
                quantidade, produto.getNome(), produto.getCategoria().getDescricao());

        return TransacaoFinanceira.builder()
                .tipo(TipoTransacao.RECEITA)
                .categoria(CategoriaTransacao.VENDA_PRODUTO)
                .valor(valorTotal)
                .dataTransacao(LocalDateTime.now())
                .descricao(descricao)
                .usuarioResponsavel(usuarioResponsavel)
                .produto(produto)
                .quantidadeProduto(quantidade)
                .build();
    }

    public static TransacaoFinanceira criarDespesaEstorno(Agendamento agendamento, BigDecimal valorEstorno, Usuario usuarioResponsavel) {
        String descricao = String.format("Estorno/Reembolso de cancelamento - Agendamento ID: %d - Cliente: %s",
                agendamento.getId(), agendamento.getCliente().getNome());

        return TransacaoFinanceira.builder()
                .tipo(TipoTransacao.DESPESA)
                .categoria(ModalidadeAgendamento.MENSALIDADE.equals(agendamento.getModalidade())
                        ? CategoriaTransacao.MENSALIDADE
                        : CategoriaTransacao.DIARIA)
                .valor(valorEstorno)
                .dataTransacao(LocalDateTime.now())
                .descricao(descricao)
                .usuarioResponsavel(usuarioResponsavel)
                .agendamento(agendamento)
                .build();
    }

    public static TransacaoFinanceira criarDespesaOperacional(
            CategoriaTransacao categoria,
            BigDecimal valor,
            String descricao,
            Usuario usuarioResponsavel) {

        if (TipoTransacao.RECEITA.equals(categoria.getTipo())) {
            throw new IllegalArgumentException("A categoria informada não pertence ao tipo DESPESA.");
        }

        return TransacaoFinanceira.builder()
                .tipo(TipoTransacao.DESPESA)
                .categoria(categoria)
                .valor(valor)
                .dataTransacao(LocalDateTime.now())
                .descricao(descricao)
                .usuarioResponsavel(usuarioResponsavel)
                .build();
    }
}
