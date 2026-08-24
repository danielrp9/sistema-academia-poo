import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Power,
  ShieldCheck,
  UserCheck,
  User as UserIcon,
  Users,
  Briefcase,
} from 'lucide-react';
import { api } from '../services/api';
import { Usuario, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'CLIENTES' | 'EQUIPE';

export const Usuarios: React.FC = () => {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('CLIENTES');

  const fetchUsuarios = async (nome?: string) => {
    setLoading(true);
    try {
      const url = nome ? `/usuarios?nome=${encodeURIComponent(nome)}&size=100` : '/usuarios?size=100';
      const response = await api.get<{ content: Usuario[] }>(url);
      setUsuarios(response.data.content || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsuarios(searchTerm);
  };

  const handleToggleStatus = async (userItem: Usuario) => {
    try {
      await api.patch(`/usuarios/${userItem.id}/status?ativo=${!userItem.ativo}`);
      fetchUsuarios(searchTerm);
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
            <ShieldCheck className="h-3 w-3" /> Administrador
          </span>
        );
      case 'COLABORADOR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
            <UserCheck className="h-3 w-3" /> Colaborador
          </span>
        );
      case 'CLIENTE':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
            <UserIcon className="h-3 w-3" /> Aluno
          </span>
        );
    }
  };

  const clientes = usuarios.filter((u) => u.role === 'CLIENTE');
  const equipe = usuarios.filter((u) => u.role === 'ADMIN' || u.role === 'COLABORADOR');
  const currentList = activeTab === 'CLIENTES' ? clientes : equipe;

  return (
    <div className="space-y-6">
      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('CLIENTES')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'CLIENTES'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4 text-blue-600" />
            <span>Alunos</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                activeTab === 'CLIENTES'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {clientes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EQUIPE')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'EQUIPE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-4 w-4 text-blue-600" />
            <span>Equipe</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                activeTab === 'EQUIPE'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {equipe.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar ${activeTab === 'CLIENTES' ? 'aluno' : 'membro'}...`}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Users Table Container */}
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
                  <th className="px-5 py-3.5">Nome</th>
                  <th className="px-5 py-3.5">E-mail</th>
                  <th className="px-5 py-3.5">CPF</th>
                  <th className="px-5 py-3.5">Perfil</th>
                  <th className="px-5 py-3.5">Status</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Nenhum registro encontrado nesta aba.
                    </td>
                  </tr>
                )}
                {currentList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
                        {item.nome.charAt(0).toUpperCase()}
                      </div>
                      <span>{item.nome}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.email}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      {item.cpfMascarado || '***.***.***-**'}
                    </td>
                    <td className="px-5 py-3.5">{getRoleBadge(item.role)}</td>
                    <td className="px-5 py-3.5">
                      {item.ativo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" /> Inativo
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            item.ativo
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {item.ativo ? 'Inativar' : 'Ativar'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
