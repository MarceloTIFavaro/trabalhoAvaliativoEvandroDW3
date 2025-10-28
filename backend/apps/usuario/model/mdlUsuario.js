const db = require("../../../database/databaseconfig");
const bcrypt = require('bcryptjs');

// Buscar todos os Usuario (não deletados)
const getAllUsuario = async () => {
  const { rows } = await db.query("SELECT * FROM usuario WHERE deleted = false ORDER BY id_user;");
  return rows;
};

// Buscar Usuario por ID (não deletado)
const getUsuarioById = async (id_user) => {
  const { rows } = await db.query("SELECT * FROM usuario WHERE id_user = $1 AND deleted = false;", [id_user]);
  return rows[0];
};

// Criar Usuario
const createUsuario = async (usuario) => {
  const { nome, email, senha, tipo, cpf_cnpj } = usuario;
  
  // Hash da senha
  const saltRounds = 10;
  const senhaHash = await bcrypt.hash(senha, saltRounds);
  
  const query = `
    INSERT INTO usuario (nome, email, senha, tipo, cpf_cnpj)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [nome, email, senhaHash, tipo, cpf_cnpj];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Atualizar Usuario
const updateUsuario = async (id_user, usuario) => {
  const { nome, email, senha, tipo, cpf_cnpj } = usuario;
  
  // Hash da senha se fornecida
  let senhaHash = senha;
  if (senha) {
    const saltRounds = 10;
    senhaHash = await bcrypt.hash(senha, saltRounds);
  }
  
  const query = `
    UPDATE usuario
    SET nome = $1, email = $2, senha = $3, tipo = $4, cpf_cnpj = $5
    WHERE id_user = $6 AND deleted = false
    RETURNING *;
  `;
  const values = [nome, email, senhaHash, tipo, cpf_cnpj, id_user];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Deletar Usuario (soft delete)
const deleteUsuario = async (id_user) => {
  const { rows } = await db.query("UPDATE usuario SET deleted = true WHERE id_user = $1 AND deleted = false RETURNING *;", [id_user]);
  return rows[0];
};

// Login do usuário (não deletado)
const loginUsuario = async (email, senha) => {
  const { rows } = await db.query(
    "SELECT * FROM usuario WHERE email = $1 AND deleted = false;", 
    [email]
  );
  
  if (rows.length === 0) {
    return null;
  }
  
  const usuario = rows[0];
  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  
  if (!senhaValida) {
    return null;
  }
  
  return usuario;
};

module.exports = {
  getAllUsuario,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
};
