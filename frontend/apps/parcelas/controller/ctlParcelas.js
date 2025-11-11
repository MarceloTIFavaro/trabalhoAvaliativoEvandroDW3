// importa a biblioteca axios, que é usada para fazer requisições HTTP (chamar a API do backend)
const axios = require("axios");

// Função auxiliar para obter o cabeçalho de autenticação
// Ela pega o token JWT que foi salvo na sessão (pelo ctlLogin) e o formata para o backend entender
const getAuthHeaders = (req) => {
  // Pega o token armazenado na sessão do usuário (req.session.userToken)
  // O 'req' aqui é a requisição que veio do NAVEGADOR para o SERVIDOR FRONTEND
  const token = req.session?.userToken;
  // Retorna o objeto de cabeçalho formatado no padrão "Bearer"
  return {
    "Content-Type": "application/json",
    // Envia o token no cabeçalho Authorization. O backend usará isso para verificar a autenticidade.
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

// Função (controller) para listar as parcelas de uma conta específica
// É chamada pelo JavaScript da tela de contas (vwContas.njk), pela rota POST /parcelas/listar (definida em rtParcelas.js)
const ListarParcelas = async (req, res) => {
  try {
    // Pega o id_conta enviado pelo JavaScript do navegador no corpo (body) da requisição
    const { id_conta } = req.body;
    
    // --- CHAMADA AO BACKEND (A PONTE) ---
    // Faz a chamada POST para a API do Backend (ex: http://localhost:40000/getParcelasByContaPagar)
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/getParcelasByContaPagar", {
      id_conta: id_conta // Envia o id_conta no corpo da requisição para o backend saber de qual conta listar as parcelas
    }, {
      // ** IMPORTANTE **
      // Pega o token da SESSÃO do usuário (que está no 'req') e envia no cabeçalho para o BACKEND
      headers: getAuthHeaders(req), 
      timeout: 5000, // Define um tempo limite de 5 segundos
    });

    // Retorna a lista de parcelas em JSON para o JavaScript do navegador (o vwContas.njk)
    return res.json({ 
      status: "ok", 
      parcelas: resp.data 
    });
  } catch (error) {
    // --- TRATAMENTO DE ERROS ---
    let remoteMSG = "Erro ao listar parcelas";
    
    if (error.response) {
      // Se o backend retornou um erro (ex: token inválido, erro 401), usa a mensagem dele
      remoteMSG = error.response.data?.error || remoteMSG;
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      // Se o backend estiver offline
      remoteMSG = "Servidor indisponível";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    // Outro erro qualquer (ex: timeout)
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

// Função (controller) para marcar uma parcela específica como paga
// É chamada pelo JS do vwContas.njk, na função pagarConta(), através da rota POST /parcelas/pagar
const PagarParcela = async (req, res) => {
  try {
    // Pega os dados da requisição (que contém o id_parcela)
    const formData = req.body;
    
    // Monta o payload (carga de dados) para enviar ao backend
    const payload = {
      id_parcela: formData.id_parcela
    };

    // --- CHAMADA AO BACKEND ---
    // Chama a rota /marcarParcelaComoPaga do backend
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/marcarParcelaComoPaga", payload, {
      headers: getAuthHeaders(req), // Envia o token de autenticação
      timeout: 5000,
    });

    // Retorna a resposta de sucesso e os dados da parcela atualizada para o JS do navegador
    return res.json({ 
      status: "ok", 
      msg: "Parcela marcada como paga!",
      parcela: resp.data.parcela
    });
  } catch (error) {
    // --- TRATAMENTO DE ERROS ---
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

// Função (controller) para gerar novas parcelas para uma conta (quando a conta é CRIADA)
// É chamada pelo JS do vwContas.njk, no submit do modal, se for uma conta nova
const GerarParcelas = async (req, res) => {
  try {
    // Pega os dados enviados pelo JS do navegador (id_conta, numero_parcelas, etc.)
    const formData = req.body;
    
    // Monta o payload para enviar ao backend
    const payload = {
      id_conta: formData.id_conta,
      numero_parcelas: formData.numero_parcelas,
      data_inicial: formData.data_inicial,
      intervalo_dias: formData.intervalo_dias || 30 // Define 30 dias como valor padrão se não for enviado
    };

    // --- CHAMADA AO BACKEND ---
    // Chama a rota /gerarParcelas do backend
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/gerarParcelas", payload, {
      headers: getAuthHeaders(req), // Envia o token de autenticação
      timeout: 5000,
    });

    // Retorna a resposta de sucesso para o JS do navegador
    return res.json({ 
      status: "ok", 
      msg: resp.data.message || "Parcelas geradas com sucesso!",
      dados: resp.data
    });
  } catch (error) {
    // --- TRATAMENTO DE ERROS ---
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

// Exporta as funções para serem usadas no arquivo de rotas (rtParcelas.js)
module.exports = {
  ListarParcelas,
  PagarParcela,
  GerarParcelas,
  // Esta função (controller) é chamada quando o usuário EDITA uma conta que já tinha parcelas
  // É chamada pelo JS do vwContas.njk, no submit do modal, se for uma conta existente
  RegerarParcelas: async (req, res) => {
    try {
      // Pega os dados da requisição (id_conta, novo número de parcelas, etc.)
      const formData = req.body;
      const payload = {
        id_conta: formData.id_conta,
        numero_parcelas: formData.numero_parcelas,
        data_inicial: formData.data_inicial,
        intervalo_dias: formData.intervalo_dias || 30 // Padrão de 30 dias
      };

      // --- CHAMADA AO BACKEND ---
      // Chama a rota /regerarParcelas do backend
      // O backend irá apagar as parcelas antigas (soft delete) e criar novas com base nesses dados
      const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/regerarParcelas", payload, {
        headers: getAuthHeaders(req), // Envia o token de autenticação
        timeout: 5000,
      });

      // Retorna a resposta de sucesso
      return res.json({
        status: "ok",
        msg: resp.data.message || "Parcelas regeradas com sucesso!",
        dados: resp.data
      });
    } catch (error) {
      // --- TRATAMENTO DE ERROS ---
      let remoteMSG = "Erro ao regerar parcelas";
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
  },
};