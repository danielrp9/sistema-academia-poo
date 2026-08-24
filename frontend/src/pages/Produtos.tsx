import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Produto, CategoriaProduto, Usuario } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Produtos: React.FC = () => {
  const { hasRole } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [vendaModalOpen, setVendaModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [selectedProdutoParaVenda, setSelectedProdutoParaVenda] = useState<Produto | null>(null);

  // Form states - Produto
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProduto>('SUPLEMENTO');
  const [preco, setPreco] = useState<number>(10.0);
  const [quantidadeEstoque, setQuantidadeEstoque] = useState<number>(20);

  // Form states - Venda
  const [clienteId, setClienteId] = useState<string>('');
  const [quantidadeVenda, setQuantidadeVenda] = useState<number>(1);
  const [metodoPagamento, setMetodoPagamento] = useState<string>('PIX');

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [produtosRes, usuariosRes] = await Promise.all([
        api.get<{ content: Produto[] }>('/produtos?size=100'),
        api.get<{ content: Usuario[] }>('/usuarios?size=100'),
      ]);
      setProdutos(produtosRes.data.content || []);
      setUsuarios(usuariosRes.data.content || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const openCreateModal = () => {
    setEditingProduto(null);
    setNome('');
    setCategoria('SUPLEMENTO');
    setPreco(10.0);
    setQuantidadeEstoque(20);
    setFormError(null);
    setProdutoModalOpen(true);
  };

  const openEditModal = (prod: Produto) => {
    setEditingProduto(prod);
    setNome(prod.nome);
    setCategoria(prod.categoria);
    setPreco(prod.preco);
    setQuantidadeEstoque(prod.quantidadeEstoque);
    setFormError(null);
    setProdutoModalOpen(true);
  };

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = {
      nome,
      categoria,
      preco: Number(preco),
      quantidadeEstoque: Number(quantidadeEstoque),
    };

    try {
      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }
      setProdutoModalOpen(false);
      setSuccessMessage('Produto salvo no estoque com sucesso.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchDados();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const openVendaModal = (prod: Produto) => {
    setSelectedProdutoParaVenda(prod);
    setClienteId(usuarios[0] ? String(usuarios[0].id) : '');
    setQuantidadeVenda(1);
    setMetodoPagamento('PIX');
    setFormError(null);
    setVendaModalOpen(true);
  };

  const handleVenderProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdutoParaVenda) return;
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        produtoId: selectedProdutoParaVenda.id,
        clienteId: Number(clienteId),
        quantidade: Number(quantidadeVenda),
        metodoPagamento,
      };

      await api.post('/produtos/vender', payload);
      setVendaModalOpen(false);
      setSuccessMessage(`Venda de ${quantidadeVenda}x ${selectedProdutoParaVenda.nome} registrada e baixa realizada no estoque.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchDados();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Erro ao registrar venda. Verifique o estoque disponível.');
    } finally {
      setSaving(false);
    }
  };

  const handleDesativar = async (id: number) => {
    if (!window.confirm('Deseja realmente desativar este produto do catálogo?')) return;
    try {
      await api.delete(`/produtos/${id}`);
      fetchDados();
    } catch (err) {
      console.error('Erro ao desativar produto:', err);
    }
  };

  const isStaff = hasRole(['ADMIN', 'COLABORADOR']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Produtos
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Catálogo de itens e controle de estoque.
          </p>
        </div>

        {isStaff && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        )}
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-900">Inventário de Produtos Ativos</h3>
          <p className="text-xs text-slate-500">Controle de saldo em estoque e valores unitários</p>
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
                  <th className="px-5 py-3.5">Produto</th>
                  <th className="px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Preço Unitário</th>
                  <th className="px-5 py-3.5">Qtd. Estoque</th>
                  <th className="px-5 py-3.5">Status</th>
                  {isStaff && <th className="px-5 py-3.5 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Nenhum produto cadastrado no momento.
                    </td>
                  </tr>
                )}
                {produtos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{prod.nome}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      R$ {prod.preco?.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-semibold ${
                          prod.quantidadeEstoque <= 5 ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {prod.quantidadeEstoque} un
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {prod.ativo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" /> Inativo
                        </span>
                      )}
                    </td>
                    {isStaff && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openVendaModal(prod)}
                            disabled={prod.quantidadeEstoque <= 0}
                            title="Registrar Venda no Balcão"
                            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-colors"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Vender
                          </button>
                          <button
                            onClick={() => openEditModal(prod)}
                            title="Editar Produto"
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDesativar(prod.id)}
                            title="Desativar do Catálogo"
                            className="rounded-md p-1 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Salvar Produto */}
      {produtoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingProduto ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <button
                onClick={() => setProdutoModalOpen(false)}
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

            <form onSubmit={handleSalvarProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome do Item
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Whey Protein Isolado 900g"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaProduto)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="SUPLEMENTO">Suplemento</option>
                  <option value="BEBIDA">Bebida / Energético</option>
                  <option value="SNACK">Snack / Barra de Proteína</option>
                  <option value="VESTUARIO">Vestuário / Camiseta</option>
                  <option value="ACESSORIO">Acessório de Treino</option>
                  <option value="OUTROS">Outros</option>
                </select>
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
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantidadeEstoque}
                    onChange={(e) => setQuantidadeEstoque(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProdutoModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Venda */}
      {vendaModalOpen && selectedProdutoParaVenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">Registrar Venda no Balcão</h2>
              <button
                onClick={() => setVendaModalOpen(false)}
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
                <strong>Produto:</strong> {selectedProdutoParaVenda.nome}
              </p>
              <p>
                <strong>Preço Unitário:</strong> R$ {selectedProdutoParaVenda.preco?.toFixed(2)}
              </p>
              <p>
                <strong>Estoque Atual:</strong> {selectedProdutoParaVenda.quantidadeEstoque} unidades
              </p>
            </div>

            <form onSubmit={handleVenderProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cliente Comprador
                </label>
                <select
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">Selecione o cliente...</option>
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
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProdutoParaVenda.quantidadeEstoque}
                    required
                    value={quantidadeVenda}
                    onChange={(e) => setQuantidadeVenda(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total a Cobrar
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900">
                    R$ {(selectedProdutoParaVenda.preco * quantidadeVenda).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Forma de Pagamento
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

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setVendaModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Confirmar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
