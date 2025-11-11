// importa a biblioteca axios, que é usada para fazer requisições HTTP (chamar a API do backend)
const axios = require("axios");

// Função auxiliar para obter o cabeçalho de autenticação
// Esta função é chamada por outros controllers (como o ctlContasPagar) que precisam de autenticação.
// A rota de cadastro (/Cadastro) é pública, então ela não utiliza esta função.
const getAuthHeaders = (req) => {
  // Pega o token do usuário que foi salvo na sessão (req.session.userToken) no momento do login
  const token = req.session?.userToken;
  // Retorna o objeto de cabeçalho formatado no padrão "Bearer", que o backend exige para rotas protegidas
  return {
    "Content-Type": "application/json",
    // Envia o token no cabeçalho Authorization. O backend usará isso para verificar a autenticidade.
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

// Esta é a função (controller) que lida com a rota POST /Cadastro (definida no rtIndex.js)
// Ela é chamada quando o usuário submete o formulário de cadastro na tela de login (vwLogin.js)
const CadastroPost = async (req, res) => {
  // Pega os dados enviados pelo JavaScript do navegador (nome, email, etc.)
  // 'req.body' é o "corpo" da requisição, onde o formulário envia os dados.
  const formData = req.body;
  
  // Um log interno para ver no console do servidor FRONTEND o que ele recebeu do navegador
  console.log('[ctlUsuario] Dados recebidos:', formData);
  
  // --- VALIDAÇÕES (PRIMEIRO FILTRO NO FRONTEND) ---
  // Validação básica para garantir que todos os campos obrigatórios foram preenchidos
  if (!formData.nome || !formData.email || !formData.senha || !formData.tipo || !formData.cpf_cnpj) {
    // Se faltar algum, retorna uma resposta de erro (status 400 - Bad Request) para o navegador e encerra a execução.
    return res.status(400).json({ 
      status: "error", 
      msg: "Todos os campos são obrigatórios" 
    });
  }

  // Validação de segurança simples para a senha
  if (formData.senha.length < 6) {
    // Retorna um erro se a senha for muito curta
    return res.status(400).json({ 
      status: "error", 
      msg: "A senha deve ter no mínimo 6 caracteres" 
    });
  }
  // --- FIM VALIDAÇÕES ---

  // Cria o objeto 'payload' limpo, contendo apenas os dados que serão enviados para a API do Backend.
  // Isso garante que apenas os campos necessários e esperados pelo backend sejam enviados.
  const payload = {
    nome: formData.nome,
    email: formData.email,
    senha: formData.senha,
    tipo: formData.tipo,
    cpf_cnpj: formData.cpf_cnpj
  };

  // Inicia um bloco 'try' para tentar fazer a chamada ao backend. Se falhar, o 'catch' será executado.
  try {
    // Log interno para ver o que o servidor FRONTEND está enviando para o BACKEND
    console.log('[ctlUsuario] Enviando para backend:', payload);
    
    // --- CHAMADA AO BACKEND (A PONTE) ---
    // Usa o axios para fazer a requisição POST para a API do Backend
    // 'process.env.SERVIDOR_BACKEND' pega a URL do backend (ex: http://localhost:40000) do arquivo .env
    // A rota chamada no backend é a "/registerUsuario".
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/registerUsuario", payload, {
      headers: {
        // Informa ao backend que os dados estão sendo enviados no formato JSON.
        // Note que esta rota é pública e não precisa enviar o token de 'getAuthHeaders'.
        "Content-Type": "application/json",
      },
      timeout: 5000, // Define um limite de 5 segundos para a resposta do backend
    });
    // --- FIM CHAMADA AO BACKEND ---

    // Log interno para ver o que o backend respondeu
    console.log('[ctlUsuario] Resposta do backend:', resp.data);

    // Se a resposta do backend veio (resp.data existe) e foi sucesso
    if (resp.data) {
      // Retorna uma resposta JSON de sucesso para o JavaScript do navegador (o vwLogin.js).
      // O vwLogin.js vai receber isso e mostrar o "Toast" de sucesso.
      return res.json({ 
        status: "ok", 
        msg: "Cadastro realizado com sucesso!" 
      });
    }
  } catch (error) {
    // --- TRATAMENTO DE ERROS (Se a chamada ao Backend falhar) ---
    // Se a chamada ao backend falhar (ex: email já existe, backend offline), o código cai aqui
    console.error('[ctlUsuario] Erro ao cadastrar:', error.message);
    if (error.response) {
      // Se o erro foi uma resposta HTTP do backend (ex: erro 400, 500), o backend mandou uma mensagem
      console.error('[ctlUsuario] Erro do backend:', error.response.data);
    }
    
    // Define uma mensagem de erro padrão
    let remoteMSG = "Erro ao cadastrar usuário";
    
    if (error.response) {
      // Tenta pegar a mensagem de erro específica enviada pelo backend (ex: "CPF já cadastrado")
      // Isso é bom para mostrar o erro exato para o usuário no navegador
      remoteMSG = error.response.data?.error || error.response.data?.msg || error.response.data?.message || remoteMSG;
      
      // Se o erro for 400 (Bad Request) e tiver a ver com CPF/CNPJ, repassa a mensagem exata
      if (error.response.status === 400 && (remoteMSG.includes('CPF') || remoteMSG.includes('CNPJ'))) {
        return res.status(400).json({ status: "error", msg: remoteMSG }); 
      }
      
      // Retorna o status de erro e a mensagem do backend para o navegador
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); 
    }
    if (error.code === "ECONNREFUSED") {
      // Erro específico se o servidor backend estiver offline
      remoteMSG = "Servidor indisponível. Certifique-se de que o backend está rodando na porta 40000";
      return res.status(503).json({ status: "error", msg: remoteMSG }); 
    }
    
    // Retorna um erro genérico (ex: timeout) para o navegador
    return res.status(500).json({ status: "error", msg: error.message || remoteMSG }); 
  }
};

// Exporta a função CadastroPost para ser usada no arquivo de rotas (rtIndex.js)
// É assim que o 'rtIndex.js' consegue chamar 'usuarioApp.CadastroPost'
module.exports = {
  CadastroPost,
};