(function (escopoGlobal) {
  function converterHorarioParaMinutos(horario) {
    const [horas, minutos] = horario.split(":").map(Number);
    return horas * 60 + minutos;
  }

  function ordenarPorHorarioFim(reservas) {
    return reservas
      .map((reserva, indiceOriginal) => ({
        ...reserva,
        indiceOriginal,
        inicioEmMinutos: converterHorarioParaMinutos(reserva.inicio),
        fimEmMinutos: converterHorarioParaMinutos(reserva.fim),
      }))
      .sort((primeiraReserva, segundaReserva) => {
        if (primeiraReserva.fimEmMinutos !== segundaReserva.fimEmMinutos) {
          return primeiraReserva.fimEmMinutos - segundaReserva.fimEmMinutos;
        }

        return primeiraReserva.inicioEmMinutos - segundaReserva.inicioEmMinutos;
      });
  }

  function calcularReservasCompativeis(reservasOrdenadas) {
    return reservasOrdenadas.map((reservaAtual, indiceAtual) => {
      let ultimaReservaCompativel = 0;

      // p(j): ultima reserva que termina antes ou exatamente no inicio da reserva atual.
      for (let indiceAnterior = 0; indiceAnterior < indiceAtual; indiceAnterior += 1) {
        const reservaAnterior = reservasOrdenadas[indiceAnterior];

        if (reservaAnterior.fimEmMinutos <= reservaAtual.inicioEmMinutos) {
          ultimaReservaCompativel = indiceAnterior + 1;
        }
      }

      return ultimaReservaCompativel;
    });
  }

  function calcularTabelaOtima(reservasOrdenadas, compatibilidades) {
    const tabelaOtima = [0];
    const linhasTabela = [];
    const passos = [];

    // Preenche OPT com a recorrencia:
    // OPT[j] = max(OPT[j - 1], valor[j] + OPT[p(j)])
    for (let indiceReserva = 1; indiceReserva <= reservasOrdenadas.length; indiceReserva += 1) {
      const reservaAtual = reservasOrdenadas[indiceReserva - 1];
      const indiceCompativel = compatibilidades[indiceReserva - 1];
      const valorAoIgnorar = tabelaOtima[indiceReserva - 1];
      const valorAoPegar = reservaAtual.valor + tabelaOtima[indiceCompativel];
      const melhorValor = Math.max(valorAoIgnorar, valorAoPegar);
      const decisao = valorAoPegar > valorAoIgnorar ? "pegar" : "ignorar";

      tabelaOtima[indiceReserva] = melhorValor;
      linhasTabela.push({
        j: indiceReserva,
        reserva: reservaAtual.nome,
        inicio: reservaAtual.inicio,
        fim: reservaAtual.fim,
        valor: reservaAtual.valor,
        compatibilidade: indiceCompativel,
        valorAoIgnorar,
        valorAoPegar,
        opt: melhorValor,
        decisao,
      });

      passos.push(
        `Analisando ${reservaAtual.nome}: Ignorar = ${valorAoIgnorar}. ` +
          `Pegar = ${reservaAtual.valor} + OPT[${indiceCompativel}] = ${valorAoPegar}. ` +
          `Como ${melhorValor} e o maior valor, a decisao parcial e ${decisao}.`
      );
    }

    return { tabelaOtima, linhasTabela, passos };
  }

  function reconstruirSolucao(reservasOrdenadas, compatibilidades, tabelaOtima) {
    const reservasEscolhidas = [];
    let indiceReserva = reservasOrdenadas.length;

    // Volta pela tabela OPT para descobrir quais reservas formam a solucao otima.
    while (indiceReserva > 0) {
      const reservaAtual = reservasOrdenadas[indiceReserva - 1];
      const indiceCompativel = compatibilidades[indiceReserva - 1];
      const valorAoIgnorar = tabelaOtima[indiceReserva - 1];
      const valorAoPegar = reservaAtual.valor + tabelaOtima[indiceCompativel];

      if (valorAoPegar > valorAoIgnorar) {
        reservasEscolhidas.unshift(reservaAtual);
        indiceReserva = indiceCompativel;
      } else {
        indiceReserva -= 1;
      }
    }

    return reservasEscolhidas;
  }

  function calcularAgendaOtima(reservas) {
    const reservasOrdenadas = ordenarPorHorarioFim(reservas);
    const compatibilidades = calcularReservasCompativeis(reservasOrdenadas);
    const { tabelaOtima, linhasTabela, passos } = calcularTabelaOtima(
      reservasOrdenadas,
      compatibilidades
    );
    const reservasEscolhidas = reconstruirSolucao(
      reservasOrdenadas,
      compatibilidades,
      tabelaOtima
    );
    const valorTotalMaximo = tabelaOtima[tabelaOtima.length - 1];

    return {
      reservasOrdenadas,
      compatibilidades,
      tabelaOtima,
      linhasTabela,
      passos,
      reservasEscolhidas,
      valorTotalMaximo,
    };
  }

  const apiAlgoritmo = {
    calcularAgendaOtima,
    ordenarPorHorarioFim,
    calcularReservasCompativeis,
    calcularTabelaOtima,
    reconstruirSolucao,
    converterHorarioParaMinutos,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = apiAlgoritmo;
  }

  escopoGlobal.WeightedIntervalScheduling = apiAlgoritmo;
})(typeof window !== "undefined" ? window : globalThis);
