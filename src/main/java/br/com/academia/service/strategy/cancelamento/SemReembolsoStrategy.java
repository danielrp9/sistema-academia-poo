package br.com.academia.service.strategy.cancelamento;

import br.com.academia.domain.entity.Agendamento;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Order(3)
public class SemReembolsoStrategy implements PoliticaCancelamentoStrategy {

    @Override
    public boolean aplica(Agendamento agendamento, LocalDateTime dataCancelamento) {
        // Aplica-se como fallback para qualquer cancelamento de agendamento confirmado com menos de 3 dias
        return agendamento.isConfirmado();
    }

    @Override
    public BigDecimal calcularReembolso(Agendamento agendamento) {
        return BigDecimal.ZERO;
    }

    @Override
    public String getDescricao() {
        return "Sem Reembolso (Cancelamento com menos de 3 dias de antecedência - 0% estornado)";
    }
}
