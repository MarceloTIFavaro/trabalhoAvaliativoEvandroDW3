const axios = require("axios");

const GerenciarContas = async (req, res) => {
  userName = req.session.userName;
  userType = req.session.userType;
  userId = req.session.userId;
  
  parametros = { 
    title: 'Gerenciar Contas', 
    Usuario: userName,
    TipoUsuario: userType,
    IdUsuario: userId
  };

  res.render('contas_pagar/view/vwContas.njk', { parametros });
};

const ListarContas = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/getContasPagarByUsuario", {
      id_usuario: userId
    }, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      contas: resp.data 
    });
  } catch (error) {
    let remoteMSG = "Erro ao listar contas";
    
    if (error.response) {
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const CriarConta = async (req, res) => {
  try {
    const formData = req.body;
    const userId = req.session.userId;
    
    const payload = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      status: formData.status || 'Pendente',
      id_usuario: userId
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/insertContasPagar", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: "Conta criada com sucesso!",
      conta: resp.data 
    });
  } catch (error) {
    let remoteMSG = "Erro ao criar conta";
    
    if (error.response) {
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const AtualizarConta = async (req, res) => {
  try {
    const formData = req.body;
    
    const payload = {
      id_contas: formData.id_contas,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data_vencimento: formData.data_vencimento,
      status: formData.status
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/updateContasPagar", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: "Conta atualizada com sucesso!",
      conta: resp.data 
    });
  } catch (error) {
    let remoteMSG = "Erro ao atualizar conta";
    
    if (error.response) {
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const DeletarConta = async (req, res) => {
  try {
    const formData = req.body;
    
    const payload = {
      id_contas: formData.id_contas
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/deleteContasPagar", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: "Conta deletada com sucesso!" 
    });
  } catch (error) {
    let remoteMSG = "Erro ao deletar conta";
    
    if (error.response) {
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const PagarConta = async (req, res) => {
  try {
    const formData = req.body;
    
    const payload = {
      id_contas: formData.id_contas
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/marcarContaComoPaga", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: "Conta marcada como paga!",
      conta: resp.data.conta
    });
  } catch (error) {
    let remoteMSG = "Erro ao marcar conta como paga";
    
    if (error.response) {
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

module.exports = {
  GerenciarContas,
  ListarContas,
  CriarConta,
  AtualizarConta,
  DeletarConta,
  PagarConta,
};

