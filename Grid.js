class Grid {
  constructor(size, seed = 1, wallDensity = 0.15) {
    this.size = size;
    this.seed = seed;
    this.wallDensity = wallDensity;

    this.visited = new Map();
  }

  index(x, y) {
    return y * this.size + x;
  }

  pos(i) {
    return {
      x: i % this.size,
      y: Math.floor(i / this.size)
    };
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  // -------------------------
  // hash determinístico
  // -------------------------
  hash(x, y) {
    let n = x * 374761393 ^ y * 668265263 ^ this.seed * 1442695041;
    n = (n ^ (n >> 13)) * 1274126177;
    return Math.abs(n);
  }

  // -------------------------
  // tipo de terreno (bioma)
  // -------------------------
  terrainType(x, y) {
    let v = this.hash(x, y) % 100;

    if (v < 15) return "water";   // 15%
    if (v < 35) return "sand";    // 20%
    return "grass";               // 65%
  }

  // -------------------------
  // custo (para pathfinding)
  // -------------------------
  cost(x, y) {
    let type = this.terrainType(x, y);

    if (type === "water") return 50; // quase proibido
    if (type === "sand") return 3;
    return 1; // grass
  }

  // -------------------------
  // parede (opcional)
  // água pode ser bloqueada aqui se quiser
  // -------------------------
  isWall(x, y) {
    let v = this.hash(x, y + 9999) % 1000; 
    return v < this.wallDensity * 1000;
  }

  visit(node, parent){
    this.visited.set(node, parent);
  }
  
  hasVisited(node){
    return this.visited.has(node);
  }
  
  clear(){
    this.visited.clear();
  }
  
  getPath(goal) {
    let path = [];
    let current = goal;

    while (this.visited.has(current)) {
      path.push(current);

      let parent = this.visited.get(current);

      // chegou na raiz (parent inválido ou self-parent)
      if (parent === -1 || parent === current || parent === undefined) {
        break;
      }

      current = parent;
    }

    return path.reverse();
  }
  
  // -------------------------
  // vizinhos
  // -------------------------
  neighbors(i) {
    let { x, y } = this.pos(i);

    let dirs = [
      [1, 0], [-1, 0],
      [0, 1], [0, -1]
    ];

    let result = [];

    for (let d of dirs) {
      let nx = x + d[0];
      let ny = y + d[1];

      if (!this.inBounds(nx, ny)) continue;
      if (this.isWall(nx, ny)) continue;

      result.push(this.index(nx, ny));
    }

    return result;
  }

  // -------------------------
  // heurística A*
  // -------------------------
  heuristic(a, b) {
    let A = this.pos(a);
    let B = this.pos(b);
    return abs(A.x - B.x) + abs(A.y - B.y);
  }

  // -------------------------
  // visualização
  // -------------------------
  draw(cellSize) {
    noStroke();

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {

        let type = this.terrainType(x, y);

        // 🎨 cores dos biomas
        if (type === "grass") {
          fill(50, 200, 80);   // verde
        } 
        else if (type === "sand") {
          fill(240, 220, 120); // amarelo
        } 
        else if (type === "water") {
          fill(60, 120, 255);  // azul
        }

        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 2) sobrescreve paredes (preto)
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {

        if (this.isWall(x, y)) {
          fill(0); // preto absoluto
          rect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // 3) opcional: visited debug overlay
    fill(0, 255, 0);
    for (let [node, parent] of this.visited) {
      let { x, y } = this.pos(node);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}