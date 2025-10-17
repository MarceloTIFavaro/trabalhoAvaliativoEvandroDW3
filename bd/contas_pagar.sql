CREATE TYPE tipo_usuario AS ENUM ('PessoaFisica', 'Empresa');


CREATE TABLE usuario(
	id_user SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	senha VARCHAR(255) NOT NULL,
	tipo tipo_usuario NOT NULL,
	cpf_cnpj VARCHAR(20),
	data_criacao TIMESTAMP DEFAULT NOW()
);


CREATE TYPE status_conta AS ENUM ('Pendente', 'Pago', 'Atrasado');


CREATE TABLE contas_a_pagar (
    id_contas SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(12, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status status_conta DEFAULT 'Pendente',
    id_usuario INT REFERENCES usuario(id_user) ON DELETE CASCADE,
    data_criacao TIMESTAMP DEFAULT NOW()
);
