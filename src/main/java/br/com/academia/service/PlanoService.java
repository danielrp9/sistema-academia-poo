package br.com.academia.service;

import br.com.academia.domain.entity.Plano;
import br.com.academia.domain.entity.Sala;
import br.com.academia.domain.enums.ModalidadeAgendamento;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.repository.PlanoRepository;
import br.com.academia.domain.repository.SalaRepository;
import br.com.academia.web.dto.PlanoRequestDTO;
import br.com.academia.web.dto.PlanoResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanoService {

    private final PlanoRepository planoRepository;
    private final SalaRepository salaRepository;

    @Transactional
    public PlanoResponseDTO cadastrar(PlanoRequestDTO dto) {
        Sala sala = null;
        if (dto.salaId() != null) {
            sala = salaRepository.findById(dto.salaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", dto.salaId()));
        }

        Plano plano = Plano.builder()
                .nome(dto.nome())
                .modalidade(dto.modalidade())
                .sala(sala)
                .preco(dto.preco())
                .diasValidade(dto.diasValidade())
                .descricao(dto.descricao())
                .ativo(true)
                .build();

        Plano salvo = planoRepository.save(plano);
        return PlanoResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public PlanoResponseDTO atualizar(Long id, PlanoRequestDTO dto) {
        Plano plano = planoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Plano", id));

        Sala sala = null;
        if (dto.salaId() != null) {
            sala = salaRepository.findById(dto.salaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", dto.salaId()));
        }

        plano.setNome(dto.nome());
        plano.setModalidade(dto.modalidade());
        plano.setSala(sala);
        plano.setPreco(dto.preco());
        plano.setDiasValidade(dto.diasValidade());
        plano.setDescricao(dto.descricao());

        Plano atualizado = planoRepository.save(plano);
        return PlanoResponseDTO.fromEntity(atualizado);
    }

    @Transactional
    public void alternarStatus(Long id, boolean ativo) {
        Plano plano = planoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Plano", id));
        plano.setAtivo(ativo);
        planoRepository.save(plano);
    }

    @Transactional(readOnly = true)
    public PlanoResponseDTO buscarPorId(Long id) {
        return planoRepository.findById(id)
                .map(PlanoResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Plano", id));
    }

    @Transactional(readOnly = true)
    public List<PlanoResponseDTO> listarAtivos() {
        return planoRepository.findByAtivoTrue()
                .stream()
                .map(PlanoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanoResponseDTO> listarPorModalidade(ModalidadeAgendamento modalidade) {
        return planoRepository.findByModalidadeAndAtivoTrue(modalidade)
                .stream()
                .map(PlanoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PlanoResponseDTO> listarPaginado(Pageable pageable) {
        return planoRepository.findAll(pageable)
                .map(PlanoResponseDTO::fromEntity);
    }
}
