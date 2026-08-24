package br.com.academia.domain.repository;

import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.enums.CategoriaTransacao;
import br.com.academia.domain.enums.TipoTransacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransacaoFinanceiraRepository extends JpaRepository<TransacaoFinanceira, Long> {

    List<TransacaoFinanceira> findByDataTransacaoBetweenOrderByDataTransacaoDesc(LocalDateTime inicio, LocalDateTime fim);

    Page<TransacaoFinanceira> findByDataTransacaoBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    List<TransacaoFinanceira> findByTipoAndDataTransacaoBetween(TipoTransacao tipo, LocalDateTime inicio, LocalDateTime fim);

    List<TransacaoFinanceira> findByCategoriaAndDataTransacaoBetween(CategoriaTransacao categoria, LocalDateTime inicio, LocalDateTime fim);

    Optional<TransacaoFinanceira> findByAgendamentoId(Long agendamentoId);

    @Query("""
        SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoFinanceira t
        WHERE t.tipo = br.com.academia.domain.enums.TipoTransacao.RECEITA
          AND t.dataTransacao BETWEEN :inicio AND :fim
    """)
    BigDecimal somarReceitasNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("""
        SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoFinanceira t
        WHERE t.tipo = br.com.academia.domain.enums.TipoTransacao.DESPESA
          AND t.dataTransacao BETWEEN :inicio AND :fim
    """)
    BigDecimal somarDespesasNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
