package br.com.academia.service;

import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.repository.TransacaoFinanceiraRepository;
import br.com.academia.service.factory.TransacaoFactory;
import br.com.academia.web.dto.BalancoMensalResponseDTO;
import br.com.academia.web.dto.TransacaoRequestDTO;
import br.com.academia.web.dto.TransacaoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final TransacaoFinanceiraRepository transacaoFinanceiraRepository;

    @Transactional
    public TransacaoResponseDTO lancarDespesaOperacional(TransacaoRequestDTO dto, Usuario usuarioResponsavel) {
        TransacaoFinanceira despesa = TransacaoFactory.criarDespesaOperacional(
                dto.categoria(),
                dto.valor(),
                dto.descricao(),
                usuarioResponsavel
        );

        TransacaoFinanceira salva = transacaoFinanceiraRepository.save(despesa);
        return TransacaoResponseDTO.fromEntity(salva);
    }

    @Transactional(readOnly = true)
    public BalancoMensalResponseDTO gerarBalancoMensal(int ano, int mes) {
        YearMonth ym = YearMonth.of(ano, mes);
        LocalDateTime inicio = ym.atDay(1).atStartOfDay();
        LocalDateTime fim = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        BigDecimal totalReceitas = transacaoFinanceiraRepository.somarReceitasNoPeriodo(inicio, fim);
        BigDecimal totalDespesas = transacaoFinanceiraRepository.somarDespesasNoPeriodo(inicio, fim);
        BigDecimal saldoLiquido = totalReceitas.subtract(totalDespesas);

        List<TransacaoResponseDTO> transacoes = transacaoFinanceiraRepository
                .findByDataTransacaoBetweenOrderByDataTransacaoDesc(inicio, fim)
                .stream()
                .map(TransacaoResponseDTO::fromEntity)
                .toList();

        return new BalancoMensalResponseDTO(
                ano,
                mes,
                totalReceitas,
                totalDespesas,
                saldoLiquido,
                transacoes
        );
    }

    @Transactional(readOnly = true)
    public Page<TransacaoResponseDTO> listarTransacoesPorPeriodo(LocalDateTime inicio, LocalDateTime fim, Pageable pageable) {
        return transacaoFinanceiraRepository.findByDataTransacaoBetween(inicio, fim, pageable)
                .map(TransacaoResponseDTO::fromEntity);
    }
}
