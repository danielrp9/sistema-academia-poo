package br.com.academia.domain.repository;

import br.com.academia.domain.entity.Plano;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanoRepository extends JpaRepository<Plano, Long> {

    List<Plano> findByAtivoTrue();

    Page<Plano> findByAtivoTrue(Pageable pageable);

    List<Plano> findByModalidadeAndAtivoTrue(ModalidadeAgendamento modalidade);

    List<Plano> findBySalaIdAndAtivoTrue(Long salaId);

    Page<Plano> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}
