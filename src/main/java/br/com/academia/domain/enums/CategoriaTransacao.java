package br.com.academia.domain.enums;

public enum CategoriaTransacao {
    // Receitas
    DIARIA(TipoTransacao.RECEITA, "Receita de Diária"),
    MENSALIDADE(TipoTransacao.RECEITA, "Receita de Mensalidade"),
    VENDA_PRODUTO(TipoTransacao.RECEITA, "Venda de Produto (Lojinha/Lanchonete)"),

    // Despesas
    LIMPEZA(TipoTransacao.DESPESA, "Despesa de Limpeza"),
    PAGAMENTO_INSTRUTOR(TipoTransacao.DESPESA, "Pagamento de Instrutor"),
    MANUTENCAO(TipoTransacao.DESPESA, "Despesa de Manutenção"),
    INSUMOS(TipoTransacao.DESPESA, "Compra de Insumos");

    private final TipoTransacao tipo;
    private final String descricao;

    CategoriaTransacao(TipoTransacao tipo, String descricao) {
        this.tipo = tipo;
        this.descricao = descricao;
    }

    public TipoTransacao getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }
}
