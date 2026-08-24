-- Criação das tabelas do Sistema de Gestão de Academia (Modelo Dinâmico)

CREATE TABLE IF NOT EXISTS tb_usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_salas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidade_maxima INT NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    descricao VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_planos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    modalidade VARCHAR(30) NOT NULL,
    sala_id BIGINT,
    preco NUMERIC(10, 2) NOT NULL,
    dias_validade INT NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plano_sala FOREIGN KEY (sala_id) REFERENCES tb_salas(id)
);

CREATE TABLE IF NOT EXISTS tb_agendamentos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    sala_id BIGINT NOT NULL,
    instrutor_id BIGINT,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    modalidade VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    valor_pago NUMERIC(10, 2),
    valor_estornado NUMERIC(10, 2) DEFAULT 0.00,
    data_confirmacao TIMESTAMP,
    data_cancelamento TIMESTAMP,
    motivo_cancelamento VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agendamento_cliente FOREIGN KEY (cliente_id) REFERENCES tb_usuarios(id),
    CONSTRAINT fk_agendamento_sala FOREIGN KEY (sala_id) REFERENCES tb_salas(id),
    CONSTRAINT fk_agendamento_instrutor FOREIGN KEY (instrutor_id) REFERENCES tb_usuarios(id)
);

CREATE TABLE IF NOT EXISTS tb_produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_transacoes_financeiras (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    data_transacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(255) NOT NULL,
    usuario_responsavel_id BIGINT,
    agendamento_id BIGINT,
    produto_id BIGINT,
    quantidade_produto INT,
    CONSTRAINT fk_transacao_usuario FOREIGN KEY (usuario_responsavel_id) REFERENCES tb_usuarios(id),
    CONSTRAINT fk_transacao_agendamento FOREIGN KEY (agendamento_id) REFERENCES tb_agendamentos(id),
    CONSTRAINT fk_transacao_produto FOREIGN KEY (produto_id) REFERENCES tb_produtos(id)
);

CREATE TABLE IF NOT EXISTS tb_registros_catraca (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    data_hora_entrada TIMESTAMP,
    data_hora_saida TIMESTAMP,
    liberado BOOLEAN NOT NULL,
    motivo_negacao VARCHAR(255),
    registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_catraca_cliente FOREIGN KEY (cliente_id) REFERENCES tb_usuarios(id)
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_agendamento_sala_horario ON tb_agendamentos (sala_id, data_hora_inicio, data_hora_fim);
CREATE INDEX IF NOT EXISTS idx_agendamento_cliente_status ON tb_agendamentos (cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON tb_transacoes_financeiras (data_transacao);
CREATE INDEX IF NOT EXISTS idx_catraca_cliente ON tb_registros_catraca (cliente_id, registrado_em);
CREATE INDEX IF NOT EXISTS idx_planos_modalidade ON tb_planos (modalidade, ativo);
