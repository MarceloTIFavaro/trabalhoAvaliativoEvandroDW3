const axios = require("axios"); // importa a biblioteca axios 

// Essa função garante a atenticação das requisições usando o token JWT
const getAuthHeaders = (req) => { // Essa função monta os cabecalhos(headers) que serão enviados pelas requisições feitas pelo axios. O parametro REQ contem informações da requisição atual 
  const token = req.session?.userToken; // ele acessa a sessão do usuario e coleta o token jwt que foi ali armazenado quando o usuario fez o login
  return { // Montagem do objeto que armazena os cabeçalhos que serão enviados juntos a requisição 
    "Content-Type": "application/json", // indica que o corpo da requisição(os dados enviados) estão no formato json 
    "Authorization": token ? `Bearer ${token}` : "" // Define o header de autenticação, se não houver token ele retorna uma string vazia 
  };
};

const GerenciarContas = async (req, res) => { // É uma função assincrona que possui dois parametros REQ(contém os dados da requisição, sessão, parametros, cookies e etc) e RES(É usado para enviar uma resposta ao cliente, nessa função serve para rendenizar a pagina vwContas)
  userName = req.session.userName; // Pega o user name da sessão atual e armazena em userName
  userType = req.session.userType; // Pega tipo de usuario e armazena em userType
  userId = req.session.userId; // Pega o id do usuario e armazena em userId
  
  // Aqui está sendo criado um objeto javaScript(parametros) com informações que serão enviadas para a pagina de contas a pagar 
  parametros = { 
    title: 'Gerenciar Contas', 
    Usuario: userName,
    TipoUsuario: userType,
    IdUsuario: userId
  };

  res.render('contas_pagar/view/vwContas.njk', { parametros }); // re.render função do express responsavel por rendenizar uma pagina 
};

const ListarContas = async (req, res) => { // É uma função assincrona que possui dois parametros REQ(contém os dados da requisição, sessão, parametros, cookies e etc) e RES(É usado para enviar uma resposta ao cliente, nessa função serve para rendenizar a pagina vwContas)
  try {
    const userId = req.session.userId; // pega o id da sessão atual ou seja do usuario logado e armazena em userId
    
    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/getContasPagarByUsuario", { //o axios.post faz uma requisição post ao back-end, depois é definido o endereço do servidor que vem das variaveis de ambiente do .env e chama a função /getContasPagarByUsuario
      // tudo aqui em baixo faz parte do corpo da requisição
      id_usuario: userId // passa o id do usuario para o back-end saber de quem buscar as contas
    }, {
      headers: getAuthHeaders(req), //passa a função getAuthHeaders, garantindo a autenticação das requisições.
      timeout: 5000, // tempo maximo de 5s para receber uma resposta 
    });

    return res.json({ // enviamos os dados através do res e com o .json os transformamos em json
      status: "ok", 
      contas: resp.data // resp contém toda a resposta da requisição enquanto data possui só os dados 
    });
  } catch (error) { // é acionado quando ocorre algum erro no try 
    let remoteMSG = "Erro ao listar contas"; // Mensagem de erro padrão 
    
    if (error.response) {// Se o servidor respondeu mas indicou erro 
      remoteMSG = error.response.data?.error || remoteMSG;// tenta pegar a mensagem de erro se não usa a padrão 
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); // retorna o código de erro e a mensagem e o status em formato json 
    }
    if (error.code === "ECONNREFUSED") { // Quando o axios não conseguir se conectar ao servidor (ECONNREFUSED significa conexão recusada)
      remoteMSG = "Servidor indisponível"; // mensagem padrão 
      return res.status(503).json({ status: "error", msg: remoteMSG }); // Envia o código de serviço indisponivel(503) o status de erro e mensagem de erro padrão 
    }
    
    // Se o erro não for uma resposta do servidor nem falha de conexão, então é enviado um código de erro generico como requisição invalida, o status de errro e a mensagem padrão de erro 
    return res.status(400).json({ status: "error", msg: remoteMSG });  
  }
};

