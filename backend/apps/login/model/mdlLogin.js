const db = require("../../../database/databaseconfig");
const bcrypt = require('bcryptjs');

// Autentica usuário por email e senha (somente não deletados)
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
  loginUsuario,
};


