const mdlUsuario = require("../model/mdlUsuario");

// Listar todos os usuários
const getAllUsuario = async (req, res) => {
  try {
    const usuarios = await mdlUsuario.getAllUsuario();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários", details: error.message });
  }
};

// Buscar usuário por ID
const getUsuarioByID = async (req, res) => {
  try {
    const { id_user } = req.body; 
    const usuario = await mdlUsuario.getUsuarioById(id_user);
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário por ID", details: error.message });
  }
};

// Criar usuário
const insertUsuario = async (req, res) => {
  try {
    const usuario = req.body;
    const novoUsuario = await mdlUsuario.createUsuario(usuario);
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário", details: error.message });
  }
};

// Atualizar usuário
const updateUsuario = async (req, res) => {
  try {
    const { id_user } = req.body; // pega do body, igual getUsuarioByID
    const usuario = req.body;
    const usuarioAtualizado = await mdlUsuario.updateUsuario(id_user, usuario);
    if (!usuarioAtualizado) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(usuarioAtualizado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário", details: error.message });
  }
};

// Deletar usuário
const deleteUsuario = async (req, res) => {
  try {
    const { id_user } = req.body; // pega do body
    const usuarioDeletado = await mdlUsuario.deleteUsuario(id_user);
    if (!usuarioDeletado) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(usuarioDeletado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário", details: error.message });
  }
};

// Login do usuário
const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const usuario = await mdlUsuario.loginUsuario(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    // Remove a senha da resposta por segurança
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.status(200).json({
      message: "Login realizado com sucesso",
      usuario: usuarioSemSenha
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login", details: error.message });
  }
};

// Logout do usuário (opcional - mais para limpeza de sessão)
const logoutUsuario = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer logout", details: error.message });
  }
};

module.exports = {
  getAllUsuario,
  getUsuarioByID,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
  loginUsuario,
  logoutUsuario,
};
