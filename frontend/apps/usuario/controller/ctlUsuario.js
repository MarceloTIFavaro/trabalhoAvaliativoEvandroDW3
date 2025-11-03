const axios = require("axios");

// Função auxiliar para obter headers com token JWT
const getAuthHeaders = (req) => {
  const token = req.session?.userToken;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

const CadastroPost = async (req, res) => {
  const formData = req.body;
  
  console.log('[ctlUsuario] Dados recebidos:', formData);
  
  // Validação básica
  if (!formData.nome || !formData.email || !formData.senha || !formData.tipo || !formData.cpf_cnpj) {
    return res.status(400).json({ 
      status: "error", 
      msg: "Todos os campos são obrigatórios" 
    });
  }

  if (formData.senha.length < 6) {
    return res.status(400).json({ 
      status: "error", 
      msg: "A senha deve ter no mínimo 6 caracteres" 
    });
  }

  const payload = {
    nome: formData.nome,
    email: formData.email,
    senha: formData.senha,
    tipo: formData.tipo,
    cpf_cnpj: formData.cpf_cnpj
  };

  try {
    console.log('[ctlUsuario] Enviando para backend:', payload);
    
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/registerUsuario", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    console.log('[ctlUsuario] Resposta do backend:', resp.data);

    if (resp.data) {
      return res.json({ 
        status: "ok", 
        msg: "Cadastro realizado com sucesso!" 
      });
    }
  } catch (error) {
    console.error('[ctlUsuario] Erro ao cadastrar:', error.message);
    if (error.response) {
      console.error('[ctlUsuario] Erro do backend:', error.response.data);
    }
    
    let remoteMSG = "Erro ao cadastrar usuário";
    
    if (error.response) {
      // Captura mensagem de erro específica do backend
      remoteMSG = error.response.data?.error || error.response.data?.msg || error.response.data?.message || remoteMSG;
      
      // Se o erro é relacionado a CPF/CNPJ duplicado, mantém a mensagem original
      if (error.response.status === 400 && (remoteMSG.includes('CPF') || remoteMSG.includes('CNPJ'))) {
        return res.status(400).json({ status: "error", msg: remoteMSG }); 
      }
      
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível. Certifique-se de que o backend está rodando na porta 40000";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(500).json({ status: "error", msg: error.message || remoteMSG }); 
  }
};

module.exports = {
  CadastroPost,
};

