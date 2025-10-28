const mdlContasPagar = require("../model/mdlContasPagar");


// Listar todas as contas 
const getAllContasPagar = async (req, res) => {
    try {
        const contasPagar = await mdlContasPagar.getAllContasPagar();
        res.status(200).json(contasPagar);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contas", details: error.message });
    }
};


// Buscar conta por ID 
const getContasPagarByID = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const conta = await mdlContasPagar.getContasPagarByID(id_contas);

        if (!conta) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }

        res.status(200).json(conta);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar conta", details: error.message });
    }
};

// Buscar contas por usuário
const getContasPagarByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.body;
        let contas = await mdlContasPagar.getContasPagarByUsuario(id_usuario);
        
        // Aplicar verificação automática de status para cada conta
        contas = contas.map(conta => mdlContasPagar.verificarStatusAutomatico(conta));
        
        res.status(200).json(contas);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contas do usuário", details: error.message });
    }
};


// Criar nova conta 
const insertContasPagar = async (req, res) => {
    try {
        const dados = req.body;
        // Forçar status como 'Pendente' ao criar uma nova conta
        dados.status = 'Pendente';
        const novaConta = await mdlContasPagar.insertContasPagar(dados);
        res.status(201).json(novaConta);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar conta", details: error.message });
    }
};


// Atualizar conta 
const updateContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const dados = req.body;
        
        // Buscar a conta atual para manter o status de "Pago" se já estiver pago
        const contaAtual = await mdlContasPagar.getContasPagarByID(id_contas);
        
        if (!contaAtual) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }
        
        // Se a conta já está paga, manter como pago. Caso contrário, recalcular
        if (contaAtual.status === 'Pago') {
            dados.status = 'Pago';
        } else {
            // Recalcular status baseado na nova data de vencimento
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataVencimento = new Date(dados.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            
            dados.status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';
        }
        
        const contaAtualizada = await mdlContasPagar.updateConstasPagar(id_contas, dados);

        if (!contaAtualizada) {
            return res.status(404).json({ error: "Conta não encontrada para atualizar" });
        }

        res.status(200).json(contaAtualizada);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar conta", details: error.message });
    }
};


// Deletar conta 
const deleteContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const resultado = await mdlContasPagar.deleteContasPagar(id_contas);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar conta", details: error.message });
    }
};

// Marcar conta como paga
const marcarContaComoPaga = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const contaPaga = await mdlContasPagar.marcarContaComoPaga(id_contas);
        
        if (!contaPaga) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }
        
        res.status(200).json({ 
            message: "Conta marcada como paga com sucesso",
            conta: contaPaga 
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao marcar conta como paga", details: error.message });
    }
};


module.exports = {
    getAllContasPagar,
    getContasPagarByID,
    getContasPagarByUsuario,
    insertContasPagar,
    updateContasPagar,
    deleteContasPagar,
    marcarContaComoPaga,
};
