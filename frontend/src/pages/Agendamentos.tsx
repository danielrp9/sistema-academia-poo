import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  CreditCard,
  Ban,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Agendamento, Sala, Usuario, ModalidadeAgendamento, StatusAgendamento, Plano } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Agendamentos: React.FC = () => {
  const { hasRole } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroSalaId, setFiltroSalaId] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [buscaCliente, setBuscaCliente] = useState<string>('');

  // Modal states
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [confirmarModalOpen, setConfirmarModalOpen] = useState(false);
  const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // Form states - Novo Agendamento
  const [clienteId, setClienteId] = useState<string>('');
  const [salaId, setSalaId] = useState<string>('');
  const [modalidade, setModalidade] = useState<ModalidadeAgendamento>('DIARIA');
  const [dataHoraInicio, setDataHoraInicio] = useState<string>('');
  const [dataHoraFim, setDataHoraFim] = useState<string>('');
  const [preco, setPreco] = useState<number>(0);

  // Form states - Confirmação
  const [metodoPagamento, setMetodoPagamento] = useState<string>('PIX');
  const [valorPago, setValorPago] = useState<number>(0);

  // Form states - Cancelamento
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rotinaMensagem, setRotinaMensagem] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agRes, salasRes, usuariosRes, planosRes] = await Promise.all([
        api.get<{ content: Agendamento[] }>('/agendamentos?size=100&sort=dataHoraInicio,desc'),
        api.get<Sala[]>('/salas/ativas'),
        api.get<{ content: Usuario[] }>('/usuarios?size=100'),
        api.get<Plano[]>('/planos/ativos'),
      ]);
      setAgendamentos(agRes.data.content || []);
      setSalas(salasRes.data || []);
      setUsuarios(usuariosRes.data.content || []);
      setPlanos(planosRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados de agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCriarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        clienteId: Number(clienteId),
        salaId: Number(salaId),
        modalidade,
        dataHoraInicio,
        dataHoraFim,
        preco: Number(preco),
      };

      await api.post('/agendamentos', payload);
      setNovoModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao criar agendamento. Verifique se há conflito de horário.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgendamento) return;
    setFormError(null);
    setSaving(true);

    try {
      await api.patch(`/agendamentos/${selectedAgendamento.id}/confirmar`, {
        metodoPagamento,
        valorPago: Number(valorPago),
      });
      setConfirmarModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao confirmar pagamento do agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgendamento) return;
    setFormError(null);
    setSaving(true);

    try {
      await api.patch(`/agendamentos/${selectedAgendamento.id}/cancelar`, {
        motivo: motivoCancelamento,
      });
      setCancelarModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao cancelar agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecutarRotinaExpirados = async () => {
    try {
      const res = await api.post<string>('/agendamentos/rotina-expirados');
      setRotinaMensagem(res.data);
      fetchData();
      setTimeout(() => setRotinaMensagem(null), 5000);
    } catch (err) {
      console.error('Erro ao executar rotina de expirados:', err);
    }
  };

  const filteredAgendamentos = agendamentos.filter((item) => {
    if (filtroSalaId && String(item.salaId) !== filtroSalaId) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    if (buscaCliente && !item.clienteNome.toLowerCase().includes(buscaCliente.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: StatusAgendamento) => {
    switch (status) {
      case 'CONFIRMADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Confirmado
          </span>
        );
      case 'PRELIMINAR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Preliminar
          </span>
        );
      case 'CANCELADO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Cancelado
          </span>
        );
    }
  };

  const atualizarPrecoSugerido = (selectedSalaId: string, selectedModalidade: ModalidadeAgendamento) => {
    const matchingPlano = planos.find(
      (p) => (p.salaId === Number(selectedSalaId) || !p.salaId) && p.modalidade === selectedModalidade
    );
    if (matchingPlano) {
      setPreco(matchingPlano.preco);
    }
  };

  const isStaff = hasRole(['ADMIN', 'COLABORADOR']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Agendamentos
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Controle de reservas e pagamentos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isStaff && (
            <button
              onClick={handleExecutarRotinaExpirados}
              title="Cancela agendamentos preliminares não pagos no prazo de 5 dias úteis"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              Rotina de Expirados
            </button>
          )}

          <button
            onClick={() => {
              const firstUser = usuarios[0];
              const firstSala = salas[0];
              const firstMod: ModalidadeAgendamento = 'DIARIA';
              setClienteId(firstUser ? String(firstUser.id) : '');
              setSalaId(firstSala ? String(firstSala.id) : '');
              setModalidade(firstMod);
              const now = new Date();
              now.setMinutes(0);
              now.setSeconds(0);
              const end = new Date(now.getTime() + 60 * 60 * 1000);
              setDataHoraInicio(now.toISOString().slice(0, 16));
              setDataHoraFim(end.toISOString().slice(0, 16));

              const matchingPlano = planos.find(
                (p) => (p.salaId === firstSala?.id || !p.salaId) && p.modalidade === firstMod
              );
              setPreco(matchingPlano ? matchingPlano.preco : 0);
              setFormError(null);
              setNovoModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {rotinaMensagem && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{rotinaMensagem}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={buscaCliente}
            onChange={(e) => setBuscaCliente(e.target.value)}
            placeholder="Filtrar por nome do cliente..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[160px]">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filtroSalaId}
            onChange={(e) => setFiltroSalaId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none"
          >
            <option value="">Todas as Salas</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none"
          >
            <option value="">Todos os Status</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="PRELIMINAR">Preliminar</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Espaço / Sala</th>
                  <th className="px-5 py-3.5">Modalidade</th>
                  <th className="px-5 py-3.5">Período</th>
                  <th className="px-5 py-3.5">Valor (R$)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgendamentos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                      Nenhum agendamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
                {filteredAgendamentos.map((ag) => {
                  const inicio = new Date(ag.dataHoraInicio).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const fim = new Date(ag.dataHoraFim).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={ag.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400 font-medium">
                        #{ag.id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {ag.clienteNome}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{ag.salaNome}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {ag.modalidade}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {inicio} às {fim}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        R$ {ag.preco?.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(ag.status)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ag.status === 'PRELIMINAR' && isStaff && (
                            <button
                              onClick={() => {
                                setSelectedAgendamento(ag);
                                setValorPago(ag.preco);
                                setMetodoPagamento('PIX');
                                setFormError(null);
                                setConfirmarModalOpen(true);
                              }}
                              title="Confirmar Pagamento"
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Pagar
                            </button>
                          )}

                          {ag.status !== 'CANCELADO' && isStaff && (
                            <button
                              onClick={() => {
                                setSelectedAgendamento(ag);
                                setMotivoCancelamento('');
                                setFormError(null);
                                setCancelarModalOpen(true);
                              }}
                              title="Cancelar Agendamento"
                              className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Novo Agendamento */}
      {novoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Novo Agendamento</h2>
              <button
                onClick={() => setNovoModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCriarAgendamento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente
                </label>
                <select
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Selecione um cliente...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sala / Espaço
                  </label>
                  <select
                    required
                    value={salaId}
                    onChange={(e) => {
                      const newSalaId = e.target.value;
                      setSalaId(newSalaId);
                      atualizarPrecoSugerido(newSalaId, modalidade);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {salas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} (Cap: {s.capacidadeMaxima})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Modalidade
                  </label>
                  <select
                    value={modalidade}
                    onChange={(e) => {
                      const newMod = e.target.value as ModalidadeAgendamento;
                      setModalidade(newMod);
                      atualizarPrecoSugerido(salaId, newMod);
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="DIARIA">Diária Avulsa</option>
                    <option value="MENSALIDADE">Mensalidade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dataHoraInicio}
                    onChange={(e) => setDataHoraInicio(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Término
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dataHoraFim}
                    onChange={(e) => setDataHoraFim(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Preço Base (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={preco}
                  onChange={(e) => setPreco(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setNovoModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Preliminar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Pagamento */}
      {confirmarModalOpen && selectedAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Confirmar Pagamento</h2>
              <button
                onClick={() => setConfirmarModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p>
                <strong>Cliente:</strong> {selectedAgendamento.clienteNome}
              </p>
              <p>
                <strong>Sala:</strong> {selectedAgendamento.salaNome}
              </p>
              <p>
                <strong>Valor do Agendamento:</strong> R$ {selectedAgendamento.preco?.toFixed(2)}
              </p>
            </div>

            <form onSubmit={handleConfirmarPagamento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={valorPago}
                  onChange={(e) => setValorPago(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmarModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Processando...' : 'Confirmar e Liberar Catraca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancelamento com Estorno */}
      {cancelarModalOpen && selectedAgendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Cancelar Agendamento</h2>
              <button
                onClick={() => setCancelarModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 mb-3">
              O cancelamento aplicará as regras de negócio de estorno financeiro de acordo com a antecedência do cancelamento.
            </p>

            <form onSubmit={handleCancelarAgendamento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo do Cancelamento
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Informe a justificativa do cancelamento..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelarModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {saving ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
