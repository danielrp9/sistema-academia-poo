package br.com.academia.service.strategy.cancelamento;

import br.com.academia.domain.entity.Agendamento;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Order(1)
public class ReembolsoIntegralPreliminarStrategy implements PoliticaCancelamentoStrategy {

    @Override
    public boolean aplica(Agendamento agendamento, LocalDateTime dataCancelamento) {
        // Aplica-se se o agendamento ainda estiver em estado PRELIMINAR
        return agendamento.isPreliminar();
    }

    @Override
    public BigDecimal calcularReembolso(Agendamento agendamento) {
        if (agendamento.getValorPago() != null && agendamento.getValorPago().compareTo(BigDecimal.ZERO) > 0) {
            return agendamento.getValorPago();
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String getDescricao() {
        return "Reembolso Integral (Cancelamento de Agendamento Preliminar - 100% estornado)";
    }
}
