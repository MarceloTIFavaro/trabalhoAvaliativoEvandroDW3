const mdlLogin = require("../model/mdlLogin");
const jwt = require('jsonwebtoken');

const tokenBlacklist = new Set();

// Função para validar se o formato do CPF ou CNPJ corresponde ao tipo de usuário (Pessoa Física ou Empresa)
const validarFormatoCpfCnpj = (cpfCnpj, tipo) => {
  const cpfCnpjLimpo = cpfCnpj.replace(/\s/g, '');
  const temBarraCNPJ = cpfCnpjLimpo.includes('/');
  const temPontoCPF = cpfCnpjLimpo.includes('.') && cpfCnpjLimpo.includes('-') && !temBarraCNPJ;
  const apenasNumeros = cpfCnpjLimpo.replace(/\D/g, '');
  let tipoDetectado = null;

  if (temBarraCNPJ || apenasNumeros.length === 14) {
    tipoDetectado = 'Empresa';
  } else if (temPontoCPF || apenasNumeros.length === 11) {
    tipoDetectado = 'PessoaFisica';
  } else if (apenasNumeros.length > 0) {
    tipoDetectado = apenasNumeros.length === 14 ? 'Empresa' : 'PessoaFisica';
  }

  return tipoDetectado === tipo;
};

// Função responsável por realizar o login do usuário e gerar o token JWT
const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const usuario = await mdlLogin.loginUsuario(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    if (!validarFormatoCpfCnpj(usuario.cpf_cnpj, usuario.tipo)) {
      return res.status(401).json({ 
        error: `Documento cadastrado não corresponde ao tipo ${usuario.tipo === 'PessoaFisica' ? 'Pessoa Física (CPF)' : 'Empresa (CNPJ)'}` 
      });
    }

    const token = jwt.sign(
      { 
        id_user: usuario.id_user, 
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
      { expiresIn: '24h' }
    );

    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.status(200).json({
      message: "Login realizado com sucesso",
      token: token,
      usuario: usuarioSemSenha
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login", details: error.message });
  }
};

// Middleware que autentica o usuário verificando o token JWT
const AutenticaJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      return res.status(401).json({ error: "Token de acesso não fornecido" });
    }

    if (tokenBlacklist.has(token)) {
      console.log(`Tentativa de acesso com token invalidado. Total na blacklist: ${tokenBlacklist.size}`);
      return res.status(401).json({ error: "Token foi invalidado (logout realizado)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(500).json({ error: "Erro na autenticação", details: error.message });
  }
};

// Função que realiza o logout e invalida o token atual, adicionando-o na blacklist
const logoutUsuario = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (token) {
      tokenBlacklist.add(token);
      console.log(`Token invalidado no logout. Total de tokens na blacklist: ${tokenBlacklist.size}`);
      console.log(`Token (primeiros 50 chars): ${token.substring(0, 50)}...`);
    } else {
      console.log('Logout chamado sem token no header Authorization');
    }
    
    res.status(200).json({ 
      message: "Logout realizado com sucesso. Token invalidado.",
      tokenInvalidado: !!token
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: "Erro ao fazer logout", details: error.message });
  }
};

// Função auxiliar para consultar o status da blacklist (para debug)
const getBlacklistStatus = () => {
  return {
    totalTokensInvalidados: tokenBlacklist.size,
    tokens: Array.from(tokenBlacklist).map(t => t.substring(0, 20) + '...')
  };
};

module.exports = {
  loginUsuario,
  logoutUsuario,
  AutenticaJWT,
  getBlacklistStatus,
};
