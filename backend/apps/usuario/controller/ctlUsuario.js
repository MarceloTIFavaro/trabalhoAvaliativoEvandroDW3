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
    
    // Validar se o formato do CPF/CNPJ corresponde ao tipo selecionado
    if (usuario.cpf_cnpj && usuario.tipo) {
      if (!validarFormatoCpfCnpj(usuario.cpf_cnpj, usuario.tipo)) {
        const tipoEsperado = usuario.tipo === 'PessoaFisica' ? 'CPF (11 dígitos)' : 'CNPJ (14 dígitos)';
        return res.status(400).json({ 
          error: `O documento informado não corresponde ao tipo ${usuario.tipo === 'PessoaFisica' ? 'Pessoa Física' : 'Empresa'}. Esperado: ${tipoEsperado}` 
        });
      }
    }
    
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

// Função auxiliar para validar formato de CPF/CNPJ
const validarFormatoCpfCnpj = (cpfCnpj, tipo) => {
  // Remove espaços em branco
  const cpfCnpjLimpo = cpfCnpj.replace(/\s/g, '');
  
  // Detecta se é CPF ou CNPJ pelo formato
  const temBarraCNPJ = cpfCnpjLimpo.includes('/');
  const temPontoCPF = cpfCnpjLimpo.includes('.') && cpfCnpjLimpo.includes('-') && !temBarraCNPJ;
  
  // Remove formatação para contar dígitos
  const apenasNumeros = cpfCnpjLimpo.replace(/\D/g, '');
  
  // Determina o tipo pelo formato ou número de dígitos
  let tipoDetectado = null;
  
  if (temBarraCNPJ || apenasNumeros.length === 14) {
    tipoDetectado = 'Empresa';
  } else if (temPontoCPF || apenasNumeros.length === 11) {
    tipoDetectado = 'PessoaFisica';
  } else if (apenasNumeros.length > 0) {
    // Se não conseguiu detectar pelo formato, usa o tamanho
    tipoDetectado = apenasNumeros.length === 14 ? 'Empresa' : 'PessoaFisica';
  }
  
  return tipoDetectado === tipo;
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

    // Validar se o formato do CPF/CNPJ corresponde ao tipo de usuário
    if (!validarFormatoCpfCnpj(usuario.cpf_cnpj, usuario.tipo)) {
      return res.status(401).json({ 
        error: `Documento cadastrado não corresponde ao tipo ${usuario.tipo === 'PessoaFisica' ? 'Pessoa Física (CPF)' : 'Empresa (CNPJ)'}` 
      });
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
