class Greedy extends PathAlgorithm {
  constructor() {
    super();
    this.parent = new Map();
    this.queue = [];
    this.visited = new Set();
  }

  init(grid, start, goal) {
    super.init(grid, start, goal);

    // Limpa as estruturas específicas do Greedy
    this.parent.clear();
    this.visited.clear();
    this.queue = [];

    // Configuração inicial: empilha o start com sua heurística até o goal
    this.queue.push({ node: start, h: this.grid.heuristic(start, goal) });
  }

  step() {
    if (this.queue.length === 0) {
      this.finished = true;
      return true;
    }

    // Fila de prioridade: ordena para processar sempre o menor h(n)
    // O guloso ignora o custo acumulado g(n) e usa apenas a heurística
    this.queue.sort((a, b) => b.h - a.h);

    let { node } = this.queue.pop();

    if (this.visited.has(node)) return false;
    this.visited.add(node);

    // Registra no grid para desenho do rastro e reconstrução do caminho
    this.grid.visit(node, this.parent.get(node) ?? -1);

    // Chegou ao objetivo
    if (node === this.goal) {
      this.finished = true;
      return true;
    }

    // Expande vizinhos: descoberta única (sem relaxamento, diferente do A*)
    let neighbors = this.grid.neighbors(node);
    for (let neighbor of neighbors) {
      if (this.visited.has(neighbor) || this.parent.has(neighbor)) continue;

      this.parent.set(neighbor, node);
      let h = this.grid.heuristic(neighbor, this.goal);
      this.queue.push({ node: neighbor, h: h });
    }

    this.grid.frontier = this.queue.map(item => item.node);
    return false;
  }
}
