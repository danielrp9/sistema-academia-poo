package br.com.academia.web.dto;

import br.com.academia.domain.entity.RegistroCatraca;

import java.time.LocalDateTime;

public record RegistroCatracaResponseDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        String cpfMascarado,
        LocalDateTime dataHoraEntrada,
        LocalDateTime dataHoraSaida,
        Boolean liberado,
        String motivoNegacao,
        LocalDateTime registradoEm
) {
    public static RegistroCatracaResponseDTO fromEntity(RegistroCatraca registro) {
        return new RegistroCatracaResponseDTO(
                registro.getId(),
                registro.getCliente() != null ? registro.getCliente().getId() : null,
                registro.getCliente() != null ? registro.getCliente().getNome() : null,
                registro.getCliente() != null ? registro.getCliente().getCpfMascarado() : null,
                registro.getDataHoraEntrada(),
                registro.getDataHoraSaida(),
                registro.getLiberado(),
                registro.getMotivoNegacao(),
                registro.getRegistradoEm()
        );
    }
}