const CriarConta = async (req, res) => { 
  // É uma função assíncrona (usa async/await) com dois parâmetros:
  // REQ → contém os dados da requisição (como corpo, sessão, parâmetros e cookies).
  // RES → é o objeto usado para enviar uma resposta ao cliente (no caso, envia um JSON com o resultado da operação).
    
    try {
    const formData = req.body; // contém os dados vindos do front end 
    const userId = req.session.userId; // pega o id da sessão ou seja do usuario logado 
    
    const payload = { // Montagem de um objeto que será enviado ao backend com dados organizados e prontos para gravação
      descricao: formData.descricao, // pega a descrição
      valor: parseFloat(formData.valor), // pega o valor 
      data_vencimento: formData.data_vencimento, // pega a data de vencimento
      status: formData.status || 'Pendente', // pega o status 
      id_usuario: userId // pega o id do usuario 
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/insertContasPagar", payload, {//aqui ele envia uma requisição para a função insert contas a pagar no backend com os dados do payload
      headers: getAuthHeaders(req), // chama a função getAuthHeaders para garantir a autenticação das requisiçõe usando o token JWT
      timeout: 5000, // tempo maximo de 5s para receber uma resposta 
    });

    return res.json({ // O res.json envia uma resposta em formado json para o front-end com dados abaixo 
      status: "ok", 
      msg: "Conta criada com sucesso!",
      conta: resp.data // contem os dados retornados pelo backend
    });
  } catch (error) {// Caso ocorra algum erro 
    let remoteMSG = "Erro ao criar conta"; // mensagem padrão 
    
    if (error.response) { // Se o servidor respondeu mas indicou erro 
      remoteMSG = error.response.data?.error || remoteMSG; // tenta pegar a mensagem de erro se não usa a padrão 
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); // retorna o código de erro e a mensagem e o status em formato json 
    }
    if (error.code === "ECONNREFUSED") { // Quando o axios não conseguir se conectar ao servidor (ECONNREFUSED significa conexão recusada)
      remoteMSG = "Servidor indisponível"; // nova mensagem padrão
      return res.status(503).json({ status: "error", msg: remoteMSG });  // Envia o código de serviço indisponivel(503) o status de erro e mensagem de erro padrão 
    }
    
    // Se o erro não for uma resposta do servidor nem falha de conexão, então é enviado um código de erro generico como requisição invalida, o status de errro e a mensagem padrão de erro 
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const AtualizarConta = async (req, res) => {
  // É uma função assíncrona (usa async/await) com dois parâmetros:
  // REQ → contém os dados da requisição (como corpo, sessão, parâmetros e cookies).
  // RES → é o objeto usado para enviar uma resposta ao cliente (no caso, envia um JSON com o resultado da operação).

  try {
    const formData = req.body; // contém os dados vindos do front end 
    
    const payload = { // Montagem de um objeto que será enviado ao backend com dados organizados e prontos para gravação
      id_contas: formData.id_contas, // pega o id das contas
      descricao: formData.descricao, // pega a descrição das contas
      valor: parseFloat(formData.valor), // pega o valor das contas
      data_vencimento: formData.data_vencimento, // pega as datas de vencimento das contas
      status: formData.status // pega o status da conta 
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/updateContasPagar", payload, { //aqui ele envia uma requisição para a função update contas a pagar no backend com os dados do payload  
      headers: getAuthHeaders(req), // chama a função getAuthHeaders para garantir a autenticação das requisiçõe usando o token JWT
      timeout: 5000, // tempo maximo de 5s para receber uma resposta
    });

    return res.json({ // O res.json envia uma resposta em formado json para o front-end com dados abaixo 
      status: "ok", 
      msg: "Conta atualizada com sucesso!",
      conta: resp.data // contem os dados retornados pelo backend 
    });
  } catch (error) { // Caso ocorra algum erro 
    let remoteMSG = "Erro ao atualizar conta"; // Mensagem padrão 
    
    if (error.response) { //Se o servidor respondeu mas indicou erro
      remoteMSG = error.response.data?.error || remoteMSG; // tenta pegar a mensagem de erro se não usa a padrão
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); //// retorna o código de erro e a mensagem e o status em formato json 
    }
    if (error.code === "ECONNREFUSED") { // Quando o axios não conseguir se conectar ao servidor (ECONNREFUSED significa conexão recusada)
      remoteMSG = "Servidor indisponível"; // mova mensagem padrão definida
      return res.status(503).json({ status: "error", msg: remoteMSG }); // Envia o código de serviço indisponivel(503) o status de erro e mensagem de erro padrão 
    }
    
    //// Se o erro não for uma resposta do servidor nem falha de conexão, então é enviado um código de erro generico como requisição invalida, o status de errro e a mensagem padrão de erro 
    return res.status(400).json({ status: "error", msg: remoteMSG });
  }
};

