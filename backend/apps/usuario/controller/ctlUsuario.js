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
    
    // Verificar se CPF/CNPJ já está em uso
    const cpfCnpjExistente = await mdlUsuario.verificarCpfCnpjExistente(usuario.cpf_cnpj);
    if (cpfCnpjExistente) {
      const tipoDocumento = usuario.tipo === 'PessoaFisica' ? 'CPF' : 'CNPJ';
      return res.status(400).json({ 
        error: `Este ${tipoDocumento} já está cadastrado e em uso por outro usuário. Por favor, verifique o documento informado.` 
      });
    }
    
    const novoUsuario = await mdlUsuario.createUsuario(usuario);
    res.status(201).json(novoUsuario);
  } catch (error) {
    // Tratar erro de constraint UNIQUE do banco de dados
    if (error.code === '23505' && error.constraint === 'usuario_cpf_cnpj_key') {
      const tipoDocumento = req.body.tipo === 'PessoaFisica' ? 'CPF' : 'CNPJ';
      return res.status(400).json({ 
        error: `Este ${tipoDocumento} já está cadastrado e em uso por outro usuário. Por favor, verifique o documento informado.` 
      });
    }
    res.status(500).json({ error: "Erro ao criar usuário", details: error.message });
  }
};

// Atualizar usuário
const updateUsuario = async (req, res) => {
  try {
    const { id_user } = req.body; // pega do body, igual getUsuarioByID
    const usuario = req.body;
    
    // Se está atualizando o CPF/CNPJ, verificar se já está em uso por outro usuário
    if (usuario.cpf_cnpj) {
      // Validar se o formato do CPF/CNPJ corresponde ao tipo selecionado
      if (usuario.tipo) {
        if (!validarFormatoCpfCnpj(usuario.cpf_cnpj, usuario.tipo)) {
          const tipoEsperado = usuario.tipo === 'PessoaFisica' ? 'CPF (11 dígitos)' : 'CNPJ (14 dígitos)';
          return res.status(400).json({ 
            error: `O documento informado não corresponde ao tipo ${usuario.tipo === 'PessoaFisica' ? 'Pessoa Física' : 'Empresa'}. Esperado: ${tipoEsperado}` 
          });
        }
      }
      
      const cpfCnpjExistente = await mdlUsuario.verificarCpfCnpjExistente(usuario.cpf_cnpj);
      // Se encontrou um usuário com o mesmo CPF/CNPJ e não é o próprio usuário sendo atualizado
      if (cpfCnpjExistente && cpfCnpjExistente.id_user !== id_user) {
        const tipoDocumento = usuario.tipo === 'PessoaFisica' ? 'CPF' : 'CNPJ';
        return res.status(400).json({ 
          error: `Este ${tipoDocumento} já está cadastrado e em uso por outro usuário. Por favor, verifique o documento informado.` 
        });
      }
    }
    
    const usuarioAtualizado = await mdlUsuario.updateUsuario(id_user, usuario);
    if (!usuarioAtualizado) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(usuarioAtualizado);
  } catch (error) {
    // Tratar erro de constraint UNIQUE do banco de dados
    if (error.code === '23505' && error.constraint === 'usuario_cpf_cnpj_key') {
      const tipoDocumento = req.body.tipo === 'PessoaFisica' ? 'CPF' : 'CNPJ';
      return res.status(400).json({ 
        error: `Este ${tipoDocumento} já está cadastrado e em uso por outro usuário. Por favor, verifique o documento informado.` 
      });
    }
    res.status(500).json({ error: "Erro ao atualizar usuário", details: error.message });
  }
};

// Deletar usuário
const deleteUsuario = async (req, res) => {
  try {
    const { id_user } = req.body; // pega do body
    const usuarioDeletado = await mdlUsuario.deleteUsuario(id_user);
    if (!usuarioDeletado) return res.status(404).json({ error: "Usuário não encontrado ou já deletado" });
    res.status(200).json({ message: "Usuário marcado como deletado com sucesso", usuario: usuarioDeletado });
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


module.exports = {
  getAllUsuario,
  getUsuarioByID,
  insertUsuario,
  updateUsuario,
  deleteUsuario,
};
