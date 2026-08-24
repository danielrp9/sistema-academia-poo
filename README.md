# Sistema de Gestao de Academia

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Tailwind-blue.svg)](https://react.dev/)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20RBAC-red.svg)](https://jwt.io/)
[![Build](https://img.shields.io/badge/Tests-8%2F8%20Passing-success.svg)]()

Aplicacao web full-stack para administracao de academias, integrando controle de acesso por catraca, reservas de salas com limite de lotacao, fechamento de fluxo de caixa (DRE) e controle de vendas de produtos.

---

## 1. Sobre o Projeto

O sistema centraliza os processos operacionais e financeiros da academia em uma unica aplicacao:

1. **Validacao de Catraca**: Validacao automatica de entrada e saida com base em planos mensais ou diarias ativas no horario exato do acesso. Tentativas invalidas registram auditoria com o motivo da recusa e CPF mascarado.
2. **Controle de Vagas e Agendamentos**: Bloqueio de reservas quando a capacidade maxima da sala e atingida e rotina para cancelar reservas preliminares pendentes de pagamento ha mais de 5 dias uteis.
3. **Balanco Financeiro (DRE)**: Calculo em tempo real de receitas (planos, diarias e produtos) e despesas operacionais cadastradas, gerando o saldo liquido por mes e ano.
4. **Inventario e Vendas**: Registro de itens da loja com baixa automatica de estoque e lancamento transacional na receita.

---

## 2. Origem e Evolucao do Projeto

### 2.1 Contexto Academico Inicial
O projeto nasceu originalmente como trabalho pratico na disciplina de **Programacao Orientada a Objetos (POO)** durante o curso de **Bacharelado em Sistemas de Informacao** na **Universidade Federal dos Vales do Jequitinhonha e Mucuri (UFVJM)**. O objetivo inicial era exercitar os fundamentos de POO em Java: classes, heranca, polimorfismo e encapsulamento.

### 2.2 Motivacao da Refatoracao
A motivacao para revisitar o projeto foi transformar o prototipo academico — que rodava em terminal com dados em memoria — em uma aplicacao completa, desacoplada e pronta para execucao real, aplicando boas praticas de arquitetura, seguranca e persistencia relacional.

### 2.3 Comparativo Tecnico

| Aspecto | Versao Inicial (POO Basico) | Versao Atual (Spring Boot + React) |
| :--- | :--- | :--- |
| **Interface** | Linha de comando (CLI com Scanner) | Interface web em React, TypeScript e Tailwind CSS |
| **Arquitetura** | Monolitica acoplada no `main` | Camadas desacopladas (Domain, Service, Repository, Web/DTO, Security) |
| **Padroes de Projeto** | Heranca e polimorfismo simples | Strategy (reembolsos e cancelamentos), Factory (transacoes) |
| **Persistencia** | Listas em memoria / arquivos locais | Banco relacional com Spring Data JPA / Hibernate e transacoes ACID |
| **Versionamento de Banco** | Nenhum | Migracoes versionadas com Flyway (`V1`, `V2`) |
| **Comunicacao** | Chamadas diretas de metodo | API RESTful documentada com OpenAPI 3 / Swagger |
| **Seguranca** | Sem autenticacao | Autenticacao stateless via JWT e controle de papeis (RBAC) |
| **Tratamento de Erros** | Prints no terminal | Respostas padronizadas via RFC 7807 (Problem Details) |
| **Testes** | Testes manuais no terminal | Testes automatizados com JUnit 5, Mockito e MockMvc |

---

## 3. Decisoes Tecnicas e Estrutura

### 3.1 Backend em Camadas
A organizacao do codigo segue a separacao de responsabilidades em camadas bem definidas:

```
br.com.academia/
├── domain/                  # Entidades de banco e enums de negocio
├── service/                 # Regras de negocio (Catraca, Agendamentos, Financeiro, etc.)
│   ├── factory/             # Criacao de transacoes financeiras
│   └── strategy/            # Calculo de politicas de cancelamento e reembolso
├── repository/              # Interfaces Spring Data JPA
├── web/
│   ├── controller/          # Endpoints REST protegidos
│   └── dto/                 # Java Records para entrada e saida de dados
└── infra/
    ├── security/            # Filtro JWT e configuracoes do Spring Security
    └── exception/           # Manipulador global de excecoes
```

### 3.2 Seguranca e Autenticacao
* **JWT (JSON Web Token)**: Autenticacao sem sessao no servidor (`STATELESS`). O token carrega o papel do usuario e o ID para autorizacao rapida.
* **Perfis de Acesso (RBAC)**:
  * `ADMIN`: Acesso irrestrito a relatorios financeiros, cadastro de salas, planos e administracao de usuarios.
  * `COLABORADOR`: Operacao da catraca, agendamentos, estoque e atendimento a alunos.
  * `CLIENTE`: Consulta aos seus proprios agendamentos.

### 3.3 Regras de Concorrencia e Catraca
O `CatracaService` faz a verificacao deterministica consultando os agendamentos com status `CONFIRMADO` no intervalo de horario da requisicao. Caso o aluno nao possua reserva confirmada ou plano ativo para aquele momento, o acesso e recusado com status 403 e o evento e gravado para auditoria.

### 3.4 Migracoes de Banco com Flyway
Toda a criacao e evolucao das tabelas e controlada por scripts SQL versionados (`V1__create_tables.sql`, `V2__insert_initial_data.sql`), garantindo que o banco de dados seja criado de forma identica em qualquer ambiente.

### 3.5 Frontend Integrado
O frontend em React 18 e compilado para a pasta `src/main/resources/static` do Spring Boot, permitindo que a aplicacao inteira seja executada a partir de um unico arquivo `.jar`.

---

## 4. Regras de Negocio

| Modulo | Regra de Negocio | Comportamento do Sistema |
| :--- | :--- | :--- |
| **Catraca** | Liberacao de Acesso | Valida se ha diaria confirmada ou plano ativo no horario atual. Bloqueios geram log com CPF mascarado. |
| **Agendamentos** | Capacidade da Sala | Impede novas reservas quando a contagem de confirmados atinge a capacidade maxima da sala. |
| **Agendamentos** | Limpeza de Expirados | Cancela reservas em estado preliminar que nao tiveram pagamento confirmado em ate 5 dias uteis. |
| **Financeiro** | Calculo do DRE | Soma entradas (mensalidades, diarias e vendas) e subtrai despesas para compor o resultado do mes. |
| **Produtos** | Controle de Estoque | Atualiza a quantidade disponivel em transacao atômica no momento da venda. |

---

## 5. Tecnologias Utilizadas

### Backend
* Java 21 (LTS)
* Spring Boot 3.3.4 (Spring Data JPA, Spring Security, Validation)
* H2 Database (desenvolvimento/testes) e suporte a PostgreSQL
* Flyway Migration
* Springdoc OpenAPI 2.6.0 (Swagger 3)
* JUnit 5 e MockMvc

### Frontend
* React 18 com TypeScript
* Vite
* Tailwind CSS
* React Router DOM 6
* Axios
* Lucide React

---

## 6. Como Rodar o Projeto

### Pre-requisitos
* Java JDK 21 instalado
* Maven 3.8+
* Node.js 18+ e npm

---

### 6.1 Compilar o Frontend
Gera os arquivos estaticos na pasta de recursos do backend:

```bash
cd frontend
npm install
npm run build
cd ..
```

---

### 6.2 Executar os Testes
Roda os testes automatizados da API:

```bash
mvn clean test
```

---

### 6.3 Iniciar a Aplicacao
Inicia o servidor backend com a interface web integrada:

```bash
mvn spring-boot:run
```

Acessos disponiveis:
* **Sistema Web**: [http://localhost:8080](http://localhost:8080)
* **Documentacao Swagger**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
* **Console do Banco H2**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:academiadb`, Usuario: `SA`, Senha em branco)

---

## 7. Usuarios para Teste

| Perfil | E-mail | Senha | Permissoes |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@academia.com.br` | `admin123` | Acesso total: Financeiro, Usuarios, Catraca, Salas, Planos, Produtos. |
| **Colaborador** | `colaborador@academia.com.br` | `admin123` | Operacao de rotina: Agendamentos, Catraca, Vendas e Salas. |

---

## 8. Licenca
Projeto sob licenca MIT.
