package br.com.academia.web.dto;

import br.com.academia.domain.entity.Agendamento;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.enums.StatusAgendamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AgendamentoResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        String clienteCpfMascarado,
        Long salaId,
        String salaNome,
        Long instrutorId,
        String instrutorNome,
        LocalDateTime dataHoraInicio,
        LocalDateTime dataHoraFim,
        ModalidadeAgendamento modalidade,
        StatusAgendamento status,
        BigDecimal preco,
        BigDecimal valorPago,
        BigDecimal valorEstornado,
        LocalDateTime dataConfirmacao,
        LocalDateTime dataCancelamento,
        String motivoCancelamento,
        LocalDateTime criadoEm
) {
    public static AgendamentoResponseDTO fromEntity(Agendamento agendamento) {
        return new AgendamentoResponseDTO(
                agendamento.getId(),
                agendamento.getCliente() != null ? agendamento.getCliente().getId() : null,
                agendamento.getCliente() != null ? agendamento.getCliente().getNome() : null,
                agendamento.getCliente() != null ? agendamento.getCliente().getCpfMascarado() : null,
                agendamento.getSala() != null ? agendamento.getSala().getId() : null,
                agendamento.getSala() != null ? agendamento.getSala().getNome() : null,
                agendamento.getInstrutor() != null ? agendamento.getInstrutor().getId() : null,
                agendamento.getInstrutor() != null ? agendamento.getInstrutor().getNome() : null,
                agendamento.getDataHoraInicio(),
                agendamento.getDataHoraFim(),
                agendamento.getModalidade(),
                agendamento.getStatus(),
                agendamento.getPreco(),
                agendamento.getValorPago(),
                agendamento.getValorEstornado(),
                agendamento.getDataConfirmacao(),
                agendamento.getDataCancelamento(),
                agendamento.getMotivoCancelamento(),
                agendamento.getCriadoEm()
        );
    }
}
