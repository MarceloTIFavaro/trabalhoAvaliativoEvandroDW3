const express = require("express");
const routerApp = express.Router();

// Controllers
const appUsuario = require("../apps/usuario/controller/ctlUsuario");
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
// Aqui o JWT vai ser verificado diretamente pelo ctlUsuario
routerApp.get("/getAllUsuario", appUsuario.AutenticaJWT, appUsuario.getAllUsuario);
routerApp.post("/getUsuarioByID", appUsuario.AutenticaJWT, appUsuario.getUsuarioByID);
routerApp.post("/insertUsuario", appUsuario.AutenticaJWT, appUsuario.insertUsuario);
routerApp.post("/updateUsuario", appUsuario.AutenticaJWT, appUsuario.updateUsuario);
routerApp.post("/deleteUsuario", appUsuario.AutenticaJWT, appUsuario.deleteUsuario);

// --------------------
// ROTAS DE AUTENTICAÇÃO
// --------------------
routerApp.post("/login", appUsuario.loginUsuario); 
routerApp.post("/logout", appUsuario.logoutUsuario);

// --------------------
// ROTAS DE CONTAS A PAGAR
// --------------------
routerApp.get("/getAllContasPagar", appUsuario.AutenticaJWT, appContasPagar.getAllContasPagar);
routerApp.post("/getContasPagarByID", appUsuario.AutenticaJWT, appContasPagar.getContasPagarByID);
routerApp.post("/getContasPagarByUsuario", appUsuario.AutenticaJWT, appContasPagar.getContasPagarByUsuario);
routerApp.post("/insertContasPagar", appUsuario.AutenticaJWT, appContasPagar.insertContasPagar);
routerApp.post("/updateContasPagar", appUsuario.AutenticaJWT, appContasPagar.updateContasPagar);
routerApp.post("/deleteContasPagar", appUsuario.AutenticaJWT, appContasPagar.deleteContasPagar);
routerApp.post("/marcarContaComoPaga", appUsuario.AutenticaJWT, appContasPagar.marcarContaComoPaga);

// --------------------
// ROTAS DE PARCELAS
// --------------------
routerApp.get("/getAllParcelas", appUsuario.AutenticaJWT, appParcelas.getAllParcelas);
routerApp.post("/getParcelasById", appUsuario.AutenticaJWT, appParcelas.getParcelasById);
routerApp.post("/getParcelasByContaPagar", appUsuario.AutenticaJWT, appParcelas.getParcelasByConta);
routerApp.post("/insertParcelas", appUsuario.AutenticaJWT, appParcelas.insertParcelas);
routerApp.post("/updateParcelas", appUsuario.AutenticaJWT, appParcelas.updateParcelas);
routerApp.post("/deleteParcelas", appUsuario.AutenticaJWT, appParcelas.deleteParcelas);
routerApp.post("/marcarParcelaComoPaga", appUsuario.AutenticaJWT, appParcelas.marcarParcelaComoPaga);

module.exports = routerApp;
