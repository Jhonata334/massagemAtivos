document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("calendario")) {
        carregarCalendario();
    }

    carregarAgendamentos();

    const botaoAgendar = document.getElementById("botao-agendar");
    if (botaoAgendar) {
        botaoAgendar.addEventListener("click", agendar);
    }
});

let agendamentoPendente = null;

function carregarCalendario() {
    const calendario = document.getElementById("calendario");
    const mesAtual = document.getElementById("mes-atual");

    let dataAtual = new Date();
    let ano = dataAtual.getFullYear();
    let mes = dataAtual.getMonth();

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    mesAtual.innerText = `${meses[mes]} ${ano}`;
    calendario.innerHTML = "";

    let primeiroDia = new Date(ano, mes, 1).getDay();
    let totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDia; i++) {
        calendario.appendChild(document.createElement("div"));
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        let data = new Date(ano, mes, dia);
        let diaSemana = data.getDay();

        let diaElemento = document.createElement("div");
        diaElemento.textContent = dia;

        if (diaSemana === 3 || diaSemana === 5) {
            diaElemento.classList.add("ativo");
            diaElemento.onclick = function () {
                selecionarDia(dia, mes + 1, ano);
            };
        }

        calendario.appendChild(diaElemento);
    }
}

function selecionarDia(dia, mes, ano) {
    let diaFormatado = dia.toString().padStart(2, "0");
    let mesFormatado = mes.toString().padStart(2, "0");
    let dataFormatada = `${diaFormatado}/${mesFormatado}/${ano}`;

    localStorage.setItem("diaSelecionado", dataFormatada);
    atualizarHorariosDisponiveis(dataFormatada);

    mostrarAlerta(`Você selecionou o dia ${dataFormatada}`, "info");
}

function atualizarHorariosDisponiveis(diaSelecionado) {
    const horariosFixos = [
        "09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00",
        "13:00", "13:20", "13:40", "14:00", "14:20", "14:40", "15:00", "15:20", "15:40", "16:00", "16:20"
    ];

    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    const horariosOcupados = agendamentos
        .filter(a => a.dia === diaSelecionado)
        .map(a => a.horario);

    const selectHorario = document.getElementById("horario");
    if (!selectHorario) return;

    selectHorario.innerHTML = '<option value="">Selecione o horário</option>';

    horariosFixos.forEach(horario => {
        if (!horariosOcupados.includes(horario)) {
            const option = document.createElement("option");
            option.value = horario;
            option.textContent = horario;
            selectHorario.appendChild(option);
        }
    });

    if (selectHorario.options.length === 1) {
        const option = document.createElement("option");
        option.textContent = "Nenhum horário disponível";
        option.disabled = true;
        selectHorario.appendChild(option);
    }
}

function agendar() {
    let nome = document.getElementById("nome").value;
    let email = document.getElementById("email").value;
    let horario = document.getElementById("horario").value;
    let dia = localStorage.getItem("diaSelecionado");

    if (!nome || !email || !horario || !dia) {
        mostrarAlerta("Preencha todos os campos e selecione um dia!", "erro");
        return;
    }

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    // Verifica se o horário já está ocupado
    let horarioOcupado = agendamentos.some(ag => ag.dia === dia && ag.horario === horario);
    if (horarioOcupado) {
        mostrarAlerta("Este horário já está agendado. Por favor, escolha outro.", "erro");
        return;
    }

    // Verifica se a pessoa já tem um agendamento no mesmo dia
    let agendamentoMesmoDia = agendamentos.some(ag => ag.dia === dia && ag.email === email);
    if (agendamentoMesmoDia) {
        mostrarAlerta("Você já possui um agendamento neste dia.", "erro");
        return;
    }

    // Verifica se já possui 2 agendamentos no mesmo mês
    const [_, mesNum, anoNum] = dia.split("/");
    const agendamentosMes = agendamentos.filter(ag =>
        ag.email === email && ag.dia.split("/")[1] === mesNum && ag.dia.split("/")[2] === anoNum
    );

    if (agendamentosMes.length >= 2) {
        mostrarAlerta("Você já fez 2 agendamentos neste mês.", "erro");
        return;
    }

    // Confirmação de agendamento
    agendamentoPendente = { nome, email, horario, dia };
    document.getElementById("textoConfirmacao").innerText =
        `Nome: ${nome}\nEmail: ${email}\nData: ${dia}\nHorário: ${horario}`;
    document.getElementById("popupConfirmacao").style.display = "flex";
}


