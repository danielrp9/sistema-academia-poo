import React, { useEffect, useState } from 'react';
import {
  DoorClosed,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRightLeft,
  Filter,
  AlertCircle,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { RegistroCatraca, Usuario } from '../types';

export const Catraca: React.FC = () => {
  const [eventos, setEventos] = useState<RegistroCatraca[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Simulator form
  const [simClienteId, setSimClienteId] = useState<string>('');
  const [simTipoEvento, setSimTipoEvento] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [simulando, setSimulando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<RegistroCatraca | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [historicoRes, usuariosRes] = await Promise.all([
        api.get<{ content: RegistroCatraca[] }>('/catraca/historico?size=100&sort=registradoEm,desc'),
        api.get<{ content: Usuario[] }>('/usuarios?size=100'),
      ]);
      setEventos(historicoRes.data.content || []);
      setUsuarios(usuariosRes.data.content || []);
      if (!simClienteId && usuariosRes.data.content?.length > 0) {
        setSimClienteId(String(usuariosRes.data.content[0].id));
      }
    } catch (err) {
      console.error('Erro ao carregar dados da catraca:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const handleSimularAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimError(null);
    setUltimoResultado(null);
    setSimulando(true);

    try {
      const payload = {
        clienteId: Number(simClienteId),
        tipoEvento: simTipoEvento,
      };

      const response = await api.post<RegistroCatraca>('/catraca/evento', payload);
      setUltimoResultado(response.data);
      fetchDados();
    } catch (err: any) {
      if (err.response?.data) {
        setUltimoResultado({
          id: 0,
          clienteId: Number(simClienteId),
          clienteNome: usuarios.find((u) => u.id === Number(simClienteId))?.nome || 'Cliente',
          liberado: false,
          motivoNegacao: err.response.data.detail || 'Acesso negado: Sem agendamento confirmado ativo.',
          registradoEm: new Date().toISOString(),
        });
      } else {
        setSimError('Erro de comunicação com o servidor da catraca.');
      }
    } finally {
      setSimulando(false);
    }
  };

  const filteredEventos = eventos.filter((ev) => {
    if (filtroStatus === 'LIBERADO' && !ev.liberado) return false;
    if (filtroStatus === 'NEGADO' && ev.liberado) return false;
    if (busca) {
      const matchNome = ev.clienteNome.toLowerCase().includes(busca.toLowerCase());
      const matchCpf = ev.cpfMascarado?.includes(busca);
      if (!matchNome && !matchCpf) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Catraca
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Validação de acessos em tempo real.
        </p>
      </div>

      {/* Simulator Card (Clean Google Workspace Style) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <DoorClosed className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Simulador de Passagem na Catraca (Webhook Hardware)
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">Endpoint: POST /api/catraca/evento</span>
        </div>

        {simError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{simError}</span>
          </div>
        )}

        <form onSubmit={handleSimularAcesso} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Aluno / Cliente
            </label>
            <select
              value={simClienteId}
              onChange={(e) => setSimClienteId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Direção do Evento
            </label>
            <select
              value={simTipoEvento}
              onChange={(e) => setSimTipoEvento(e.target.value as 'ENTRADA' | 'SAIDA')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="ENTRADA">ENTRADA (Acesso à Academia)</option>
              <option value="SAIDA">SAÍDA (Registro de Saída)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={simulando}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {simulando ? 'Processando...' : 'Registrar Passagem'}
            </button>
          </div>
        </form>

        {/* Live Feedback Result */}
        {ultimoResultado && (
          <div
            className={`mt-4 rounded-xl border p-4 text-xs ${
              ultimoResultado.liberado
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {ultimoResultado.liberado ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>ACESSO LIBERADO — Catraca Destravada</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>ACESSO BLOQUEADO — Catraca Travada</span>
                </>
              )}
            </div>
            <p className="mt-1 font-medium">
              Cliente: {ultimoResultado.clienteNome}{' '}
              {ultimoResultado.motivoNegacao && `• Motivo: ${ultimoResultado.motivoNegacao}`}
            </p>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[160px]">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none"
          >
            <option value="">Todos os Eventos</option>
            <option value="LIBERADO">Apenas Liberados</option>
            <option value="NEGADO">Apenas Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Access Event History Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">Histórico de Passagens</h3>
          <p className="text-xs text-slate-500">Registro cronológico de entradas e saídas validadas</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Data / Hora</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">CPF</th>
                  <th className="px-5 py-3.5">Tipo Evento</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Observação / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEventos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Nenhum registro de catraca encontrado.
                    </td>
                  </tr>
                )}
                {filteredEventos.map((ev) => {
                  const dataFormatada = new Date(ev.registradoEm).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600 font-mono">{dataFormatada}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{ev.clienteNome}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">
                        {ev.cpfMascarado || '***.***.***-**'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <ArrowRightLeft className="h-3 w-3 text-slate-500" />
                          {ev.dataHoraEntrada ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {ev.liberado ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Liberado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3" /> Negado
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {ev.motivoNegacao ? (
                          <span className="text-rose-600 font-medium">{ev.motivoNegacao}</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Acesso validado com sucesso</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
