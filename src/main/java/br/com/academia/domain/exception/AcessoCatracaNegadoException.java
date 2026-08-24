package br.com.academia.domain.exception;

public class AcessoCatracaNegadoException extends RuntimeException {

    public AcessoCatracaNegadoException(String mensagem) {
        super(mensagem);
    }
}
