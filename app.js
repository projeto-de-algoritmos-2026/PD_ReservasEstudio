let reservasAtuais = [];
let resultadoAtual = null;
let proximoId = 1;

const listaReservas = document.querySelector("#listaReservas");
const linhaDoTempo = document.querySelector("#linhaDoTempo");
const corpoTabelaAlgoritmo = document.querySelector("#corpoTabelaAlgoritmo");
const resultadoFinal = document.querySelector("#resultadoFinal");
const listaPassos = document.querySelector("#listaPassos");
const mensagemFormulario = document.querySelector("#mensagemFormulario");

const formularioReserva = document.querySelector("#formularioReserva");
const campoNome = document.querySelector("#campoNome");
const campoInicio = document.querySelector("#campoInicio");
const campoFim = document.querySelector("#campoFim");
const campoValor = document.querySelector("#campoValor");

document.querySelector("#botaoExecutar").addEventListener("click", executarAlgoritmo);
document.querySelector("#botaoLimpar").addEventListener("click", limparResultado);
document.querySelector("#botaoGerarCenario").addEventListener("click", gerarNovoCenario);
document.querySelector("#botaoExemplo").addEventListener("click", carregarExemploFixo);
formularioReserva.addEventListener("submit", adicionarReserva);

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto !== undefined) {
    elemento.textContent = texto;
  }

  return elemento;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function obterIdsEscolhidos() {
  if (!resultadoAtual) {
    return new Set();
  }

  return new Set(resultadoAtual.reservasEscolhidas.map((reserva) => reserva.id));
}

function obterStatusReserva(reserva, idsEscolhidos) {
  if (!resultadoAtual) {
    return "pendente";
  }

  return idsEscolhidos.has(reserva.id) ? "escolhida" : "ignorada";
}

function renderizarReservas() {
  const idsEscolhidos = obterIdsEscolhidos();
  listaReservas.replaceChildren();

  reservasAtuais.forEach((reserva) => {
    const status = obterStatusReserva(reserva, idsEscolhidos);
    const cartao = criarElemento("article", `cartao-reserva ${status}`);
    const conteudo = criarElemento("div");
    const nome = criarElemento("div", "nome-reserva", reserva.nome);
    const detalhes = criarElemento(
      "p",
      "detalhes-reserva",
      `${reserva.inicio} até ${reserva.fim} · ${formatarMoeda(reserva.valor)}`
    );
    const etiqueta = criarElemento(
      "span",
      "status-reserva",
      status === "pendente" ? "Pendente" : status === "escolhida" ? "Escolhida" : "Ignorada"
    );

    conteudo.append(nome, detalhes);
    cartao.append(conteudo, etiqueta);
    listaReservas.append(cartao);
  });
}

function renderizarLinhaDoTempo() {
  const idsEscolhidos = obterIdsEscolhidos();
  const horariosInicio = reservasAtuais.map((reserva) =>
    WeightedIntervalScheduling.converterHorarioParaMinutos(reserva.inicio)
  );
  const horariosFim = reservasAtuais.map((reserva) =>
    WeightedIntervalScheduling.converterHorarioParaMinutos(reserva.fim)
  );
  const inicioAgenda = Math.min(...horariosInicio);
  const fimAgenda = Math.max(...horariosFim);
  const duracaoAgenda = fimAgenda - inicioAgenda || 1;
  const escala = criarElemento("div", "escala-tempo");

  linhaDoTempo.replaceChildren();
  escala.append(
    criarElemento("span", null, minutosParaHorario(inicioAgenda)),
    criarElemento("span", null, minutosParaHorario(fimAgenda))
  );
  linhaDoTempo.append(escala);

  reservasAtuais.forEach((reserva) => {
    const status = obterStatusReserva(reserva, idsEscolhidos);
    const inicioReserva = WeightedIntervalScheduling.converterHorarioParaMinutos(reserva.inicio);
    const fimReserva = WeightedIntervalScheduling.converterHorarioParaMinutos(reserva.fim);
    const deslocamento = ((inicioReserva - inicioAgenda) / duracaoAgenda) * 100;
    const largura = ((fimReserva - inicioReserva) / duracaoAgenda) * 100;
    const faixa = criarElemento("div", "faixa-reserva");
    const rotulo = criarElemento("div", "rotulo-faixa", reserva.nome);
    const trilho = criarElemento("div", "trilho");
    const barra = criarElemento(
      "div",
      `barra-reserva ${status}`,
      `${reserva.inicio}-${reserva.fim} · ${formatarMoeda(reserva.valor)}`
    );

    barra.style.left = `${deslocamento}%`;
    barra.style.width = `${largura}%`;
    trilho.append(barra);
    faixa.append(rotulo, trilho);
    linhaDoTempo.append(faixa);
  });
}

function minutosParaHorario(totalMinutos) {
  const horas = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
  const minutos = String(totalMinutos % 60).padStart(2, "0");
  return `${horas}:${minutos}`;
}

