package br.com.academia.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_registros_catraca")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "cliente")
@EqualsAndHashCode(of = "id")
public class RegistroCatraca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @Column(name = "data_hora_entrada")
    private LocalDateTime dataHoraEntrada;

    @Column(name = "data_hora_saida")
    private LocalDateTime dataHoraSaida;

    @Column(nullable = false)
    private Boolean liberado;

    @Column(name = "motivo_negacao", length = 255)
    private String motivoNegacao;

    @Column(name = "registrado_em", nullable = false, updatable = false)
    private LocalDateTime registradoEm;

    @PrePersist
    public void prePersist() {
        if (this.registradoEm == null) {
            this.registradoEm = LocalDateTime.now();
        }
    }

    public static RegistroCatraca liberado(Usuario cliente, LocalDateTime dataHoraEntrada) {
        return RegistroCatraca.builder()
                .cliente(cliente)
                .dataHoraEntrada(dataHoraEntrada != null ? dataHoraEntrada : LocalDateTime.now())
                .liberado(true)
                .build();
    }

    public static RegistroCatraca negado(Usuario cliente, String motivoNegacao) {
        return RegistroCatraca.builder()
                .cliente(cliente)
                .liberado(false)
                .motivoNegacao(motivoNegacao)
                .build();
    }

    public void registrarSaida(LocalDateTime saida) {
        this.dataHoraSaida = saida != null ? saida : LocalDateTime.now();
    }
}
