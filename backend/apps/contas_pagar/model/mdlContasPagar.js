const db = require("../../../database/databaseconfig");

// Buscar todas as Contas (não deletadas)
const getAllContasPagar = async () => {
    const { rows } = await db.query("SELECT * FROM contas_a_pagar WHERE deleted = false ORDER BY id_contas")
    return rows;
}

// Buscar Conta ID (não deletada)
const getContasPagarByID = async (id_contas) => { 
    const { rows } = await db.query("SELECT * FROM contas_a_pagar WHERE id_contas = $1 AND deleted = false;",[id_contas]);
    return rows[0];
}

// Buscar contas por usuário (não deletadas)
const getContasPagarByUsuario = async (id_usuario) => {
    const { rows } = await db.query(
        "SELECT * FROM contas_a_pagar WHERE id_usuario = $1 AND deleted = false ORDER BY data_vencimento ASC;",
        [id_usuario]
    );
    return rows;
}

// Criar nova Conta
const insertContasPagar = async (dados) => {
    const { descricao, valor, data_vencimento, status, id_usuario } = dados;
    const { rows } = await db.query(
      `INSERT INTO contas_a_pagar (descricao, valor, data_vencimento, status, id_usuario)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [descricao, valor, data_vencimento, status || 'Pendente', id_usuario]
    );
  
    return rows[0];
}


// Atualizar Conta
const updateConstasPagar = async (id_contas, dados) => {
    const { descricao, valor, data_vencimento, status } = dados;
    const { rows } = await db.query(
        `UPDATE contas_a_pagar
         SET descricao = $1, valor = $2, data_vencimento = $3, status = $4
         WHERE id_contas = $5
         RETURNING *;`,
        [descricao, valor, data_vencimento, status, id_contas]
      );
    
      return rows[0];
}

// Deletar Contas (soft delete)
const deleteContasPagar = async (id_contas) => {
    const { rows } = await db.query("UPDATE contas_a_pagar SET deleted = true WHERE id_contas = $1 AND deleted = false RETURNING *;", [id_contas]);
    return rows.length > 0 
        ? { message: "Conta marcada como deletada com sucesso." }
        : { message: "Conta não encontrada ou já deletada." };
}
 
// Marcar conta como paga (não deletada)
const marcarContaComoPaga = async (id_contas) => {
    const { rows } = await db.query(
        `UPDATE contas_a_pagar
         SET status = 'Pago'
         WHERE id_contas = $1 AND deleted = false
         RETURNING *;`,
        [id_contas]
    );
    return rows[0];
}

// Verificar e atualizar status baseado na data de vencimento
const verificarStatusAutomatico = (conta) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataVencimento = new Date(conta.data_vencimento);
    dataVencimento.setHours(0, 0, 0, 0);
    
    if (conta.status === 'Pago') {
        return conta;
    }
    
    if (dataVencimento < hoje) {
        conta.status = 'Atrasado';
    } else {
        conta.status = 'Pendente';
    }
    
    return conta;
}

// Recalcular status da conta baseado nas parcelas
const recalcularStatusContaBaseadoNasParcelas = async (id_contas) => {
    try {

        const conta = await getContasPagarByID(id_contas);
        if (!conta) {
            return null;
        }

        if (conta.status === 'Pago') {
            return conta;
        }

        const mdlParcelas = require("../../parcelas/model/mdlParcelas");
        const parcelas = await mdlParcelas.getParcelasByContaPagar(id_contas);

        if (!parcelas || parcelas.length === 0) {
            return verificarStatusAutomatico(conta);
        }

        const todasParcelasPagas = parcelas.every(p => p.status === 'Pago' || p.status === 'PAGO' || p.status === 'pago');
        const temParcelasAtrasadas = parcelas.some(p => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const dataVencimento = new Date(p.data_vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            
            const estaAtrasada = dataVencimento < hoje;
            const naoEstaPaga = p.status !== 'Pago' && p.status !== 'PAGO' && p.status !== 'pago';
            
            return estaAtrasada && naoEstaPaga;
        });

        let novoStatus;
        if (todasParcelasPagas) {
            novoStatus = 'Pago';
        } else if (temParcelasAtrasadas) {
            novoStatus = 'Atrasado';
        } else {
            novoStatus = 'Pendente';
        }

        if (conta.status !== novoStatus) {
            const { rows } = await db.query(
                `UPDATE contas_a_pagar
                 SET status = $1
                 WHERE id_contas = $2 AND deleted = false
                 RETURNING *;`,
                [novoStatus, id_contas]
            );
            return rows[0];
        }

        return conta;
    } catch (error) {
        console.error('Erro ao recalcular status da conta:', error);
        throw error;
    }
}

module.exports = {
    getAllContasPagar,
    getContasPagarByID,
    getContasPagarByUsuario,
    insertContasPagar,
    updateConstasPagar,
    deleteContasPagar,
    marcarContaComoPaga,
    verificarStatusAutomatico,
    recalcularStatusContaBaseadoNasParcelas,
}