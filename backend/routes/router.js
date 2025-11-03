const express = require("express");
const routerApp = express.Router();

// Controllers
const appUsuario = require("../apps/usuario/controller/ctlUsuario");
const appLogin = require("../apps/login/controller/ctlLogin");
const appContasPagar = require("../apps/contas_pagar/controller/ctlContasPagar");
const appParcelas = require("../apps/parcelas/controller/ctlParcelas");

// Middleware global (log de requisições)
routerApp.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// --------------------
// ROTA PRINCIPAL
// --------------------
routerApp.get("/", (req, res) => {
  res.send("API rodando com sucesso!");
});

// --------------------
// ROTAS DE USUÁRIO
// --------------------
// Aqui o JWT vai ser verificado pelo ctlLogin
routerApp.get("/getAllUsuario", appLogin.AutenticaJWT, appUsuario.getAllUsuario);
routerApp.post("/getUsuarioByID", appLogin.AutenticaJWT, appUsuario.getUsuarioByID);
routerApp.post("/insertUsuario", appLogin.AutenticaJWT, appUsuario.insertUsuario);
routerApp.post("/updateUsuario", appLogin.AutenticaJWT, appUsuario.updateUsuario);
routerApp.post("/deleteUsuario", appLogin.AutenticaJWT, appUsuario.deleteUsuario);

// --------------------
// ROTAS DE AUTENTICAÇÃO
// --------------------
routerApp.post("/login", appLogin.loginUsuario); 
routerApp.post("/logout", appLogin.logoutUsuario);

// --------------------
// ROTAS DE CONTAS A PAGAR
// --------------------
routerApp.get("/getAllContasPagar", appLogin.AutenticaJWT, appContasPagar.getAllContasPagar);
routerApp.post("/getContasPagarByID", appLogin.AutenticaJWT, appContasPagar.getContasPagarByID);
routerApp.post("/getContasPagarByUsuario", appLogin.AutenticaJWT, appContasPagar.getContasPagarByUsuario);
routerApp.post("/insertContasPagar", appLogin.AutenticaJWT, appContasPagar.insertContasPagar);
routerApp.post("/updateContasPagar", appLogin.AutenticaJWT, appContasPagar.updateContasPagar);
routerApp.post("/deleteContasPagar", appLogin.AutenticaJWT, appContasPagar.deleteContasPagar);
routerApp.post("/marcarContaComoPaga", appLogin.AutenticaJWT, appContasPagar.marcarContaComoPaga);

// --------------------
// ROTAS DE PARCELAS
// --------------------
routerApp.get("/getAllParcelas", appLogin.AutenticaJWT, appParcelas.getAllParcelas);
routerApp.post("/getParcelasById", appLogin.AutenticaJWT, appParcelas.getParcelasById);
routerApp.post("/getParcelasByContaPagar", appLogin.AutenticaJWT, appParcelas.getParcelasByConta);
routerApp.post("/insertParcelas", appLogin.AutenticaJWT, appParcelas.insertParcelas);
routerApp.post("/updateParcelas", appLogin.AutenticaJWT, appParcelas.updateParcelas);
routerApp.post("/deleteParcelas", appLogin.AutenticaJWT, appParcelas.deleteParcelas);
routerApp.post("/marcarParcelaComoPaga", appLogin.AutenticaJWT, appParcelas.marcarParcelaComoPaga);
routerApp.post("/gerarParcelas", appLogin.AutenticaJWT, appParcelas.gerarParcelas);

module.exports = routerApp;
