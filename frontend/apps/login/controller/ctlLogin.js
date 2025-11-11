const axios = require("axios"); // Está importando a biblioteca axios 

const Login = async (req, res) => {
  // É uma função assíncrona (usa async/await) com dois parâmetros:
  // REQ → contém os dados da requisição (como corpo, sessão, parâmetros e cookies).
  // RES → é o objeto usado para enviar uma resposta ao cliente (no caso, envia um JSON com o resultado da operação).
  
  let remoteMSG = "sem mais informações";// define a mensagem padrão 
  
  if (req.method == "POST") { // se o metodo definido na requisição recebida for post ele então executa o código 
    const formData = req.body; // contém os dados vindos do front-end (neste caso, o ID da conta que será deletada)
    
    // Validação básica
    if (!formData.email || !formData.senha) { // verifica se email e senha não foram preenchidos
      return res.status(400).json({ status: "error", msg: "Email e senha são obrigatórios" }); // não tendo sido preenchidos retornan código 400 de erro, status de erro e uma mensagem de erro 
    }

    const payload = { // monta um objeto com os dados que serão enviados ao backend para autenticação do usuario  
      email: formData.email,
      senha: formData.senha,
    };

    try {
      const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/login", payload, {
        // Envia uma requisição HTTP POST ao endpoint "/login" do backend,
        // passando o payload (email e senha) no corpo da requisição.
        headers: {
          "Content-Type": "application/json", // defini que o corpo da requisição está em json
        },
        timeout: 5000, // tempo maximo de 5 s para a resposta do servidor 

      });

      // verifica se o bachend retornou dados validos apos a requisição 
      if (resp.data && resp.data.usuario) {
        const usuario = resp.data.usuario; // pega os dados do usuario 

        //criação e configuração da sessão do usuário autenticado
        session = req.session; 
        session.isLogged = true; // define o usuario como logado
        session.userName = usuario.nome; // pega o nome do usuario
        session.userEmail = usuario.email; // pega o email
        session.userId = usuario.id_user; // pega o id
        session.userType = usuario.tipo; // pega o tipo de usuario 
        session.userCpfCnpj = usuario.cpf_cnpj; // pega cpf ou cnpj
        session.userToken = resp.data.token; // Armazenar o token JWT
        session.tempoInativoMaximoFront = process.env.tempoInativoMaximoFront; // pega o tempo maximo de inatividade permitida no front end
        
        // cria um cookie no navegador com o tempo maximo de inatividade
        res.cookie("tempoInativoMaximoFront", process.env.tempoInativoMaximoFront, { sameSite: 'strict' });
        
        return res.json({  // retorna uma respota ao front end indicando sucesso de login, com o nome e o tipo de usuario 
          status: "ok", 
          msg: "Login com sucesso!", 
          username: session.userName,
          tipo: session.userType 
        });
      }
    } catch (error) {
      // Bloco de tratamento de erros (executado caso algo dê errado no try)
      
      if (error.response && error.response.status === 401) {
        // Caso o backend retorne erro 401 (não autorizado) → usuário ou senha incorretos
        remoteMSG = error.response.data?.error || "Usuário não autenticado";
        return res.status(401).json({ status: "error", msg: remoteMSG }); 
      }

      if (error.code === "ECONNREFUSED") {
        // Caso o Axios não consiga se conectar ao servidor backend (conexão recusada)
        remoteMSG = "Servidor indisponível";
        return res.status(503).json({ status: "error", msg: remoteMSG }); 
      }

      if (error.response && error.response.status === 404) {
        // Caso o backend retorne erro 404 (usuário não encontrado)
        remoteMSG = "Usuário não encontrado";
        return res.status(404).json({ status: "error", msg: remoteMSG }); 
      }
      
      // Tratamento genérico: caso o erro não se enquadre em nenhum dos anteriores
      remoteMSG = error.message || "Erro ao fazer login";
      return res.status(400).json({ status: "error", msg: remoteMSG }); 
    }
  } else {
    // Caso o método da requisição não seja POST, significa que o usuário está apenas acessando a página de login (GET)
    var parametros = { 
      title: "Contas a Pagar - Login" // Define o título que será exibido na página de login
    };

    // Renderiza a página de login (vwLogin.njk), passando o título como parâmetro
    res.render("login/view/vwLogin.njk", parametros);
  }
};

// Função para encerrar login 
function Logout(req, res) {
  session = req.session; // está armazenando os dados da sessão atual 
  session.isLogged = false;
  session.userName = false;
  session.userId = false;
  session.userType = false;
  session.userToken = false;
  session.tempoInativoMaximoFront = false;
  //limpou todas as informações da sessão 

  req.session.destroy(); // remove a sessão do servidor
  res.clearCookie("tempoInativoMaximoFront"); // remove o cookie tempoInativoMaximoFront
  res.redirect("/Login"); // redireciona o usuário para a página de login
}

module.exports = {
  Login,
  Logout,
};
// aqui são as funções que serão exportadas para outros modulos 
