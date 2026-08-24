package br.com.academia.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelamentoAgendamentoDTO(
        @NotBlank(message = "O motivo do cancelamento é obrigatório.")
        @Size(max = 255, message = "O motivo do cancelamento deve ter no máximo 255 caracteres.")
        String motivo
) {}
