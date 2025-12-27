let ingredientes = [];
let receita = [];

// Unidades disponíveis
const unidades = ["kg", "g", "litro", "ml", "unidade"];

// ===== MEMÓRIA (localStorage) =====
function carregarPrecosSalvos() {
  return JSON.parse(localStorage.getItem("precosIngredientes")) || {};
}

function salvarPrecos(precos) {
  localStorage.setItem("precosIngredientes", JSON.stringify(precos));
}

let precosSalvos = carregarPrecosSalvos();

// ===== CARREGAR INGREDIENTES =====
fetch("ingredientes.json")
  .then(res => res.json())
  .then(dados => {
    ingredientes = dados;
    mostrarIngredientes(ingredientes);
  });

// ===== ELEMENTOS =====
const campoBusca = document.getElementById("busca");
const listaIngredientes = document.getElementById("lista-ingredientes");
const tabelaReceita = document.getElementById("receita");
const totalSpan = document.getElementById("total");

// ===== BUSCA =====
campoBusca.addEventListener("input", () => {
  const texto = campoBusca.value.toLowerCase();
  const filtrados = ingredientes.filter(i =>
    i.nome.toLowerCase().includes(texto)
  );
  mostrarIngredientes(filtrados);
});

// ===== LISTAR INGREDIENTES =====
function mostrarIngredientes(lista) {
  listaIngredientes.innerHTML = "";

  lista.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.nome;
    li.onclick = () => adicionarIngrediente(item);
    listaIngredientes.appendChild(li);
  });
}

// ===== ADICIONAR INGREDIENTE (SEM DUPLICAR) =====
function adicionarIngrediente(item) {
  const jaExiste = receita.find(i => i.nome === item.nome);

  if (jaExiste) {
    alert("Esse ingrediente já foi adicionado à receita.");
    return;
  }

  receita.push({
    nome: item.nome,
    preco: precosSalvos[item.nome] || 0,
    quantidade: 0,
    unidade: "kg"
  });

  atualizarTabela();
}

// ===== ATUALIZAR TABELA =====
function atualizarTabela() {
  tabelaReceita.innerHTML = "";
  let total = 0;

  receita.forEach((item, index) => {
    const custo = item.preco * item.quantidade;
    total += custo;

    const opcoesUnidade = unidades
      .map(u => `<option value="${u}" ${u === item.unidade ? "selected" : ""}>${u}</option>`)
      .join("");

    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${item.nome}</td>

      <td>
        <input type="number" min="0" step="0.01"
          value="${item.preco}"
          onchange="
            receita[${index}].preco = this.value;
            precosSalvos['${item.nome}'] = this.value;
            salvarPrecos(precosSalvos);
            atualizarTabela();
          ">
      </td>

      <td>
        <input type="number" min="0" step="0.01"
          value="${item.quantidade}"
          onchange="
            receita[${index}].quantidade = this.value;
            atualizarTabela();
          ">
      </td>

      <td>
        <select onchange="receita[${index}].unidade = this.value">
          ${opcoesUnidade}
        </select>
      </td>

      <td>R$ ${custo.toFixed(2)}</td>

      <td>
        <button onclick="removerIngrediente(${index})">❌</button>
      </td>
    `;

    tabelaReceita.appendChild(linha);
  });

  totalSpan.textContent = total.toFixed(2);
}

// ===== REMOVER INGREDIENTE =====
function removerIngrediente(index) {
  receita.splice(index, 1);
  atualizarTabela();
}
