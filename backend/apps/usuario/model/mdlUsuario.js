const db = require("../../../database/databaseconfig");

// Buscar todos os Usuario
const getAllUsuario = async () => {
  const { rows } = await db.query("SELECT * FROM usuario ORDER BY id_user;");
  return rows;
};

// Buscar Usuario por ID
const getUsuarioById = async (id_user) => {
  const { rows } = await db.query("SELECT * FROM usuario WHERE id_user = $1;", [id_user]);
  return rows[0];
};

// Criar Usuario
const createUsuario = async (usuario) => {
  const { nome, email, senha, tipo, cpf_cnpj } = usuario;
  const query = `
    INSERT INTO usuario (nome, email, senha, tipo, cpf_cnpj)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [nome, email, senha, tipo, cpf_cnpj];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Atualizar Usuario
const updateUsuario = async (id_user, usuario) => {
  const { nome, email, senha, tipo, cpf_cnpj } = usuario;
  const query = `
    UPDATE usuario
    SET nome = $1, email = $2, senha = $3, tipo = $4, cpf_cnpj = $5
    WHERE id_user = $6
    RETURNING *;
  `;
  const values = [nome, email, senha, tipo, cpf_cnpj, id_user];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Deletar Usuario
const deleteUsuario = async (id_user) => {
  const { rows } = await db.query("DELETE FROM usuario WHERE id_user = $1 RETURNING *;", [id_user]);
  return rows[0];
};

module.exports = {
  getAllUsuario,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
