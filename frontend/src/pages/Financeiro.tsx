import React, { useEffect, useState } from 'react';
import {
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { BalancoMensal, Transacao } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Financeiro: React.FC = () => {
  const { isAdmin } = useAuth();
  const [balanco, setBalanco] = useState<BalancoMensal | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Month / Year selector
  const today = new Date();
  const [ano, setAno] = useState<number>(today.getFullYear());
  const [mes, setMes] = useState<number>(today.getMonth() + 1);

  // Modal states
  const [despesaModalOpen, setDespesaModalOpen] = useState(false);
  const [categoria, setCategoria] = useState<string>('ADMINISTRATIVO');
  const [valor, setValor] = useState<number>(150.0);
  const [descricao, setDescricao] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const fetchDadosFinanceiros = async () => {
    setLoading(true);
    try {
      const inicio = new Date(ano, mes - 1, 1).toISOString();
      const fim = new Date(ano, mes, 0, 23, 59, 59).toISOString();

      const [balancoRes, transacoesRes] = await Promise.all([
        api.get<BalancoMensal>(`/financeiro/balanco-mensal?ano=${ano}&mes=${mes}`),
        api.get<{ content: Transacao[] }>(`/financeiro/transacoes?inicio=${inicio}&fim=${fim}&size=100`),
      ]);

      setBalanco(balancoRes.data);
      setTransacoes(transacoesRes.data.content || []);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDadosFinanceiros();
  }, [ano, mes]);

  const handleLancarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        categoria,
        valor: Number(valor),
        descricao,
      };

      await api.post('/financeiro/despesas', payload);
      setDespesaModalOpen(false);
      setFeedbackSuccess('Despesa operacional lançada com sucesso no DRE.');
      setTimeout(() => setFeedbackSuccess(null), 4000);
      fetchDadosFinanceiros();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao lançar despesa.');
    } finally {
      setSaving(false);
    }
  };

  const meses = [
    { num: 1, nome: 'Janeiro' },
    { num: 2, nome: 'Fevereiro' },
    { num: 3, nome: 'Março' },
    { num: 4, nome: 'Abril' },
    { num: 5, nome: 'Maio' },
    { num: 6, nome: 'Junho' },
    { num: 7, nome: 'Julho' },
    { num: 8, nome: 'Agosto' },
    { num: 9, nome: 'Setembro' },
    { num: 10, nome: 'Outubro' },
    { num: 11, nome: 'Novembro' },
    { num: 12, nome: 'Dezembro' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Financeiro
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Balanço mensal e lançamentos contábeis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => {
                setCategoria('ADMINISTRATIVO');
                setValor(150.0);
                setDescricao('');
                setFormError(null);
                setDespesaModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Lançar Despesa
            </button>
          )}
        </div>
      </div>

      {feedbackSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Period Selector Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="h-4 w-4 text-slate-400" />
          <span>Período Contábil:</span>
        </div>

        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none"
        >
          {meses.map((m) => (
            <option key={m.num} value={m.num}>
              {m.nome}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Receitas
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            R$ {balanco?.totalReceitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Diárias, mensalidades e produtos</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Despesas
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <ArrowDownRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            R$ {balanco?.totalDespesas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Manutenção, insumos e operações</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Resultado Líquido (DRE)
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CircleDollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold ${
              (balanco?.saldoLiquido || 0) >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            R$ {balanco?.saldoLiquido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-medium">Saldo operacional consolidado</p>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">Extrato de Lançamentos do Período</h3>
          <p className="text-xs text-slate-500">
            Detalhamento contábil de receitas e despesas registradas no mês selecionado
          </p>
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
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Descrição</th>
                  <th className="px-5 py-3.5">Responsável</th>
                  <th className="px-5 py-3.5 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Nenhuma transação contábil encontrada para o mês selecionado.
                    </td>
                  </tr>
                )}
                {transacoes.map((t) => {
                  const dataFormatada = new Date(t.dataTransacao).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600 font-mono">{dataFormatada}</td>
                      <td className="px-5 py-3.5">
                        {t.tipo === 'RECEITA' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <TrendingUp className="h-3 w-3" /> Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                            <TrendingDown className="h-3 w-3" /> Despesa
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {t.categoria}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">{t.descricao}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {t.usuarioResponsavelNome || 'Sistema'}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-semibold ${
                          t.tipo === 'RECEITA' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.tipo === 'RECEITA' ? '+ ' : '- '}
                        R$ {t.valor?.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Lançar Nova Despesa */}
      {despesaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Lançar Despesa Operacional</h2>
              <button
                onClick={() => setDespesaModalOpen(false)}
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

            <form onSubmit={handleLancarDespesa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria Contábil
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="LIMPEZA">Limpeza e Higienização</option>
                  <option value="MANUTENCAO">Manutenção de Equipamentos</option>
                  <option value="INSTRUTOR">Pagamento de Instrutor</option>
                  <option value="INSUMOS">Insumos e Suprimentos</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Valor da Despesa (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição / Justificativa
                </label>
                <textarea
                  rows={3}
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Compra de materiais de limpeza para os vestiários..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDespesaModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Lançando...' : 'Salvar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
