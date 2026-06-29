(function (escopoGlobal) {
  const nomesReservas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  function minutosParaHorario(totalMinutos) {
    const horas = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
    const minutos = String(totalMinutos % 60).padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  function sortearInteiro(minimo, maximo, numeroAleatorio) {
    return Math.floor(numeroAleatorio() * (maximo - minimo + 1)) + minimo;
  }

  function criarReservasExemplo() {
    return [
      { id: 1, nome: "Reserva A", inicio: "08:00", fim: "10:00", valor: 100 },
      { id: 2, nome: "Reserva B", inicio: "09:00", fim: "12:00", valor: 250 },
      { id: 3, nome: "Reserva C", inicio: "10:00", fim: "13:00", valor: 120 },
      { id: 4, nome: "Reserva D", inicio: "13:00", fim: "15:00", valor: 200 },
      { id: 5, nome: "Reserva E", inicio: "12:00", fim: "16:00", valor: 300 },
      { id: 6, nome: "Reserva F", inicio: "15:00", fim: "17:00", valor: 180 },
    ];
  }

  function gerarReservasDinamicas(opcoes = {}) {
    const quantidade = opcoes.quantidade || 7;
    const numeroAleatorio = opcoes.numeroAleatorio || Math.random;
    const reservas = [];

    for (let indice = 0; indice < quantidade; indice += 1) {
      const inicioEmMinutos = 8 * 60 + sortearInteiro(0, 8, numeroAleatorio) * 60;
      const duracaoEmMinutos = sortearInteiro(1, 4, numeroAleatorio) * 60;
      const fimEmMinutos = Math.min(inicioEmMinutos + duracaoEmMinutos, 18 * 60);
      const valor = sortearInteiro(8, 42, numeroAleatorio) * 10;

      reservas.push({
        id: indice + 1,
        nome: `Reserva ${nomesReservas[indice] || indice + 1}`,
        inicio: minutosParaHorario(inicioEmMinutos),
        fim: minutosParaHorario(fimEmMinutos),
        valor,
      });
    }

    return reservas;
  }

  const apiReservas = {
    criarReservasExemplo,
    gerarReservasDinamicas,
    minutosParaHorario,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = apiReservas;
  }

  escopoGlobal.ReservasDinamicas = apiReservas;
})(typeof window !== "undefined" ? window : globalThis);
