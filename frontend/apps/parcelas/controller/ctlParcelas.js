const axios = require("axios");

// Função auxiliar para obter headers com token JWT
const getAuthHeaders = (req) => {
  const token = req.session?.userToken;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

const ListarParcelas = async (req, res) => {
  try {
    const { id_conta } = req.body;
    
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/getParcelasByContaPagar", {
      id_conta: id_conta
    }, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      parcelas: resp.data 
    });
  } catch (error) {
    let remoteMSG = "Erro ao listar parcelas";
    
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

const PagarParcela = async (req, res) => {
  try {
    const formData = req.body;
    
    const payload = {
      id_parcela: formData.id_parcela
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/marcarParcelaComoPaga", payload, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: "Parcela marcada como paga!",
      parcela: resp.data.parcela
    });
  } catch (error) {
    let remoteMSG = "Erro ao marcar parcela como paga";
    
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

const GerarParcelas = async (req, res) => {
  try {
    const formData = req.body;
    
    const payload = {
      id_conta: formData.id_conta,
      numero_parcelas: formData.numero_parcelas,
      data_inicial: formData.data_inicial
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/gerarParcelas", payload, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    });

    return res.json({ 
      status: "ok", 
      msg: resp.data.message || "Parcelas geradas com sucesso!",
      dados: resp.data
    });
  } catch (error) {
    let remoteMSG = "Erro ao gerar parcelas";
    
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
  ListarParcelas,
  PagarParcela,
  GerarParcelas,
};

