class DFS extends PathAlgorithm {
  constructor() {
    super();
    this.stack = []; // fronteira da busca (LIFO)
  }

  // inicializa o estado da busca
  init(grid, start, goal) {
    super.init(grid, start, goal); // define grid, start e goal na classe pai
    this.grid.clear(); // limpa o mapa de visitados anterior
    this.stack = [start]; // inicia a fronteira com o ponto inicial
    
    // armazena o nó inicial como visitado com um marcador de raiz (-1)
    this.grid.visit(start, -1);
  }

  // executa um passo da busca por iteração (para animação)
  step() {
    // se a pilha estiver vazia ou já finalizou, não faz nada
    if (this.stack.length === 0 || this.finished) {
      this.finished = true;
      return true;
    }

    // DFS remove o último elemento adicionado (Pilha/LIFO)
    let current = this.stack.pop();

    // verifica se alcançou o objetivo
    if (current === this.goal) {
      this.finished = true;
      return true;
    }

    // obtém vizinhos válidos (dentro dos limites e não paredes)
    let neighbors = this.grid.neighbors(current);

    for (let neighbor of neighbors) {
      // se o vizinho ainda não foi explorado
      if (!this.grid.hasVisited(neighbor)) {
        this.grid.visit(neighbor, current); // registra a visita e o pai para reconstruir o caminho
        this.stack.push(neighbor); // adiciona na fronteira para exploração profunda
      }
    }
    this.grid.frontier = [...this.stack];
    
    return false;
  }
}