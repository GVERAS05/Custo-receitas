let ingredientes = [];
let receita = [];

// BLOQUEIO ABSOLUTO DE DUPLICAÇÃO
let ingredientesNaReceita = new Set();

// Unidades
const unidades = ["kg", "g", "litro", "ml", "unidade"];

// ===== MEMÓRIA DE PREÇOS =====
function carregarPrecosSalvos() {
  return JSON.parse(localStorage.getItem("precosIngredientes")) || {};
}

function salvarPrecos(precos) {
  localStorage.setItem("precosIngredientes", JSON.stringify(precos));
}

let precosSalvos = carregarPrecosSalvos();

// ===== ELEMENTOS =====
const campoBusca = document.getElementById("busca");
const listaIngredientes = document.getElementById("lista-ingredientes");
const tabelaReceita = document.getElementById("receita");
const totalSpan = document.getElementById("total");

// ===== CARREGAR INGREDIENTES =====
fetch("ingredientes.json")
  .then(res => res.json())
  .then(dados => {
    ingredientes = dados;
    renderIngredientes();
  });

// ===== BUSCA =====
campoBusca.addEventListener("input", renderIngredientes);

// ===== RENDER INGREDIENTES =====
function renderIngredientes() {
  const filtro = campoBusca.value.toLowerCase();
  listaIngredientes.innerHTML = "";

  ingredientes.forEach(item => {
    if (!item.nome.toLowerCase().includes(filtro)) return;

    const li = document.createElement("li");
    li.textContent = item.nome;

    if (ingredientesNaReceita.has(item.nome)) {
      li.style.opacity = "0.4";
      li.style.pointerEvents = "none";
    } else {
      li.addEventListener("click", () => adicionarIngrediente(item));
    }

    listaIngredientes.appendChild(li);
  });
}

// ===== ADICIONAR INGREDIENTE (IMPOSSÍVEL DUPLICAR) =====
function adicionarIngrediente(item) {
  if (ingredientesNaReceita.has(item.nome)) return;

  ingredientesNaReceita.add(item.nome);

  receita.push({
    nome: item.nome,
    preco: precosSalvos[item.nome] || 0,
    quantidade: 0,
    unidade: "kg"
  });

  atualizarTabela();
  renderIngredientes();
}

// ===== ATUALIZAR TABELA =====
function atualizarTabela() {
  tabelaReceita.innerHTML = "";
  let total = 0;

  receita.forEach((item, index) => {
    const custo = item.preco * item.quantidade;
    total += custo;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nome}</td>

      <td>
        <input type="number" step="0.01" min="0" value="${item.preco}"
          onchange="
            receita[${index}].preco = this.value;
            precosSalvos['${item.nome}'] = this.value;
            salvarPrecos(precosSalvos);
            atualizarTabela();
          ">
      </td>

      <td>
        <input type="number" step="0.01" min="0" value="${item.quantidade}"
          onchange="
            receita[${index}].quantidade = this.value;
            atualizarTabela();
          ">
      </td>

      <td>
        <select onchange="receita[${index}].unidade = this.value">
          ${unidades.map(u => `<option ${u === item.unidade ? "selected" : ""}>${u}</option>`).join("")}
        </select>
      </td>

      <td>R$ ${custo.toFixed(2)}</td>

      <td>
        <button onclick="removerIngrediente(${index})">❌</button>
      </td>
    `;

    tabelaReceita.appendChild(tr);
  });

  totalSpan.textContent = total.toFixed(2);
}

// ===== REMOVER INGREDIENTE =====
function removerIngrediente(index) {
  ingredientesNaReceita.delete(receita[index].nome);
  receita.splice(index, 1);
  atualizarTabela();
  renderIngredientes();
}
