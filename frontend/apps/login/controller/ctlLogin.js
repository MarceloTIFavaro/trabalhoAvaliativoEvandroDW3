const axios = require("axios");

const Login = async (req, res) => {
  let remoteMSG = "sem mais informações";
  
  if (req.method == "POST") {
    const formData = req.body;
    
    // Validação básica
    if (!formData.email || !formData.senha) {
      return res.status(400).json({ status: "error", msg: "Email e senha são obrigatórios" });
    }

    const payload = {
      email: formData.email,
      senha: formData.senha,
    };

    try {
      const resp = await axios.post(process.env.SERVIDOR_BACKEND + "/login", payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      if (resp.data && resp.data.usuario) {
        const usuario = resp.data.usuario;
        session = req.session;
        session.isLogged = true;
        session.userName = usuario.nome;
        session.userEmail = usuario.email;
        session.userId = usuario.id_user;
        session.userType = usuario.tipo;
        session.userCpfCnpj = usuario.cpf_cnpj;
        session.tempoInativoMaximoFront = process.env.tempoInativoMaximoFront;
        
        res.cookie("tempoInativoMaximoFront", process.env.tempoInativoMaximoFront, { sameSite: 'strict' });
        
        return res.json({ 
          status: "ok", 
          msg: "Login com sucesso!", 
          username: session.userName,
          tipo: session.userType 
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        remoteMSG = error.response.data?.error || "Usuário não autenticado";
        return res.status(401).json({ status: "error", msg: remoteMSG }); 
      }
      if (error.code === "ECONNREFUSED") {
        remoteMSG = "Servidor indisponível";
        return res.status(503).json({ status: "error", msg: remoteMSG }); 
      }
      if (error.response && error.response.status === 404) {
        remoteMSG = "Usuário não encontrado";
        return res.status(404).json({ status: "error", msg: remoteMSG }); 
      }
      
      remoteMSG = error.message || "Erro ao fazer login";
      return res.status(400).json({ status: "error", msg: remoteMSG }); 
    }
  } else {
    // GET - Renderiza a página de login
    var parametros = { 
      title: "Contas a Pagar - Login"
    };
    res.render("login/view/vwLogin.njk", parametros);
  }
};

function Logout(req, res) {
  session = req.session;
  session.isLogged = false;
  session.userName = false;
  session.userId = false;
  session.userType = false;
  session.tempoInativoMaximoFront = false;
  
  req.session.destroy();
  res.clearCookie("tempoInativoMaximoFront");
  res.redirect("/Login");
}

module.exports = {
  Login,
  Logout,
};

