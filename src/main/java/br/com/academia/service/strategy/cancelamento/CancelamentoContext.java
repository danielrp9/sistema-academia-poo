package br.com.academia.service.strategy.cancelamento;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.exception.RegraDeNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CancelamentoContext {

    private final List<PoliticaCancelamentoStrategy> politicas;

    /**
     * Identifica a estratégia adequada com base no estado do agendamento e na data do cancelamento.
     */
    public PoliticaCancelamentoStrategy obterPolitica(Agendamento agendamento, LocalDateTime dataCancelamento) {
        return politicas.stream()
                .filter(p -> p.aplica(agendamento, dataCancelamento))
                .findFirst()
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Nenhuma política de cancelamento compatível foi encontrada para o agendamento."
                ));
    }

    /**
     * Calcula o valor de reembolso aplicando a estratégia selecionada.
     */
    public BigDecimal calcularReembolso(Agendamento agendamento, LocalDateTime dataCancelamento) {
        PoliticaCancelamentoStrategy politica = obterPolitica(agendamento, dataCancelamento);
        return politica.calcularReembolso(agendamento);
    }
}
