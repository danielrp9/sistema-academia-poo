package br.com.academia.service;

import br.com.academia.domain.entity.RegistroCatraca;
import br.com.academia.domain.entity.Usuario;
import br.com.academia.domain.enums.TipoEventoCatraca;
import br.com.academia.domain.exception.AcessoCatracaNegadoException;
import br.com.academia.domain.exception.RecursoNaoEncontradoException;
import br.com.academia.domain.exception.RegraDeNegocioException;
import br.com.academia.domain.repository.AgendamentoRepository;
import br.com.academia.domain.repository.RegistroCatracaRepository;
import br.com.academia.domain.repository.UsuarioRepository;
import br.com.academia.web.dto.EventoCatracaRequestDTO;
import br.com.academia.web.dto.RegistroCatracaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CatracaService {

    private final RegistroCatracaRepository registroCatracaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    @Transactional
    public RegistroCatracaResponseDTO processarEvento(EventoCatracaRequestDTO dto) {
        Usuario cliente = localizarCliente(dto);
        LocalDateTime instante = dto.obterTimestamp();

        if (TipoEventoCatraca.ENTRADA.equals(dto.tipoEvento())) {
            return processarEntrada(cliente, instante);
        } else {
            return processarSaida(cliente, instante);
        }
    }

    private RegistroCatracaResponseDTO processarEntrada(Usuario cliente, LocalDateTime instante) {
        if (!cliente.isEnabled()) {
            RegistroCatraca negado = RegistroCatraca.negado(cliente, "Cliente inativo no sistema.");
            registroCatracaRepository.save(negado);
            throw new AcessoCatracaNegadoException("Acesso bloqueado: O cadastro do cliente está inativo.");
        }

        boolean possuiAgendamentoAtivo = agendamentoRepository.possuiAgendamentoAtivoNoInstante(cliente.getId(), instante);

        if (!possuiAgendamentoAtivo) {
            String motivo = "Acesso negado: Nenhuma diária ou mensalidade confirmada e ativa para este horário.";
            RegistroCatraca negado = RegistroCatraca.negado(cliente, motivo);
            registroCatracaRepository.save(negado);
            throw new AcessoCatracaNegadoException(motivo);
        }

        RegistroCatraca liberado = RegistroCatraca.liberado(cliente, instante);
        RegistroCatraca salvo = registroCatracaRepository.save(liberado);
        return RegistroCatracaResponseDTO.fromEntity(salvo);
    }

    private RegistroCatracaResponseDTO processarSaida(Usuario cliente, LocalDateTime instante) {
        RegistroCatraca registro = registroCatracaRepository
                .findFirstByClienteIdAndDataHoraSaidaIsNullOrderByDataHoraEntradaDesc(cliente.getId())
                .orElseGet(() -> RegistroCatraca.builder()
                        .cliente(cliente)
                        .dataHoraEntrada(instante.minusHours(1))
                        .liberado(true)
                        .build());

        registro.registrarSaida(instante);
        RegistroCatraca salvo = registroCatracaRepository.save(registro);
        return RegistroCatracaResponseDTO.fromEntity(salvo);
    }

    @Transactional(readOnly = true)
    public Page<RegistroCatracaResponseDTO> listarHistorico(Pageable pageable) {
        return registroCatracaRepository.findAll(pageable)
                .map(RegistroCatracaResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<RegistroCatracaResponseDTO> listarHistoricoPorCliente(Long clienteId, Pageable pageable) {
        return registroCatracaRepository.findByClienteIdOrderByRegistradoEmDesc(clienteId, pageable)
                .map(RegistroCatracaResponseDTO::fromEntity);
    }

    private Usuario localizarCliente(EventoCatracaRequestDTO dto) {
        if (dto.clienteId() != null) {
            return usuarioRepository.findById(dto.clienteId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente", dto.clienteId()));
        }
        if (dto.cpfCliente() != null && !dto.cpfCliente().isBlank()) {
            return usuarioRepository.findByCpf(dto.cpfCliente())
                    .orElseThrow(() -> new RegraDeNegocioException("Nenhum cliente cadastrado com o CPF informado: " + dto.cpfCliente()));
        }
        throw new RegraDeNegocioException("É necessário informar o ID ou o CPF do cliente para o evento de catraca.");
    }
}
