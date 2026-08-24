import React, { useEffect, useState } from 'react';
import {
  Plus,
  Tag,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { Plano, Sala, ModalidadeAgendamento } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Planos: React.FC = () => {
  const { isAdmin } = useAuth();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState<ModalidadeAgendamento>('DIARIA');
  const [salaId, setSalaId] = useState<string>('');
  const [preco, setPreco] = useState<number>(35.0);
  const [diasValidade, setDiasValidade] = useState<number>(1);
  const [descricao, setDescricao] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPlanosESalas = async () => {
    setLoading(true);
    try {
      const [planosRes, salasRes] = await Promise.all([
        api.get<{ content: Plano[] }>('/planos?size=50'),
        api.get<Sala[]>('/salas/ativas'),
      ]);
      setPlanos(planosRes.data.content || []);
      setSalas(salasRes.data || []);
    } catch (err) {
      console.error('Erro ao buscar planos ou salas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanosESalas();
  }, []);

  const openCreateModal = () => {
    setEditingPlano(null);
    setNome('');
    setModalidade('DIARIA');
    setSalaId('');
    setPreco(35.0);
    setDiasValidade(1);
    setDescricao('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (plano: Plano) => {
    setEditingPlano(plano);
    setNome(plano.nome);
    setModalidade(plano.modalidade);
    setSalaId(plano.salaId ? String(plano.salaId) : '');
    setPreco(plano.preco);
    setDiasValidade(plano.diasValidade);
    setDescricao(plano.descricao || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      nome,
      modalidade,
      salaId: salaId ? Number(salaId) : null,
      preco: Number(preco),
      diasValidade: Number(diasValidade),
      descricao,
    };

    try {
      if (editingPlano) {
        await api.put(`/planos/${editingPlano.id}`, payload);
      } else {
        await api.post('/planos', payload);
      }
      setModalOpen(false);
      fetchPlanosESalas();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar plano. Verifique os dados informados.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plano: Plano) => {
    try {
      await api.patch(`/planos/${plano.id}/status?ativo=${!plano.ativo}`);
      fetchPlanosESalas();
    } catch (err) {
      console.error('Erro ao alterar status do plano:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Planos
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Modalidades de diárias e mensalidades.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Plano
          </button>
        )}
      </div>

      {/* Grid of Plans */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all flex flex-col justify-between ${
                plano.ativo ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{plano.nome}</h3>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 mt-0.5">
                        {plano.modalidade} {plano.salaNome ? `• ${plano.salaNome}` : '• Acesso Livre'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {plano.ativo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                        <XCircle className="h-3 w-3" /> Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">
                    R$ {plano.preco?.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    / {plano.diasValidade} {plano.diasValidade === 1 ? 'dia' : 'dias'}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Validade: {plano.diasValidade} dias</span>
                </div>

                {plano.descricao && (
                  <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {plano.descricao}
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
                  <button
                    onClick={() => openEditModal(plano)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plano)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      plano.ativo
                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {plano.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingPlano ? 'Editar Plano' : 'Cadastrar Novo Plano'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Mensalidade Livre Gold"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Modalidade
                  </label>
                  <select
                    value={modalidade}
                    onChange={(e) => {
                      const m = e.target.value as ModalidadeAgendamento;
                      setModalidade(m);
                      if (m === 'MENSALIDADE' && diasValidade === 1) {
                        setDiasValidade(30);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="DIARIA">Diária Avulsa</option>
                    <option value="MENSALIDADE">Mensalidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sala Específica (Opcional)
                  </label>
                  <select
                    value={salaId}
                    onChange={(e) => setSalaId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Todas as Salas (Livre)</option>
                    {salas.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preço (R$)
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Validade em Dias
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={diasValidade}
                    onChange={(e) => setDiasValidade(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Benefícios inclusos e regras do plano..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
