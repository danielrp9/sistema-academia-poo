package br.com.academia.service;

import br.com.academia.domain.entity.Sala;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.exception.RegraDeNegocioException;
import br.com.academia.domain.repository.SalaRepository;
import br.com.academia.web.dto.SalaRequestDTO;
import br.com.academia.web.dto.SalaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaService {

    private final SalaRepository salaRepository;

    @Transactional
    public SalaResponseDTO cadastrar(SalaRequestDTO dto) {
        if (salaRepository.existsByNomeIgnoreCase(dto.nome())) {
            throw new RegraDeNegocioException(String.format("Já existe uma sala cadastrada com o nome '%s'.", dto.nome()));
        }

        Sala sala = Sala.builder()
                .nome(dto.nome())
                .tipo(dto.tipo())
                .capacidadeMaxima(dto.capacidadeMaxima())
                .descricao(dto.descricao())
                .ativa(true)
                .build();

        Sala salva = salaRepository.save(sala);
        return SalaResponseDTO.fromEntity(salva);
    }

    @Transactional
    public SalaResponseDTO atualizar(Long id, SalaRequestDTO dto) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", id));

        sala.setNome(dto.nome());
        sala.setTipo(dto.tipo());
        sala.setCapacidadeMaxima(dto.capacidadeMaxima());
        sala.setDescricao(dto.descricao());

        Sala atualizada = salaRepository.save(sala);
        return SalaResponseDTO.fromEntity(atualizada);
    }

    @Transactional
    public void alternarStatus(Long id, boolean ativo) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", id));
        sala.setAtiva(ativo);
        salaRepository.save(sala);
    }

    @Transactional(readOnly = true)
    public SalaResponseDTO buscarPorId(Long id) {
        return salaRepository.findById(id)
                .map(SalaResponseDTO::fromEntity)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Sala", id));
    }

    @Transactional(readOnly = true)
    public List<SalaResponseDTO> listarAtivas() {
        return salaRepository.findByAtivaTrue()
                .stream()
                .map(SalaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<SalaResponseDTO> listarPaginado(Pageable pageable) {
        return salaRepository.findAll(pageable)
                .map(SalaResponseDTO::fromEntity);
    }
}