const DeletarConta = async (req, res) => {
  // É uma função assíncrona (usa async/await) com dois parâmetros:
  // REQ → contém os dados da requisição (como corpo, sessão, parâmetros e cookies).
  // RES → é o objeto usado para enviar uma resposta ao cliente (no caso, envia um JSON com o resultado da operação).


  try {
    const formData = req.body; // contém os dados vindos do front-end (neste caso, o ID da conta que será deletada)
    
    const payload = { // Montagem do objeto que será enviado ao backend
      id_contas: formData.id_contas // pega o ID da conta a ser excluída
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/deleteContasPagar", payload, {
      // Envia uma requisição HTTP POST para o endpoint "/deleteContasPagar" no backend,
      // passando o payload no corpo da requisição para informar qual conta deve ser deletada.
      headers: getAuthHeaders(req), // chama a função getAuthHeaders para garantir a autenticação da requisição usando o token JWT
      timeout: 5000, // define o tempo máximo de 5 segundos para receber uma resposta do backend
    });

    return res.json({ 
      // O res.json envia uma resposta em formato JSON de volta para o front-end com os dados abaixo:
      status: "ok", 
      msg: "Conta deletada com sucesso!" // mensagem de sucesso informando que a conta foi excluída
    });
  } catch (error) { // Caso ocorra algum erro durante a execução do try
    let remoteMSG = "Erro ao deletar conta"; // Mensagem padrão de erro
    
    if (error.response) {  // Se o servidor respondeu, mas retornou um erro (por exemplo, 400 ou 500)
      remoteMSG = error.response.data?.error || remoteMSG; // tenta obter a mensagem específica de erro enviada pelo backend; se não houver, usa a padrão
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); // retorna o mesmo código de status do backend, com o status "error" e a mensagem em formato JSON
    }
    if (error.code === "ECONNREFUSED") {  // Quando o Axios não consegue se conectar ao servidor (ECONNREFUSED = conexão recusada)
      remoteMSG = "Servidor indisponível"; // define uma mensagem específica para esse tipo de erro
      return res.status(503).json({ status: "error", msg: remoteMSG }); // Envia o código HTTP 503 (Serviço Indisponível), o status "error" e a mensagem de erro ao front-end
    }
    
    // Se o erro não for uma resposta do servidor nem falha de conexão,
    // envia um erro genérico (400 - Requisição inválida) com o status e a mensagem padrão de erro
    return res.status(400).json({ status: "error", msg: remoteMSG }); 
  }
};

const PagarConta = async (req, res) => {
  // É uma função assíncrona (usa async/await) com dois parâmetros:
  // REQ → contém os dados da requisição (como corpo, sessão, parâmetros e cookies).
  // RES → é o objeto usado para enviar uma resposta ao cliente (no caso, envia um JSON com o resultado da operação).

  try {
    const formData = req.body; // contém os dados vindos do front-end (neste caso, o ID da conta que será marcada como paga)
    
    const payload = { // Montagem do objeto que será enviado ao backend
      id_contas: formData.id_contas // pega o ID da conta que deve ser marcada como paga
    };

    const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/marcarContaComoPaga", payload, {
      // Envia uma requisição HTTP POST para o endpoint "/marcarContaComoPaga" no backend,
      // passando o payload no corpo da requisição para informar qual conta deve ser marcada como paga.
      headers: getAuthHeaders(req), // chama a função getAuthHeaders para garantir a autenticação da requisição usando o token JWT
      timeout: 5000, // define o tempo máximo de 5 segundos para receber uma resposta do backend
    });

    return res.json({ 
      // O res.json envia uma resposta em formato JSON de volta para o front-end com os dados abaixo:
      status: "ok", 
      msg: "Conta marcada como paga!", // mensagem de sucesso informando que a conta foi marcada como paga
      conta: resp.data.conta // contém os dados retornados pelo backend referentes à conta atualizada
    });
  } catch (error) { // Caso ocorra algum erro durante a execução do try
    let remoteMSG = "Erro ao marcar conta como paga"; // Mensagem padrão de erro
    
    if (error.response) {  // Se o servidor respondeu, mas retornou um erro (por exemplo, 400 ou 500)
      remoteMSG = error.response.data?.error || remoteMSG; // tenta obter a mensagem específica de erro enviada pelo backend; se não houver, usa a padrão
      return res.status(error.response.status).json({ status: "error", msg: remoteMSG }); // retorna o mesmo código de status do backend, com o status "error" e a mensagem em formato JSON
    }
    if (error.code === "ECONNREFUSED") {  // Quando o Axios não consegue se conectar ao servidor (ECONNREFUSED = conexão recusada)
      remoteMSG = "Servidor indisponível"; // define uma mensagem específica para esse tipo de erro
      return res.status(503).json({ status: "error", msg: remoteMSG }); // Envia o código HTTP 503 (Serviço Indisponível), o status "error" e a mensagem de erro ao front-end
    }
    
    // Se o erro não for uma resposta do servidor nem falha de conexão,
    // envia um erro genérico (400 - Requisição inválida) com o status e a mensagem padrão de erro
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
// essas são as funções que serão exportadas para poderem ser utilizadas em outros modulos 