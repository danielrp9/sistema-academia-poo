package br.com.academia.domain.repository;

import br.com.academia.domain.entity.Produto;
import br.com.academia.domain.enums.CategoriaProduto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByAtivoTrue();

    Page<Produto> findByAtivoTrue(Pageable pageable);

    List<Produto> findByCategoriaAndAtivoTrue(CategoriaProduto categoria);

    Page<Produto> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome, Pageable pageable);

    List<Produto> findByQuantidadeEstoqueLessThanEqualAndAtivoTrue(Integer estoqueMinimo);
}
