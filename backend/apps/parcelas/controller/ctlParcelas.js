  const mdlParcelas = require("../model/mdlParcelas");

  // Exibir todas as parcelas
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
      dados.status = 'Pendente';
      const parcela = await mdlParcelas.insertParcelas(dados);
      res.status(201).json(parcela);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar parcela", details: error.message });
    }
  };

  // Atualizar parcela existente
  const updateParcelas = async (req, res) => {
    try {
      const { id_parcela } = req.body;
      const dados = req.body;
      const parcelaAtual = await mdlParcelas.getParcelasById(id_parcela);

      if (!parcelaAtual) return res.status(404).json({ error: "Parcela não encontrada" });

      if (parcelaAtual.status === 'Pago') {
        dados.status = 'Pago';
      } else {
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

  // Deletar parcela
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

      if (parcela.status) parcela.status = 'Pago';

      try {
        const mdlContasPagar = require("../../contas_pagar/model/mdlContasPagar");
        await mdlContasPagar.recalcularStatusContaBaseadoNasParcelas(parcela.id_conta);
      } catch (error) {
        console.error('Erro ao recalcular status da conta após pagar parcela:', error);
      }

      res.status(200).json({
        status: 'ok',
        message: "Parcela marcada como paga com sucesso",
        parcela
      });
    } catch (error) {
      res.status(500).json({ status: 'error', error: "Erro ao marcar parcela como paga", details: error.message });
    }
  };

  // Gerar parcelas automaticamente
  const gerarParcelas = async (req, res) => {
    try {
      const { id_conta, numero_parcelas, data_inicial, intervalo_dias } = req.body;

      if (!id_conta || !numero_parcelas || !data_inicial) {
        return res.status(400).json({ error: "Campos obrigatórios: id_conta, numero_parcelas, data_inicial" });
      }

      const numeroParcelas = parseInt(numero_parcelas);
      const idConta = parseInt(id_conta);
      const intervaloDias = intervalo_dias ? parseInt(intervalo_dias) : 30;

      if (numeroParcelas > 12 || numeroParcelas < 1) {
        return res.status(400).json({ error: "O número de parcelas deve estar entre 1 e 12" });
      }

      if (intervaloDias < 1) {
        return res.status(400).json({ error: "O intervalo entre parcelas deve ser de pelo menos 1 dia" });
      }

      const mdlContasPagar = require("../../contas_pagar/model/mdlContasPagar");
      const conta = await mdlContasPagar.getContasPagarByID(idConta);

      if (!conta) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }

      const valorTotal = parseFloat(conta.valor);
      if (valorTotal <= 0) {
        return res.status(400).json({ error: "A conta não possui um valor válido para parcelamento" });
      }

      const parcelasExistentes = await mdlParcelas.getParcelasByContaPagar(idConta);
      if (parcelasExistentes.length > 0) {
        return res.status(400).json({ error: "Esta conta já possui parcelas cadastradas" });
      }

      const valorPorParcela = valorTotal / numeroParcelas;
      const parseLocalYmd = (ymd) => {
        const [ano, mes, dia] = String(ymd).split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      };
      const dataInicial = parseLocalYmd(data_inicial);

      if (isNaN(dataInicial.getTime())) {
        return res.status(400).json({ error: "Data inicial inválida" });
      }

      const parcelasCriadas = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const formatarDataLocal = (d) => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      };

      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(
          dataInicial.getFullYear(),
          dataInicial.getMonth(),
          dataInicial.getDate() + ((i - 1) * intervaloDias)
        );

        let status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';

        const dadosParcela = {
          numero_parcela: i,
          valor: parseFloat(valorPorParcela.toFixed(2)),
          data_vencimento: formatarDataLocal(dataVencimento),
          id_conta: idConta,
          status
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

  // Regerar parcelas (apaga as antigas e cria novas)
  const regerarParcelas = async (req, res) => {
    try {
      const { id_conta, numero_parcelas, data_inicial, intervalo_dias } = req.body;

      if (!id_conta || !numero_parcelas || !data_inicial) {
        return res.status(400).json({ error: "Campos obrigatórios: id_conta, numero_parcelas, data_inicial" });
      }

      const idConta = parseInt(id_conta);
      const numeroParcelas = parseInt(numero_parcelas);
      const intervaloDias = intervalo_dias ? parseInt(intervalo_dias) : 30;

      if (isNaN(idConta) || isNaN(numeroParcelas) || isNaN(intervaloDias)) {
        return res.status(400).json({ error: "Parâmetros inválidos" });
      }

      if (numeroParcelas < 1 || numeroParcelas > 12) {
        return res.status(400).json({ error: "O número de parcelas deve estar entre 1 e 12" });
      }

      if (intervaloDias < 1) {
        return res.status(400).json({ error: "O intervalo entre parcelas deve ser de pelo menos 1 dia" });
      }

      const mdlContasPagar = require("../../contas_pagar/model/mdlContasPagar");
      const conta = await mdlContasPagar.getContasPagarByID(idConta);

      if (!conta) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }

      const valorTotal = parseFloat(conta.valor);
      if (!(valorTotal > 0)) {
        return res.status(400).json({ error: "A conta não possui um valor válido para parcelamento" });
      }

      await mdlParcelas.deleteParcelasByConta(idConta);

      const valorPorParcela = valorTotal / numeroParcelas;
      const parseLocalYmd = (ymd) => {
        const [ano, mes, dia] = String(ymd).split('-').map(Number);
        return new Date(ano, mes - 1, dia);
      };
      const dataInicial = parseLocalYmd(data_inicial);

      if (isNaN(dataInicial.getTime())) {
        return res.status(400).json({ error: "Data inicial inválida" });
      }

      const parcelasCriadas = [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const formatarDataLocal = (d) => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      };

      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(
          dataInicial.getFullYear(),
          dataInicial.getMonth(),
          dataInicial.getDate() + ((i - 1) * intervaloDias)
        );

        let status = dataVencimento < hoje ? 'Atrasado' : 'Pendente';

        const dadosParcela = {
          numero_parcela: i,
          valor: parseFloat(valorPorParcela.toFixed(2)),
          data_vencimento: formatarDataLocal(dataVencimento),
          id_conta: idConta,
          status
        };

        const parcela = await mdlParcelas.insertParcelas(dadosParcela);
        parcelasCriadas.push(mdlParcelas.verificarStatusAutomatico(parcela));
      }

      res.status(201).json({
        message: `Parcelas regeradas com sucesso (${numeroParcelas})`,
        valor_total: valorTotal,
        valor_por_parcela: parseFloat(valorPorParcela.toFixed(2)),
        parcelas: parcelasCriadas
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao regerar parcelas", details: error.message });
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
    regerarParcelas
  };
