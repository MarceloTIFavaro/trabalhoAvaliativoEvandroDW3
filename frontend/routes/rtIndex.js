var express = require('express'); // importa o framework Express
var router = express.Router(); //cria uma instancia do exprees para gerenciar as rotas dos modulos login e usuario 
var loginApp = require("../apps/login/controller/ctlLogin"); // a variavel loginApp está recebendo as funções que estão dentro de ctlLogin
var usuarioApp = require("../apps/usuario/controller/ctlUsuario"); // a variavel usuarioApp está recebendo as funções que estão dentro de ctlUsuario

//@ Função necessária para evitar que usuários não autenticados acessem o sistema.
function authenticationMiddleware(req, res, next) { // middleware função interna do express usado para para verificar, modificar ou bloquear requições. Parametros REQ(objeto da requisição, traz dados do usuario, cookies, sessão e etc), RES(Objeto da resposta, envia algo de volta ao cliente) e NEXT(função que passa a requisição adiante, ou seja, a rota)
  // Pega uma informação da sessão, no caso o valor da variavel isLogged que pode ser true(logado) ou false(não logado)
  isLogged = req.session.isLogged;

  // Se o usuario não estiver logado ele redireciona para a tela de login
  if (!isLogged) {
    return res.redirect("/Login");
  }

  // se estiver logado o middleware permite continuar
  next();
}

/* GET home page - Dashboard */
router.get('/', authenticationMiddleware, function (req, res, next) {
  // Utilizando a instância do Express e a função GET, esta rota será acessada para exibir a página inicial(/),
  // O middleware authenticationMiddleware é aplicado para garantir que apenas usuários autenticados 
  // possam acessar a rota.
  // Por fim é executada a função abaixo 

  userName = req.session.userName; 
  // Pega o user name da sessão atual e armazena em userName
  userType = req.session.userType;
  // Pega o userType da sessão atual e armazena em userType
  userId = req.session.userId;
  // Pega o userId da sessão atual e armazena em userId
  
  // Aqui está sendo criado um objeto javaScript(parametros) com informações que serão enviadas para a pagina inicial(/)
  parametros = { 
    title: 'Dashboard - Contas a Pagar', 
    Usuario: userName,
    TipoUsuario: userType,
    IdUsuario: userId
  };

  // Aqui ele rendeniza a pagina inicial passando os valores da sessão por parametro
  res.render('home/view/index.njk', { parametros });
});

/* GET login page */
router.get('/Login', loginApp.Login);
// Utilizando a instância do Express e o método GET, esta rota é responsável por exibir a página de login do sistema.
// O caminho definido é "/Login".
// Quando o usuário acessa essa rota, é executada a função loginApp.Login, localizada no controller de login (ctlLogin.js).
// Essa função normalmente renderiza a tela de login, permitindo que o usuário insira suas credenciais.

/* POST login page */
router.post('/Login', loginApp.Login);
// Aqui utilizamos o método POST, que é usado para enviar dados ao servidor.
// O caminho definido é "/Login".
// Esta rota também utiliza a função loginApp.Login, mas neste caso ela é acionada quando o usuário envia o formulário de login.
// A função valida as credenciais (usuário e senha) e, se estiverem corretas, cria uma sessão e redireciona o usuário para o sistema.

/* GET logout page */
router.get('/Logout', loginApp.Logout);
// Esta rota utiliza o método GET e é responsável por realizar o logout do usuário.
// O caminho definido é "/Logout".
// Quando acessada, a função loginApp.Logout é executada, encerrando a sessão do usuário atual
// e redirecionando-o para a página de login, garantindo que ele saia com segurança do sistema.

/* POST cadastro direto do login */
router.post('/Cadastro', usuarioApp.CadastroPost);
// Aqui utilizamos o método POST, pois o objetivo é enviar informações de cadastro ao servidor.
// O caminho definido é "/Cadastro".
// O controller chamado é usuarioApp.CadastroPost, localizado em ctlUsuario.js.
// Essa função processa os dados enviados pelo formulário de cadastro (nome, email, senha, etc.),
// realiza a criação de um novo usuário no sistema e retorna uma resposta informando o sucesso ou falha da operação.

module.exports = router;
// ele permite exportar para outros modulos o objeto router que contém as rotas
