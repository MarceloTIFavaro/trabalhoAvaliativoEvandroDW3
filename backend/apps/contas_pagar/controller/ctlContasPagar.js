const mdlContasPagar = require("../model/mdlContasPagar");

// Função para listar todas as contas a pagar
const getAllContasPagar = async (req, res) => {
    try {
        const contasPagar = await mdlContasPagar.getAllContasPagar();
        res.status(200).json(contasPagar);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contas", details: error.message });
    }
};

// Função para buscar uma conta específica pelo ID
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

// Função para buscar todas as contas vinculadas a um determinado usuário
const getContasPagarByUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.body;
        let contas = await mdlContasPagar.getContasPagarByUsuario(id_usuario);
        
        // Atualiza o status automaticamente com base na data de vencimento
        contas = contas.map(conta => mdlContasPagar.verificarStatusAutomatico(conta));
        
        res.status(200).json(contas);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar contas do usuário", details: error.message });
    }
};

// Função para criar uma nova conta a pagar
const insertContasPagar = async (req, res) => {
    try {
        const dados = req.body;
        // Define o status inicial como 'Pendente'
        dados.status = 'Pendente';
        const novaConta = await mdlContasPagar.insertContasPagar(dados);
        res.status(201).json(novaConta);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar conta", details: error.message });
    }
};

// Função para atualizar os dados de uma conta existente
const updateContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const dados = req.body;
        
        // Busca a conta antes de atualizar para preservar status de pagamento
        const contaAtual = await mdlContasPagar.getContasPagarByID(id_contas);
        
        if (!contaAtual) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }
        
        // Se a conta já estiver paga, mantém o status como 'Pago'
        if (contaAtual.status === 'Pago') {
            dados.status = 'Pago';
        } else {
            // Caso contrário, recalcula o status com base na nova data de vencimento
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

// Função para deletar uma conta a pagar
const deleteContasPagar = async (req, res) => {
    try {
        const { id_contas } = req.body;
        const resultado = await mdlContasPagar.deleteContasPagar(id_contas);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar conta", details: error.message });
    }
};

// Função para marcar uma conta como paga
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
