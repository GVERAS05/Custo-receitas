let ingredientes = [];
let receita = [];

// Carrega os ingredientes do arquivo JSON
fetch("ingredientes.json")
  .then(resposta => resposta.json())
  .then(dados => {
    ingredientes = dados;
    mostrarIngredientes(ingredientes);
  });

// Elementos da tela
const campoBusca = document.getElementById("busca");
const listaIngredientes = document.getElementById("lista-ingredientes");
const tabelaReceita = document.getElementById("receita");
const totalSpan = document.getElementById("total");

// Filtro de busca
campoBusca.addEventListener("input", () => {
  const texto = campoBusca.value.toLowerCase();

  const filtrados = ingredientes.filter(item =>
    item.nome.toLowerCase().includes(texto)
  );

  mostrarIngredientes(filtrados);
});

// Mostra ingredientes encontrados
function mostrarIngredientes(lista) {
  listaIngredientes.innerHTML = "";

  lista.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.nome;

    li.onclick = () => adicionarIngrediente(item);

    listaIngredientes.appendChild(li);
  });
}

// Adiciona ingrediente à receita
function adicionarIngrediente(item) {
  receita.push({
    nome: item.nome,
    preco: 0,
    quantidade: 0
  });

  atualizarTabela();
}

// Atualiza a tabela da receita
function atualizarTabela() {
  tabelaReceita.innerHTML = "";
  let total = 0;

  receita.forEach((item, index) => {
    const custo = item.preco * item.quantidade;
    total += custo;

    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${item.nome}</td>
      <td>
        <input type="number" min="0" step="0.01"
          value="${item.preco}"
          onchange="receita[${index}].preco = this.value; atualizarTabela()">
      </td>
      <td>
        <input type="number" min="0" step="0.01"
          value="${item.quantidade}"
          onchange="receita[${index}].quantidade = this.value; atualizarTabela()">
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

// Remove ingrediente da receita
function removerIngrediente(index) {
  receita.splice(index, 1);
  atualizarTabela();
}
