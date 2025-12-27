document.addEventListener("DOMContentLoaded", () => {

  let ingredientes = [];
  let receita = [];
  let ingredientesNaReceita = new Set();

  const unidades = ["kg", "g", "litro", "ml", "unidade"];

  const campoBusca = document.getElementById("busca");
  const listaIngredientes = document.getElementById("lista-ingredientes");
  const tabelaReceita = document.getElementById("receita");
  const totalSpan = document.getElementById("total");
  const listaReceitas = document.getElementById("lista-receitas");

  // ================= LOCAL STORAGE =================

  function carregarReceitas() {
    return JSON.parse(localStorage.getItem("receitasSalvas")) || [];
  }

  function salvarReceitas(lista) {
    localStorage.setItem("receitasSalvas", JSON.stringify(lista));
  }

  // ================= INGREDIENTES =================

  fetch("ingredientes.json")
    .then(res => res.json())
    .then(dados => {
      ingredientes = dados;
      renderIngredientes();
      renderReceitas();
    });

  campoBusca.addEventListener("input", renderIngredientes);

  function renderIngredientes() {
    const filtro = campoBusca.value.toLowerCase();
    listaIngredientes.innerHTML = "";

    ingredientes.forEach(item => {
      if (!item.nome.toLowerCase().includes(filtro)) return;

      const li = document.createElement("li");
      li.textContent = item.nome;

      if (ingredientesNaReceita.has(item.nome)) {
        li.style.opacity = "0.4";
      } else {
        li.onclick = () => adicionarIngrediente(item);
      }

      listaIngredientes.appendChild(li);
    });
  }

  function adicionarIngrediente(item) {
    ingredientesNaReceita.add(item.nome);

    receita.push({
      nome: item.nome,
      preco: 0,
      quantidade: 0,
      unidade: "kg"
    });

    atualizarTabela();
    renderIngredientes();
  }

  // ================= TABELA =================

  function atualizarTabela() {
    tabelaReceita.innerHTML = "";
    let total = 0;

    receita.forEach((item, index) => {
      const custo = item.preco * item.quantidade;
      total += custo;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td><input type="number" step="0.01" value="${item.preco}"
          onchange="receita[${index}].preco = Number(this.value); atualizarTabela();"></td>
        <td><input type="number" step="0.01" value="${item.quantidade}"
          onchange="receita[${index}].quantidade = Number(this.value); atualizarTabela();"></td>
        <td>
          <select onchange="receita[${index}].unidade = this.value">
            ${unidades.map(u => `<option ${u === item.unidade ? "selected" : ""}>${u}</option>`).join("")}
          </select>
        </td>
        <td>R$ ${custo.toFixed(2)}</td>
        <td><button onclick="removerIngrediente(${index})">❌</button></td>
      `;

      tabelaReceita.appendChild(tr);
    });

    totalSpan.textContent = total.toFixed(2);
  }

  // ================= FUNÇÕES GLOBAIS =================

  window.removerIngrediente = function (index) {
    ingredientesNaReceita.delete(receita[index].nome);
    receita.splice(index, 1);
    atualizarTabela();
    renderIngredientes();
  };

  window.salvarReceita = function () {
    if (receita.length === 0) {
      alert("A receita está vazia.");
      return;
    }

    const nome = prompt("Nome da receita:");
    if (!nome) return;

    const receitas = carregarReceitas();
    receitas.push({
      nome,
      itens: receita,
      total: totalSpan.textContent
    });

    salvarReceitas(receitas);
    renderReceitas();
    alert("Receita salva!");
  };

  window.renderReceitas = function () {
    listaReceitas.innerHTML = "";
    const receitas = carregarReceitas();

    if (receitas.length === 0) {
      listaReceitas.innerHTML = "<li>Nenhuma receita salva.</li>";
      return;
    }

    receitas.forEach((r, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${r.nome}</strong> — R$ ${r.total}
        <button onclick="abrirReceita(${index})">Abrir</button>
        <button onclick="excluirReceita(${index})">❌</button>
      `;
      listaReceitas.appendChild(li);
    });
  };

  window.abrirReceita = function (index) {
    const receitas = carregarReceitas();
    receita = receitas[index].itens;
    ingredientesNaReceita = new Set(receita.map(i => i.nome));
    atualizarTabela();
    renderIngredientes();
  };

  window.excluirReceita = function (index) {
    const receitas = carregarReceitas();
    receitas.splice(index, 1);
    salvarReceitas(receitas);
    renderReceitas();
  };

});
