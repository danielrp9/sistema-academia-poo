export type Role = 'ADMIN' | 'COLABORADOR' | 'CLIENTE';

export type StatusAgendamento = 'PRELIMINAR' | 'CONFIRMADO' | 'CANCELADO';

export type ModalidadeAgendamento = 'DIARIA' | 'MENSALIDADE';

export type TipoTransacao = 'RECEITA' | 'DESPESA';

export type CategoriaProduto =
  | 'SUPLEMENTO'
  | 'BEBIDA'
  | 'SNACK'
  | 'VESTUARIO'
  | 'ACESSORIO'
  | 'OUTROS';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpfMascarado?: string;
  telefone?: string;
  endereco?: string;
  role: Role;
  ativo: boolean;
  dataCadastro?: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nome: string;
  email: string;
  role: Role;
}

export interface Sala {
  id: number;
  nome: string;
  tipo: string;
  capacidadeMaxima: number;
  ativa: boolean;
  descricao?: string;
  criadoEm?: string;
}

export interface Plano {
  id: number;
  nome: string;
  modalidade: ModalidadeAgendamento;
  salaId?: number;
  salaNome?: string;
  preco: number;
  diasValidade: number;
  descricao?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface Agendamento {
  id: number;
  clienteId: number;
  clienteNome: string;
  clienteCpfMascarado?: string;
  salaId: number;
  salaNome: string;
  instrutorId?: number;
  instrutorNome?: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: ModalidadeAgendamento;
  status: StatusAgendamento;
  preco: number;
  valorPago?: number;
  valorEstornado?: number;
  dataConfirmacao?: string;
  dataCancelamento?: string;
  motivoCancelamento?: string;
  criadoEm: string;
}

export interface RegistroCatraca {
  id: number;
  clienteId: number;
  clienteNome: string;
  cpfMascarado?: string;
  dataHoraEntrada?: string;
  dataHoraSaida?: string;
  liberado: boolean;
  motivoNegacao?: string;
  registradoEm: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: CategoriaProduto;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  criadoEm?: string;
}

export interface Transacao {
  id: number;
  tipo: TipoTransacao;
  categoria: string;
  valor: number;
  dataTransacao: string;
  descricao: string;
  usuarioResponsavelId?: number;
  usuarioResponsavelNome?: string;
  agendamentoId?: number;
  produtoId?: number;
  quantidadeProduto?: number;
}

export interface BalancoMensal {
  ano: number;
  mes: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  transacoes: Transacao[];
}
