class Grid {
  constructor(size, seed = 1, wallDensity = 0.15) {
    this.size = size;
    this.seed = seed;
    this.wallDensity = wallDensity;

    this.visited = new Map();
    this.cells = []; // armazena os dados gerados
    
    // inicializa o mapa com Perlin Noise
    this.generatePerlinMap();
  }

  // geração com Perlin Noise
  generatePerlinMap() {
    noiseSeed(this.seed); // define a semente para reprodutibilidade
    let noiseScale = 0.1; // escala dos biomas

    for (let x = 0; x < this.size; x++) {
      this.cells[x] = [];
      for (let y = 0; y < this.size; y++) {
        // Valor para o tipo de terreno
        let v = noise(x * noiseScale, y * noiseScale);
        
        let type;
        if (v < 0.25) {
          type = "water"; // Custo alto
        } else if (v < 0.45) {
          type = "sand";  // Custo médio
        } else {
          type = "grass"; // Custo baixo
        }

        // Valor para as paredes (obstáculos)
        // Usamos um offset (+1000) para o ruído da parede ser diferente do terreno
        let w = noise(x * noiseScale + 1000, y * noiseScale + 1000); 
        let wall = w < this.wallDensity;

        this.cells[x][y] = { 
          type: type, 
          isWall: wall 
        };
      }
    }
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

  terrainType(x, y) {
    return this.cells[x][y].type;
  }

  isWall(x, y) {
    return this.cells[x][y].isWall;
  }

  // custos baseados na tarefa
  cost(x, y) {
    let type = this.terrainType(x, y);
    if (type === "water") return 100; // Custo Alto
    if (type === "sand") return 50;   // Custo Médio
    return 10;                        // Grass / Custo Baixo
  }

  visit(node, parent) {
    this.visited.set(node, parent);
  }
  
  hasVisited(node) {
    return this.visited.has(node);
  }
  
  clear() {
    this.visited.clear();
  }
  
  getPath(goal) {
    let path = [];
    let current = goal;

    while (this.visited.has(current)) {
      path.push(current);
      let parent = this.visited.get(current);
      if (parent === -1 || parent === current || parent === undefined) {
        break;
      }
      current = parent;
    }
    return path.reverse();
  }
  
  neighbors(i) {
    let { x, y } = this.pos(i);
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let result = [];

    for (let d of dirs) {
      let nx = x + d[0];
      let ny = y + d[1];

      if (this.inBounds(nx, ny) && !this.isWall(nx, ny)) {
        result.push(this.index(nx, ny));
      }
    }
    return result;
  }

  heuristic(a, b) {
    let A = this.pos(a);
    let B = this.pos(b);
    return abs(A.x - B.x) + abs(A.y - B.y); // Manhattan
  }

  // Visualização 
  draw(cellSize) {
    noStroke();

    // 1) Desenha o Terreno Base (Biomas Perlin)
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let type = this.terrainType(x, y);

        if (type === "grass") fill(34, 139, 34);      // Verde
        else if (type === "sand") fill(238, 214, 175); // Areia
        else if (type === "water") fill(30, 144, 255); // Azul

        if (this.isWall(x, y)) fill(20); // Obstáculos
        
        rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 2) Sobreposição da busca (Visitados)
    fill(255, 255, 255, 80);
    for (let [node, parent] of this.visited) {
      let { x, y } = this.pos(node);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}