package br.com.academia.domain.exception;

public class ConflitoHorarioException extends RuntimeException {

    public ConflitoHorarioException(String mensagem) {
        super(mensagem);
    }
}
