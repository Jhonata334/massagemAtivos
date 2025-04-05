document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista-agendamentos");
    let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  
    function renderAgendamentos() {
      lista.innerHTML = "";
      if (agendamentos.length === 0) {
        lista.innerHTML = "<p>Nenhum agendamento registrado.</p>";
        return;
      }
  
      agendamentos.forEach((item, index) => {
        const div = document.createElement("div");
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = "8px";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.style.textAlign = "left";
  
        div.innerHTML = `
          <strong>Nome:</strong> ${item.nome}<br>
          <strong>Email:</strong> ${item.email}<br>
          <strong>Data:</strong> ${item.data}<br>
          <strong>Horário:</strong> ${item.horario}<br>
          <button onclick="editar(${index})">Editar</button>
          <button onclick="cancelar(${index})">Cancelar</button>
        `;
        lista.appendChild(div);
      });
    }
  
    window.editar = function(index) {
      const novoNome = prompt("Novo nome:", agendamentos[index].nome);
      const novoEmail = prompt("Novo email:", agendamentos[index].email);
      const novoHorario = prompt("Novo horário:", agendamentos[index].horario);
  
      if (novoNome && novoEmail && novoHorario) {
        agendamentos[index].nome = novoNome;
        agendamentos[index].email = novoEmail;
        agendamentos[index].horario = novoHorario;
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderAgendamentos();
      }
    }
  
    window.cancelar = function(index) {
      if (confirm("Deseja realmente cancelar este agendamento?")) {
        agendamentos.splice(index, 1);
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderAgendamentos();
      }
    }
  
    renderAgendamentos();
  });
  