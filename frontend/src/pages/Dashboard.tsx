import React, { useEffect, useState } from 'react';
import {
  Users,
  CalendarCheck,
  DoorOpen,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Agendamento, RegistroCatraca, Sala, BalancoMensal } from '../types';

export const Dashboard: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [catracaEventos, setCatracaEventos] = useState<RegistroCatraca[]>([]);
  const [balancoMensal, setBalancoMensal] = useState<BalancoMensal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const ano = now.getFullYear();
      const mes = now.getMonth() + 1;

      try {
        const [salasRes, agendamentosRes, catracaRes, balancoRes] = await Promise.allSettled([
          api.get<Sala[]>('/salas/ativas'),
          api.get<{ content: Agendamento[] }>('/agendamentos?size=100&sort=criadoEm,desc'),
          api.get<{ content: RegistroCatraca[] }>('/catraca/historico?size=100&sort=registradoEm,desc'),
          api.get<BalancoMensal>(`/financeiro/balanco-mensal?ano=${ano}&mes=${mes}`),
        ]);

        if (salasRes.status === 'fulfilled') {
          setSalas(salasRes.value.data || []);
        }

        if (agendamentosRes.status === 'fulfilled') {
          setAgendamentos(agendamentosRes.value.data.content || []);
        }

        if (catracaRes.status === 'fulfilled') {
          setCatracaEventos(catracaRes.value.data.content || []);
        }

        if (balancoRes.status === 'fulfilled') {
          setBalancoMensal(balancoRes.value.data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamic Calculations from Real Database Data
  const todayStr = new Date().toDateString();

  // 1. Agendamentos de hoje
  const agendamentosHoje = agendamentos.filter((ag) => {
    return new Date(ag.dataHoraInicio).toDateString() === todayStr;
  });

  // 2. Acessos na catraca hoje
  const acessosHoje = catracaEventos.filter((ev) => {
    return new Date(ev.registradoEm).toDateString() === todayStr;
  });
  const totalAcessosHoje = acessosHoje.length;
  const acessosLiberadosHoje = acessosHoje.filter((ev) => ev.liberado).length;
  const taxaLiberacao = totalAcessosHoje > 0 ? Math.round((acessosLiberadosHoje / totalAcessosHoje) * 100) : 100;

  // 3. Ocupação em tempo real por sala
  const nowTime = new Date().getTime();
  const salasComOcupacao = salas.map((sala) => {
    const agendamentosAtivosNaSala = agendamentos.filter((ag) => {
      if (ag.salaId !== sala.id || ag.status !== 'CONFIRMADO') return false;
      const inicio = new Date(ag.dataHoraInicio).getTime();
      const fim = new Date(ag.dataHoraFim).getTime();
      return nowTime >= inicio && nowTime <= fim;
    });

    const ocupacaoAtual = agendamentosAtivosNaSala.length;
    const capacidade = sala.capacidadeMaxima > 0 ? sala.capacidadeMaxima : 1;
    const percentual = Math.min(100, Math.round((ocupacaoAtual / capacidade) * 100));

    return {
      id: sala.id,
      nome: sala.nome,
      tipo: sala.tipo,
      capacidade: sala.capacidadeMaxima,
      ocupacao: ocupacaoAtual,
      percentual,
    };
  });

  // 4. Capacidade global
  const totalCapacidadeGlobal = salas.reduce((acc, s) => acc + s.capacidadeMaxima, 0);
  const totalOcupacaoGlobal = salasComOcupacao.reduce((acc, s) => acc + s.ocupacao, 0);
  const taxaOcupacaoGeral = totalCapacidadeGlobal > 0 ? Math.round((totalOcupacaoGlobal / totalCapacidadeGlobal) * 100) : 0;

  // 5. Receita do mês atual
  const receitaMes = balancoMensal?.totalReceitas || 0;

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Corporate Key Metrics Row (100% Dynamic) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa de Ocupação
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{taxaOcupacaoGeral}%</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {totalOcupacaoGlobal} de {totalCapacidadeGlobal} vagas ocupadas agora
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Agendamentos Hoje
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CalendarCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {agendamentosHoje.length} {agendamentosHoje.length === 1 ? 'Aula' : 'Aulas'}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {agendamentos.length} agendamentos registrados no total
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Acessos na Catraca
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <DoorOpen className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalAcessosHoje} {totalAcessosHoje === 1 ? 'Acesso' : 'Acessos'}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> {taxaLiberacao}% liberados hoje
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receita do Mês (DRE)
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            R$ {receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Saldo: R$ {(balancoMensal?.saldoLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Real Rooms Grid */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-blue-600" />
            Ocupação das Salas Ativas
          </h2>
          <span className="text-xs font-medium text-slate-400">Dados em tempo real do banco</span>
        </div>

        {salasComOcupacao.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Nenhuma sala ativa cadastrada no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {salasComOcupacao.map((sala) => (
              <div
                key={sala.id}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{sala.nome}</h3>
                  <span className="text-xs font-bold text-slate-700">{sala.percentual}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sala.ocupacao} de {sala.capacidade} alunos
                </p>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${sala.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Data Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Últimos Agendamentos</h3>
              <p className="text-xs text-slate-500">Registros em tempo real</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Sala / Modalidade</th>
                  <th className="px-5 py-3">Valor</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agendamentos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                      Nenhum agendamento cadastrado no banco de dados.
                    </td>
                  </tr>
                )}
                {agendamentos.slice(0, 5).map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {ag.clienteNome}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {ag.salaNome} • <span className="font-medium text-slate-700">{ag.modalidade}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      R$ {ag.preco?.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">{getStatusBadge(ag.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Catraca Access Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Eventos Recentes da Catraca</h3>
              <p className="text-xs text-slate-500">Histórico de validação em tempo real</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">CPF</th>
                  <th className="px-5 py-3 text-right">Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catracaEventos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-slate-400">
                      Nenhum evento registrado no banco de dados.
                    </td>
                  </tr>
                )}
                {catracaEventos.slice(0, 5).map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{ev.clienteNome}</p>
                      {ev.motivoNegacao && (
                        <p className="text-[11px] text-rose-600 mt-0.5">{ev.motivoNegacao}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {ev.cpfMascarado || '***.***.***-**'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
