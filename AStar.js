class AStar extends PathAlgorithm {
  constructor() {
    super();
    this.dist = new Map();
    this.parent = new Map();
    this.queue = [];
    this.visited = new Set();
  }

  init(grid, start, goal) {
    super.init(grid, start, goal);

    // 2. Limpa as estruturas específicas do Dijkstra
    this.dist.clear();
    this.parent.clear();
    this.visited.clear();
    this.queue = [];

    // 3. Configuração inicial do Dijkstra
    this.dist.set(start, 0);
    this.queue.push({ node: start, cost: 0 });
  }

  step() {
    if (this.queue.length === 0){
      this.finished = true;
      return true;
    }

    // Fila de prioridade: ordena para processar sempre o menor custo acumulado
    this.queue.sort((a, b) => b.cost - a.cost);
    
    let { node, cost } = this.queue.pop();

    if (this.visited.has(node)) return;
    this.visited.add(node);

    // Registra no grid para que o Grid.js saiba desenhar o 'rastro' e o caminho
    // Passamos o node e o seu pai (se não tiver pai, passamos -1)
    this.grid.visit(node, this.parent.get(node) ?? -1);

    // Se achou o objetivo, interrompe o step atual
    if (node === this.goal) {
      this.finished = true;
      return true;
    }

    // Expansão de vizinhos usando a lógica do Grid.js
    let neighbors = this.grid.neighbors(node);
    for (let neighbor of neighbors) {
      let { x, y } = this.grid.pos(neighbor);
      
      // Aqui está o segredo do Dijkstra: o custo do terreno!
      let weight = this.grid.cost(x, y); 
      let newCost = this.dist.get(node) + weight;

      // Se for um caminho melhor (ou novo), atualiza
      if (!this.dist.has(neighbor) || newCost < this.dist.get(neighbor)) {
        this.dist.set(neighbor, newCost);
        this.parent.set(neighbor, node);
        
        let f = newCost + this.grid.heuristic(neighbor, this.goal);

        this.queue.push({ node: neighbor, cost: f });
      }
    }
    this.grid.frontier = this.queue.map(item => item.node);
    return false;
  }
}