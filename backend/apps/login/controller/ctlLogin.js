const mdlLogin = require("../model/mdlLogin");
const jwt = require('jsonwebtoken');

// Blacklist de tokens invalidados (em memória)
// Em produção, considere usar Redis ou banco de dados para persistência
const tokenBlacklist = new Set();

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

    const usuario = await mdlLogin.loginUsuario(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    // Validar se o formato do CPF/CNPJ corresponde ao tipo de usuário
    if (!validarFormatoCpfCnpj(usuario.cpf_cnpj, usuario.tipo)) {
      return res.status(401).json({ 
        error: `Documento cadastrado não corresponde ao tipo ${usuario.tipo === 'PessoaFisica' ? 'Pessoa Física (CPF)' : 'Empresa (CNPJ)'}` 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id_user: usuario.id_user, 
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
      { expiresIn: '24h' }
    );

    // Remove a senha da resposta por segurança
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

// Middleware de autenticação JWT
const AutenticaJWT = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    if (!token) {
      return res.status(401).json({ error: "Token de acesso não fornecido" });
    }

    // Verificar se o token está na blacklist (invalidado)
    if (tokenBlacklist.has(token)) {
      console.log(`Tentativa de acesso com token invalidado. Total na blacklist: ${tokenBlacklist.size}`);
      return res.status(401).json({ error: "Token foi invalidado (logout realizado)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_aqui');
    req.user = decoded; // Adiciona informações do usuário ao request
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

// Logout do usuário - invalida o token
const logoutUsuario = async (req, res) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    if (token) {
      // Adicionar token à blacklist para invalidá-lo
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

// Função para debug - verificar status da blacklist (opcional, pode remover em produção)
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
  getBlacklistStatus, // Exportar para debug
};
