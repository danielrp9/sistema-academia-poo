-- Inserção de Salas Iniciais (Exemplos Dinâmicos Customizáveis)
INSERT INTO tb_salas (nome, tipo, capacidade_maxima, ativa, descricao)
VALUES 
    ('Sala de Spinning', 'Spinning', 25, TRUE, 'Sala climatizada com 25 bikes ergométricas profissionais e iluminação dinâmica.'),
    ('Sala de Musculação', 'Musculação', 50, TRUE, 'Área ampla com maquinário de alta performance e pesos livres.'),
    ('Sala de Fit Dance', 'Fit Dance', 35, TRUE, 'Espaço amplo com piso vinílico amortecido, espelhos e sonorização acústica.'),
    ('Sala de Pilates', 'Pilates', 15, TRUE, 'Estúdio climatizado completo com Reformers, Cadillacs e Chairs.');

-- Inserção de Planos e Precificação Dinâmica Inicial
INSERT INTO tb_planos (nome, modalidade, sala_id, preco, dias_validade, descricao, ativo)
VALUES
    ('Diária Musculação', 'DIARIA', 2, 35.00, 1, 'Acesso avulso de 1 dia para a área de musculação e pesos livres.', TRUE),
    ('Diária Spinning', 'DIARIA', 1, 40.00, 1, 'Aula avulsa de bike indoor com instrutor.', TRUE),
    ('Mensalidade Livre Gold', 'MENSALIDADE', NULL, 180.00, 30, 'Acesso irrestrito a todas as modalidades e salas da academia.', TRUE),
    ('Mensalidade Pilates Especial', 'MENSALIDADE', 4, 250.00, 30, 'Plano mensal dedicado para estúdio de pilates.', TRUE);

-- Inserção de Usuários Padrão (Senha padrão para ambos: admin123)
-- Hash BCrypt válido para 'admin123': $2a$10$XfAh1Ayi.LfG0nVRgux5veFuHvd17T2Z0JmBipw4F9aZtK.H2gXby
INSERT INTO tb_usuarios (nome, email, senha, telefone, endereco, cpf, role, ativo, data_cadastro)
VALUES 
    ('Administrador do Sistema', 'admin@academia.com.br', '$2a$10$XfAh1Ayi.LfG0nVRgux5veFuHvd17T2Z0JmBipw4F9aZtK.H2gXby', '(11) 99999-0001', 'Av. Central, 100 - Centro', '111.222.333-44', 'ADMIN', TRUE, CURRENT_TIMESTAMP),
    ('Colaborador Recepção', 'colaborador@academia.com.br', '$2a$10$XfAh1Ayi.LfG0nVRgux5veFuHvd17T2Z0JmBipw4F9aZtK.H2gXby', '(11) 99999-0002', 'Rua das Flores, 50 - Jardins', '222.333.444-55', 'COLABORADOR', TRUE, CURRENT_TIMESTAMP);
