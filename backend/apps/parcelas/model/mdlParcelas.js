const db = require("../../../database/databaseconfig");

// Buscar todas as Parcelas (ativas)
const getAllParcelas = async () => {
    const { rows } = await db.query(
        "SELECT * FROM parcelas WHERE deleted = false ORDER BY id_parcela;"
    );
    return rows;
};

// Buscar Parcela por ID (desde que não esteja deletada)
const getParcelasById = async (id_parcela) => {
    const { rows } = await db.query(
        "SELECT * FROM parcelas WHERE id_parcela = $1 AND deleted = false;",
        [id_parcela]
    );
    return rows[0];
};

// Buscar Parcelas por Conta (somente as não deletadas)
const getParcelasByContaPagar = async (id_conta) => {
    const { rows } = await db.query(
        "SELECT * FROM parcelas WHERE id_conta = $1 AND deleted = false ORDER BY data_vencimento ASC;",
        [id_conta]
    );
    return rows;
};

// Criar nova Parcela
const insertParcelas = async (dados) => {
    const { numero_parcela, valor, data_vencimento, id_conta, status } = dados;
    const statusFinal = status || 'Pendente';
    const { rows } = await db.query(
        `INSERT INTO parcelas (numero_parcela, valor, data_vencimento, id_conta, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        [numero_parcela, valor, data_vencimento, id_conta, statusFinal]
    );
    return rows[0];
};

// Atualizar Parcela
const updateParcelas = async (id_parcela, dados) => {
    const { status, data_vencimento } = dados;
    const { rows } = await db.query(
        `UPDATE parcelas
         SET status = $1, data_vencimento = $2
         WHERE id_parcela = $3 AND deleted = false
         RETURNING *;`,
        [status, data_vencimento, id_parcela]
    );
    return rows[0];
};

// Deletar (lógico) Parcela
const deleteParcelas = async (id_parcela) => {
    const result = await db.query(
        "UPDATE parcelas SET deleted = true WHERE id_parcela = $1 RETURNING *;",
        [id_parcela]
    );
    return result.rowCount > 0
        ? { message: "Parcela marcada como deletada com sucesso." }
        : { message: "Parcela não encontrada ou já deletada." };
};

// Deletar (lógico) todas as parcelas de uma conta
const deleteParcelasByConta = async (id_conta) => {
    const result = await db.query(
        "UPDATE parcelas SET deleted = true WHERE id_conta = $1 AND deleted = false RETURNING id_parcela;",
        [id_conta]
    );
    return { quantidade: result.rowCount };
};

// Marcar parcela como paga
const marcarParcelaComoPaga = async (id_parcela) => {
    const { rows } = await db.query(
        "UPDATE parcelas SET status = 'Pago' WHERE id_parcela = $1 AND deleted = false RETURNING *;",
        [id_parcela]
    );
    return rows[0];
};

// Verificar e atualizar status automático
const verificarStatusAutomatico = (parcela) => {
    // IMPORTANTE: Parcelas pagas NUNCA devem ter o status recalculado
    // Verificar se o status é exatamente 'Pago' (case-sensitive)
    if (parcela.status === 'Pago' || parcela.status === 'PAGO' || parcela.status === 'pago') {
        return parcela; // Retornar sem modificar
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataVencimento = new Date(parcela.data_vencimento);
    dataVencimento.setHours(0, 0, 0, 0);

    // Criar uma cópia do objeto para não modificar o original diretamente
    const parcelaAtualizada = { ...parcela };
    parcelaAtualizada.status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';
    
    return parcelaAtualizada;
};

module.exports = {
    getAllParcelas,
    getParcelasById,
    getParcelasByContaPagar,
    insertParcelas,
    updateParcelas,
    deleteParcelas,
    deleteParcelasByConta,
    marcarParcelaComoPaga,
    verificarStatusAutomatico,
};
