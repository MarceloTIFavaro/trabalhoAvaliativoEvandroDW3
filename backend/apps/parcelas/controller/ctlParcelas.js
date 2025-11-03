const mdlParcelas = require("../model/mdlParcelas");

// Listar todas as parcelas ativas
const getAllParcelas = async (req, res) => {
  try {
    let parcelas = await mdlParcelas.getAllParcelas();
    parcelas = parcelas.map(mdlParcelas.verificarStatusAutomatico);
    res.status(200).json(parcelas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcelas", details: error.message });
  }
};

// Buscar parcela por ID
const getParcelasById = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const parcela = await mdlParcelas.getParcelasById(id_parcela);

    if (!parcela) return res.status(404).json({ error: "Parcela não encontrada" });

    res.status(200).json(mdlParcelas.verificarStatusAutomatico(parcela));
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcela", details: error.message });
  }
};

// Buscar parcelas por conta
const getParcelasByConta = async (req, res) => {
  try {
    const { id_conta } = req.body;
    let parcelas = await mdlParcelas.getParcelasByContaPagar(id_conta);
    parcelas = parcelas.map(mdlParcelas.verificarStatusAutomatico);
    res.status(200).json(parcelas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar parcelas da conta", details: error.message });
  }
};

// Criar nova parcela
const insertParcelas = async (req, res) => {
  try {
    const dados = req.body;
    dados.status = 'Pendente'; // forçar status inicial
    const parcela = await mdlParcelas.insertParcelas(dados);
    res.status(201).json(parcela);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar parcela", details: error.message });
  }
};

// Atualizar parcela
const updateParcelas = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const dados = req.body;

    const parcelaAtual = await mdlParcelas.getParcelasById(id_parcela);
    if (!parcelaAtual) return res.status(404).json({ error: "Parcela não encontrada" });

    // Manter status 'Pago' se já estiver pago
    if (parcelaAtual.status === 'Pago') {
      dados.status = 'Pago';
    } else {
      // Atualizar status com base na nova data de vencimento
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataVencimento = new Date(dados.data_vencimento);
      dataVencimento.setHours(0, 0, 0, 0);
      dados.status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';
    }

    const parcelaAtualizada = await mdlParcelas.updateParcelas(id_parcela, dados);
    res.status(200).json(parcelaAtualizada);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar parcela", details: error.message });
  }
};

// Deletar parcela (lógica)
const deleteParcelas = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const resultado = await mdlParcelas.deleteParcelas(id_parcela);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar parcela", details: error.message });
  }
};

// Marcar parcela como paga
const marcarParcelaComoPaga = async (req, res) => {
  try {
    const { id_parcela } = req.body;
    const parcela = await mdlParcelas.marcarParcelaComoPaga(id_parcela);

    if (!parcela) return res.status(404).json({ error: "Parcela não encontrada" });

    res.status(200).json({
      message: "Parcela marcada como paga com sucesso",
      parcela
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao marcar parcela como paga", details: error.message });
  }
};

// Gerar parcelas automaticamente
const gerarParcelas = async (req, res) => {
  try {
    const { id_conta, numero_parcelas, data_inicial, intervalo_dias } = req.body;

    // Validações
    if (!id_conta || !numero_parcelas || !data_inicial) {
      return res.status(400).json({ error: "Campos obrigatórios: id_conta, numero_parcelas, data_inicial" });
    }

    const numeroParcelas = parseInt(numero_parcelas);
    const idConta = parseInt(id_conta);
    const intervaloDias = intervalo_dias ? parseInt(intervalo_dias) : 30; // Default 30 dias se não informado

    // Validar número máximo de parcelas (12)
    if (numeroParcelas > 12 || numeroParcelas < 1) {
      return res.status(400).json({ error: "O número de parcelas deve estar entre 1 e 12" });
    }

    // Validar intervalo de dias
    if (intervaloDias < 1) {
      return res.status(400).json({ error: "O intervalo entre parcelas deve ser de pelo menos 1 dia" });
    }

    // Verificar se a conta existe e buscar o valor total automaticamente
    const mdlContasPagar = require("../../contas_pagar/model/mdlContasPagar");
    const conta = await mdlContasPagar.getContasPagarByID(idConta);
    if (!conta) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    // Buscar o valor da conta automaticamente
    const valorTotal = parseFloat(conta.valor);
    
    // Validar valor total
    if (valorTotal <= 0) {
      return res.status(400).json({ error: "A conta não possui um valor válido para parcelamento" });
    }

    // Verificar se já existem parcelas para esta conta
    const parcelasExistentes = await mdlParcelas.getParcelasByContaPagar(idConta);
    if (parcelasExistentes.length > 0) {
      return res.status(400).json({ error: "Esta conta já possui parcelas cadastradas" });
    }

    // Calcular valor por parcela
    const valorPorParcela = valorTotal / numeroParcelas;

    // Converter data_inicial para Date
    const dataInicial = new Date(data_inicial);
    dataInicial.setHours(0, 0, 0, 0);

    if (isNaN(dataInicial.getTime())) {
      return res.status(400).json({ error: "Data inicial inválida" });
    }

    // Gerar as parcelas
    const parcelasCriadas = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 1; i <= numeroParcelas; i++) {
      // Calcular data de vencimento usando intervalo em dias
      const dataVencimento = new Date(dataInicial);
      dataVencimento.setDate(dataInicial.getDate() + ((i - 1) * intervaloDias));
      dataVencimento.setHours(0, 0, 0, 0);

      // Determinar status inicial baseado na data de vencimento
      let status = 'Pendente';
      if (dataVencimento < hoje) {
        status = 'Atrasado';
      }

      // Criar parcela
      const dadosParcela = {
        numero_parcela: i,
        valor: parseFloat(valorPorParcela.toFixed(2)),
        data_vencimento: dataVencimento.toISOString().split('T')[0], // Formato YYYY-MM-DD
        id_conta: idConta,
        status: status
      };

      const parcela = await mdlParcelas.insertParcelas(dadosParcela);
      parcelasCriadas.push(mdlParcelas.verificarStatusAutomatico(parcela));
    }

    res.status(201).json({
      message: `${numeroParcelas} parcelas geradas com sucesso`,
      valor_total: valorTotal,
      valor_por_parcela: parseFloat(valorPorParcela.toFixed(2)),
      parcelas: parcelasCriadas
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar parcelas", details: error.message });
  }
};



module.exports = {
  getAllParcelas,
  getParcelasById,
  getParcelasByConta,
  insertParcelas,
  updateParcelas,
  deleteParcelas,
  marcarParcelaComoPaga,
  gerarParcelas,
};