function executarAlgoritmo() {
  resultadoAtual = WeightedIntervalScheduling.calcularAgendaOtima(reservasAtuais);
  renderizarReservas();
  renderizarLinhaDoTempo();
  renderizarTabelaAlgoritmo();
  renderizarResultadoFinal();
  renderizarPassos();
}

function limparResultado() {
  resultadoAtual = null;
  renderizarReservas();
  renderizarLinhaDoTempo();
  renderizarTabelaVazia();
  renderizarResultadoVazio();
  renderizarPassosVazios();
}

function gerarNovoCenario() {
  reservasAtuais = ReservasDinamicas.gerarReservasDinamicas();
  atualizarProximoId();
  formularioReserva.reset();
  mensagemFormulario.textContent = "";
  limparResultado();
}

function carregarExemploFixo() {
  reservasAtuais = ReservasDinamicas.criarReservasExemplo();
  atualizarProximoId();
  formularioReserva.reset();
  mensagemFormulario.textContent = "";
  limparResultado();
}

function atualizarProximoId() {
  const maiorId = reservasAtuais.reduce((maiorValor, reserva) => Math.max(maiorValor, reserva.id), 0);
  proximoId = maiorId + 1;
}

function renderizarTabelaAlgoritmo() {
  corpoTabelaAlgoritmo.replaceChildren();

  resultadoAtual.linhasTabela.forEach((linha) => {
    const linhaTabela = criarElemento(
      "tr",
      linha.decisao === "pegar" ? "linha-pegar" : "linha-ignorar"
    );
    const valores = [
      linha.j,
      linha.reserva,
      linha.inicio,
      linha.fim,
      formatarMoeda(linha.valor),
      linha.compatibilidade,
      formatarMoeda(linha.valorAoIgnorar),
      formatarMoeda(linha.valorAoPegar),
      formatarMoeda(linha.opt),
      linha.decisao,
    ];

    valores.forEach((valor) => linhaTabela.append(criarElemento("td", null, String(valor))));
    corpoTabelaAlgoritmo.append(linhaTabela);
  });
}

function renderizarTabelaVazia() {
  const linha = criarElemento("tr");
  const celula = criarElemento(
    "td",
    "estado-vazio",
    "Execute o algoritmo para preencher a tabela."
  );

  celula.colSpan = 10;
  linha.append(celula);
  corpoTabelaAlgoritmo.replaceChildren(linha);
}

function renderizarResultadoFinal() {
  const nomesEscolhidos = resultadoAtual.reservasEscolhidas
    .map((reserva) => reserva.nome.replace("Reserva ", ""))
    .join(", ");
  const maiorReservaIsolada = reservasAtuais.reduce((maiorReserva, reserva) =>
    reserva.valor > maiorReserva.valor ? reserva : maiorReserva
  );

  resultadoFinal.className = "";
  resultadoFinal.replaceChildren();
  resultadoFinal.append(
    criarElemento("p", null, `Reservas selecionadas: ${nomesEscolhidos}.`),
    criarElemento(
      "div",
      "resultado-destaque",
      `Valor total máximo: ${formatarMoeda(resultadoAtual.valorTotalMaximo)}`
    ),
    criarElemento(
      "p",
      null,
      `A melhor agenda não é apenas a reserva mais cara (${maiorReservaIsolada.nome}, ` +
        `${formatarMoeda(maiorReservaIsolada.valor)}). O algoritmo compara combinações ` +
        "compatíveis e escolhe o conjunto com maior faturamento global."
    )
  );
}

function renderizarResultadoVazio() {
  resultadoFinal.className = "estado-vazio";
  resultadoFinal.textContent = "Execute o algoritmo para ver as reservas selecionadas.";
}

function renderizarPassos() {
  listaPassos.replaceChildren();
  resultadoAtual.passos.forEach((passo) => {
    listaPassos.append(criarElemento("li", null, passo));
  });
}

function renderizarPassosVazios() {
  listaPassos.replaceChildren(criarElemento("li", "estado-vazio", "Nenhum passo calculado ainda."));
}

function adicionarReserva(evento) {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const inicio = campoInicio.value;
  const fim = campoFim.value;
  const valor = Number(campoValor.value);
  const erro = validarReserva(nome, inicio, fim, valor);

  if (erro) {
    mensagemFormulario.textContent = erro;
    return;
  }

  reservasAtuais.push({ id: proximoId, nome, inicio, fim, valor });
  proximoId += 1;
  mensagemFormulario.textContent = "";
  formularioReserva.reset();
  limparResultado();
}

function validarReserva(nome, inicio, fim, valor) {
  if (!nome) {
    return "Informe o nome da reserva.";
  }

  if (!inicio || !fim) {
    return "Informe os horários de início e fim.";
  }

  if (
    WeightedIntervalScheduling.converterHorarioParaMinutos(fim) <=
    WeightedIntervalScheduling.converterHorarioParaMinutos(inicio)
  ) {
    return "O horário de fim deve ser maior que o horário de início.";
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    return "O valor deve ser positivo.";
  }

  return "";
}

gerarNovoCenario();
