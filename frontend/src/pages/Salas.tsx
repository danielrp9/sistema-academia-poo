import React, { useEffect, useState } from 'react';
import {
  Plus,
  DoorClosed,
  Users,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Sala } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Salas: React.FC = () => {
  const { hasRole } = useAuth();
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [capacidadeMaxima, setCapacidadeMaxima] = useState<number>(25);
  const [descricao, setDescricao] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSalas = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ content: Sala[] }>('/salas?size=50');
      setSalas(response.data.content || []);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalas();
  }, []);

  const openCreateModal = () => {
    setEditingSala(null);
    setNome('');
    setTipo('Musculação');
    setCapacidadeMaxima(25);
    setDescricao('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (sala: Sala) => {
    setEditingSala(sala);
    setNome(sala.nome);
    setTipo(sala.tipo);
    setCapacidadeMaxima(sala.capacidadeMaxima);
    setDescricao(sala.descricao || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      nome,
      tipo,
      capacidadeMaxima: Number(capacidadeMaxima),
      descricao,
    };

    try {
      if (editingSala) {
        await api.put(`/salas/${editingSala.id}`, payload);
      } else {
        await api.post('/salas', payload);
      }
      setModalOpen(false);
      fetchSalas();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar sala. Verifique os dados informados.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (sala: Sala) => {
    try {
      await api.patch(`/salas/${sala.id}/status?ativo=${!sala.ativa}`);
      fetchSalas();
    } catch (err) {
      console.error('Erro ao alterar status da sala:', err);
    }
  };

  const isStaff = hasRole(['ADMIN', 'COLABORADOR']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Salas
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Capacidade e ambientes disponíveis.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Sala
          </button>
        )}
      </div>

      {/* Grid of Rooms */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {salas.map((sala) => (
            <div
              key={sala.id}
              className={`rounded-2xl border bg-white p-6 shadow-sm transition-all flex flex-col justify-between ${
                sala.ativa ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <DoorClosed className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sala.nome}</h3>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 mt-0.5">
                        {sala.tipo}
                      </span>
                    </div>
                  </div>

                  <div>
                    {sala.ativa ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                        <XCircle className="h-3 w-3" /> Inativa
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>Capacidade máxima: {sala.capacidadeMaxima} alunos</span>
                </div>

                {sala.descricao && (
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {sala.descricao}
                  </p>
                )}
              </div>

              {isStaff && (
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
                  <button
                    onClick={() => openEditModal(sala)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(sala)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      sala.ativa
                        ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {sala.ativa ? 'Inativar' : 'Ativar'}
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
                {editingSala ? 'Editar Sala' : 'Cadastrar Nova Sala'}
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
                  Nome da Sala
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Sala de Crossfit"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo / Categoria
                  </label>
                  <input
                    type="text"
                    required
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    placeholder="Ex: Crossfit / Dança"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Capacidade Máxima
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacidadeMaxima}
                    onChange={(e) => setCapacidadeMaxima(Number(e.target.value))}
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
                  placeholder="Descreva os equipamentos e características da sala..."
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
                  {saving ? 'Salvando...' : 'Salvar Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
