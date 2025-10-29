const mdlLogin = require("../model/mdlLogin");
const jwt = require('jsonwebtoken');

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
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: "Token de acesso não fornecido" });
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

// Logout do usuário (opcional - mais para limpeza de sessão)
const logoutUsuario = async (req, res) => {
  try {
    res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer logout", details: error.message });
  }
};

module.exports = {
  loginUsuario,
  logoutUsuario,
  AutenticaJWT,
};
