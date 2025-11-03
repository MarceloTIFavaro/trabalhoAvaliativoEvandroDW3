CREATE TYPE tipo_usuario AS ENUM ('PessoaFisica', 'Empresa');
CREATE TYPE status_conta AS ENUM ('Pendente', 'Pago', 'Atrasado');

CREATE TABLE usuario(
    id_user SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo tipo_usuario NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW(),
    CONSTRAINT cpf_cnpj_valido CHECK (
        (tipo = 'PessoaFisica' AND LENGTH(REGEXP_REPLACE(cpf_cnpj, '[^0-9]', '', 'g')) = 11) OR
        (tipo = 'Empresa' AND LENGTH(REGEXP_REPLACE(cpf_cnpj, '[^0-9]', '', 'g')) = 14)
    )
);

CREATE TABLE contas_a_pagar (
    id_contas SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status status_conta DEFAULT 'Pendente', 
    id_usuario INT REFERENCES usuario(id_user) ON DELETE CASCADE,
    deleted BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE parcelas(
    id_parcela SERIAL PRIMARY KEY,
    id_conta INT REFERENCES contas_a_pagar(id_contas) ON DELETE CASCADE,
    numero_parcela INT NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status status_conta DEFAULT 'Pendente',
    deleted BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT NOW()

);
SELECT * FROM usuario;
INSERT INTO usuario (nome, email, senha, tipo, cpf_cnpj)
VALUES ('Teste', 'test@teste.com', '$2a$10$LJg78x4XLOHaEL4g/E5lJOI0JYHu2X88/izAfIkqtKWusW5KjJWMO', 'PessoaFisica', '123.456.789-01');
