package br.com.academia.service.strategy.cancelamento;

import br.com.academia.domain.entity.Agendamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface PoliticaCancelamentoStrategy {

    /**
     * Avalia se esta estratégia se aplica ao cenário de cancelamento informado.
     */
    boolean aplica(Agendamento agendamento, LocalDateTime dataCancelamento);

    /**
     * Calcula o valor a ser estornado/reembolsado ao cliente.
     */
    BigDecimal calcularReembolso(Agendamento agendamento);

    /**
     * Retorna uma descrição amigável da regra aplicada.
     */
    String getDescricao();
}
