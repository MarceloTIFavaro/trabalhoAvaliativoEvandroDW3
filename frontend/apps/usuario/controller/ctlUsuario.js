const axios = require("axios");

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
    
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/insertUsuario", payload, {
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
      remoteMSG = error.response.data?.error || error.response.data?.message || remoteMSG;
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