function fecharPopup() {
    document.getElementById("popupConfirmacao").style.display = "none";
}

function carregarAgendamentos() {
    let listaAgendamentos = document.getElementById("lista-agendamentos");
    if (!listaAgendamentos) return;

    listaAgendamentos.innerHTML = "";

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    agendamentos.forEach((agendamento, index) => {
        let item = document.createElement("div");
        item.classList.add("agendamento-item");

        item.innerHTML = `
            <p><strong>Nome:</strong> ${agendamento.nome}</p>
            <p><strong>Email:</strong> ${agendamento.email}</p>
            <p><strong>Data:</strong> ${agendamento.dia}</p>
            <p><strong>Horário:</strong> ${agendamento.horario}</p>
            <button onclick="editarAgendamento(${index})">Editar</button>
            <button onclick="cancelarAgendamento(${index})">Cancelar</button>
        `;

        listaAgendamentos.appendChild(item);
    });
}

function cancelarAgendamento(index) {
    document.getElementById("popupConfirmacaoCancelamento").style.display = "flex";
    window.indiceCancelamento = index;
}

function confirmarCancelamento() {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    agendamentos.splice(window.indiceCancelamento, 1);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    carregarAgendamentos();
    fecharPopupCancelamento();
    mostrarAlerta("Você cancelou o agendamento.", "erro");
}

function fecharPopupCancelamento() {
    document.getElementById("popupConfirmacaoCancelamento").style.display = "none";
}

let indiceEditando = null;

function editarAgendamento(index) {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    const ag = agendamentos[index];

    document.getElementById("editarNome").value = ag.nome;
    document.getElementById("editarEmail").value = ag.email;
    document.getElementById("editarData").value = ag.dia;
    document.getElementById("editarHorario").value = ag.horario;

    indiceEditando = index;
    document.getElementById("editarPopup").style.display = "flex";
}

function fecharEdicao() {
    document.getElementById("editarPopup").style.display = "none";
}

function salvarEdicao() {
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

    agendamentos[indiceEditando] = {
        nome: document.getElementById("editarNome").value,
        email: document.getElementById("editarEmail").value,
        dia: document.getElementById("editarData").value,
        horario: document.getElementById("editarHorario").value
    };

    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    fecharEdicao();
    carregarAgendamentos();
    mostrarAlerta("Agendamento editado com sucesso!", "sucesso");
}

function mostrarMensagem(mensagem) {
    let msgBox = document.getElementById("mensagem-confirmacao");
    msgBox.textContent = mensagem;
    msgBox.classList.add("mensagem-visivel");

    setTimeout(() => {
        msgBox.classList.remove("mensagem-visivel");
    }, 3000);
}

function confirmarAgendamento() {
    if (!agendamentoPendente) return;

    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
    agendamentos.push(agendamentoPendente);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    mostrarAlerta(`Agendamento confirmado para ${agendamentoPendente.nome} em ${agendamentoPendente.dia} às ${agendamentoPendente.horario}`, "sucesso");

    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("horario").value = "";
    localStorage.removeItem("diaSelecionado");

    agendamentoPendente = null;
    fecharPopup();
}

function abrirLogin() {
    document.getElementById("popupLogin").style.display = "flex";
}

function fecharLogin() {
    document.getElementById("popupLogin").style.display = "none";
}

function verificarLogin() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    const usuarioCorreto = "Admin";
    const senhaCorreta = "Massagem123";

    if (usuario === usuarioCorreto && senha === senhaCorreta) {
        window.location.href = "administrador.html";
    } else {
        mostrarAlerta("Usuário ou senha incorretos!", "erro");
    }
}

function mostrarAlerta(mensagem, tipo = 'info') {
    const alerta = document.getElementById('alerta-personalizado');
    alerta.textContent = mensagem;
    alerta.className = `alerta ${tipo}`;
    alerta.style.display = 'block';
    setTimeout(() => {
        alerta.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        alerta.style.opacity = '0';
        setTimeout(() => {
            alerta.style.display = 'none';
        }, 300);
    }, 3000);
}

function confirmarCancelarAgendamento(index) {
    window.indiceCancelamento = index;
    document.getElementById("popupConfirmacaoCancelamento").style.display = "flex";
}
