package br.com.academia.domain.entity;

import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.enums.StatusAgendamento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_agendamentos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"cliente", "sala", "instrutor"})
@EqualsAndHashCode(of = "id")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrutor_id")
    private Usuario instrutor;

    @Column(name = "data_hora_inicio", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "data_hora_fim", nullable = false)
    private LocalDateTime dataHoraFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ModalidadeAgendamento modalidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusAgendamento status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "valor_pago", precision = 10, scale = 2)
    private BigDecimal valorPago;

    @Column(name = "valor_estornado", precision = 10, scale = 2)
    private BigDecimal valorEstornado;

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento", length = 255)
    private String motivoCancelamento;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (this.criadoEm == null) {
            this.criadoEm = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusAgendamento.PRELIMINAR;
        }
        if (this.valorEstornado == null) {
            this.valorEstornado = BigDecimal.ZERO;
        }
    }

    // Métodos ricos de Domínio

    public void confirmar(BigDecimal valorCobrado) {
        if (this.status == StatusAgendamento.CANCELADO) {
            throw new IllegalStateException("Não é possível confirmar um agendamento cancelado.");
        }
        this.status = StatusAgendamento.CONFIRMADO;
        this.valorPago = valorCobrado;
        this.dataConfirmacao = LocalDateTime.now();
    }

    public void cancelar(BigDecimal valorReembolso, String motivo) {
        if (this.status == StatusAgendamento.CANCELADO) {
            throw new IllegalStateException("O agendamento já se encontra cancelado.");
        }
        this.status = StatusAgendamento.CANCELADO;
        this.valorEstornado = valorReembolso != null ? valorReembolso : BigDecimal.ZERO;
        this.motivoCancelamento = motivo;
        this.dataCancelamento = LocalDateTime.now();
    }

    public boolean isPreliminar() {
        return StatusAgendamento.PRELIMINAR.equals(this.status);
    }

    public boolean isConfirmado() {
        return StatusAgendamento.CONFIRMADO.equals(this.status);
    }

    public boolean isCancelado() {
        return StatusAgendamento.CANCELADO.equals(this.status);
    }

    public boolean isAtivoNoMomento(LocalDateTime momento) {
        if (!isConfirmado()) {
            return false;
        }
        return !momento.isBefore(this.dataHoraInicio) && !momento.isAfter(this.dataHoraFim);
    }
}
