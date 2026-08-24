package br.com.academia.service.strategy.cancelamento;

import br.com.academia.domain.entity.Agendamento;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
@Order(2)
public class ReembolsoParcialStrategy implements PoliticaCancelamentoStrategy {

    private static final long HORAS_MINIMAS_ANTECEDENCIA = 72; // 3 dias

    @Override
    public boolean aplica(Agendamento agendamento, LocalDateTime dataCancelamento) {
        if (!agendamento.isConfirmado()) {
            return false;
        }
        if (dataCancelamento.isAfter(agendamento.getDataHoraInicio())) {
            return false;
        }
        long horasAteInicio = Duration.between(dataCancelamento, agendamento.getDataHoraInicio()).toHours();
        return horasAteInicio >= HORAS_MINIMAS_ANTECEDENCIA;
    }

    @Override
    public BigDecimal calcularReembolso(Agendamento agendamento) {
        BigDecimal baseCalculo = agendamento.getValorPago() != null ? agendamento.getValorPago() : agendamento.getPreco();
        if (baseCalculo == null) {
            return BigDecimal.ZERO;
        }
        return baseCalculo.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String getDescricao() {
        return "Reembolso Parcial (Cancelamento com 3 dias ou mais de antecedência - 50% estornado)";
    }
}
