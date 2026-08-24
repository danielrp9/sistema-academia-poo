package br.com.academia.service;

import br.com.academia.domain.entity.Produto;
import br.com.academia.domain.entity.TransacaoFinanceira;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.exception.RegraDeNegocioException;
import br.com.academia.domain.repository.ProdutoRepository;
import br.com.academia.domain.repository.TransacaoFinanceiraRepository;
import br.com.academia.service.factory.TransacaoFactory;
import br.com.academia.web.dto.ProdutoRequestDTO;
import br.com.academia.web.dto.ProdutoResponseDTO;
import br.com.academia.web.dto.TransacaoResponseDTO;
import br.com.academia.web.dto.VendaProdutoRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final TransacaoFinanceiraRepository transacaoFinanceiraRepository;

    @Transactional
    public ProdutoResponseDTO cadastrarProduto(ProdutoRequestDTO dto) {
        Produto produto = Produto.builder()
                .nome(dto.nome())
                .categoria(dto.categoria())
                .preco(dto.preco())
                .quantidadeEstoque(dto.quantidadeEstoque())
                .ativo(true)
                .build();

        Produto salvo = produtoRepository.save(produto);
        return ProdutoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));

        produto.setNome(dto.nome());
        produto.setCategoria(dto.categoria());
        produto.setPreco(dto.preco());
        produto.setQuantidadeEstoque(dto.quantidadeEstoque());

        Produto atualizado = produtoRepository.save(produto);
        return ProdutoResponseDTO.fromEntity(atualizado);
    }

    @Transactional
    public TransacaoResponseDTO venderProduto(VendaProdutoRequestDTO dto, Usuario usuarioResponsavel) {
        Produto produto = produtoRepository.findById(dto.produtoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", dto.produtoId()));

        if (Boolean.FALSE.equals(produto.getAtivo())) {
            throw new RegraDeNegocioException("Não é possível vender um produto inativo no catálogo.");
        }

        try {
            produto.debitarEstoque(dto.quantidade());
        } catch (IllegalStateException | IllegalArgumentException ex) {
            throw new RegraDeNegocioException(ex.getMessage(), ex);
        }

        produtoRepository.save(produto);

        BigDecimal valorTotal = produto.getPreco().multiply(BigDecimal.valueOf(dto.quantidade()));
        TransacaoFinanceira receita = TransacaoFactory.criarReceitaVendaProduto(
                produto,
                dto.quantidade(),
                valorTotal,
                usuarioResponsavel
        );

        TransacaoFinanceira transacaoSalva = transacaoFinanceiraRepository.save(receita);
        return TransacaoResponseDTO.fromEntity(transacaoSalva);
    }

    @Transactional
    public void desativarProduto(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
        produto.desativar();
        produtoRepository.save(produto);
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .map(ProdutoResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }

    @Transactional(readOnly = true)
    public Page<ProdutoResponseDTO> listarAtivos(Pageable pageable) {
        return produtoRepository.findByAtivoTrue(pageable)
                .map(ProdutoResponseDTO::fromEntity);
    }
}
