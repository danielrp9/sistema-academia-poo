package br.com.academia.web.dto;

import br.com.academia.domain.enums.TipoEventoCatraca;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record EventoCatracaRequestDTO(
        Long clienteId,
        String cpfCliente,

        @NotNull(message = "O tipo de evento é obrigatório (ENTRADA ou SAIDA).")
        TipoEventoCatraca tipoEvento,

        LocalDateTime timestamp
) {
    public LocalDateTime obterTimestamp() {
        return timestamp != null ? timestamp : LocalDateTime.now();
    }
}
