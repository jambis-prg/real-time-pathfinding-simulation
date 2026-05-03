const State = {
  SEARCHING: 0,
  MOVING: 1
};

let grid;
let cellSize;

let pathAlgo;

let path;

let start, goal;

let algo = "bfs";

let speed = 1;
let gridSize = 20;
let seed = 1;

let startBtn, clearBtn;
let algoSelect, seedInput, sizeInput, speedSlider;

let state = State.SEARCHING;
let agentIndex = 0;
let agentNode = null;

let moveFrameCounter = 0;
let moveDelay = 5; // maior = mais lento

let moveProgress = 0; // Vai de 0 a 1 entre uma célula e outra
let agentNodePos = null;
let score = 0; // Contador de comida

function setupUI() {

  startBtn = createButton("Start");
  startBtn.mousePressed(startSearch);

  algoSelect = createSelect();
  algoSelect.option("BFS");
  algoSelect.option("DFS");
  algoSelect.option("Dijkstra");
  algoSelect.option("A*");
  
  seedInput = createInput("1");

  sizeInput = createInput("20");

  speedSlider = createSlider(1, 10, 1);

  createDiv("Algorithm");
  createDiv("Seed");
  createDiv("Grid Size");
  createDiv("Speed (1x - 10x)");
}

function pickPathAlgorithm() {
  let idx = algoSelect.elt.selectedIndex;
  if (idx < 0 || idx > 3) idx = 0;

  switch (idx) {
    case 0:
      return new BFS();
    case 1:
      return new DFS();
    case 2:
      return new Dijkstra();
    case 3:
      return new AStar();
    default:
      return new BFS();
  }
}

function randomFreeNode(exclude = -1) {
  let maxTries = grid.size * grid.size;

  for (let i = 0; i < maxTries; i++) {

    let x = floor(random(grid.size));
    let y = floor(random(grid.size));

    if (grid.isWall(x, y)) continue;

    let idx = grid.index(x, y);

    if (idx === exclude) continue;

    return idx;
  }

  // fallback: procura linearmente
  for (let i = 0; i < maxTries; i++) {
    let { x, y } = grid.pos(i);

    if (!grid.isWall(x, y) && i !== exclude) {
      return i;
    }
  }

  // último fallback extremo
  return 0;
}

function resetAll() {
  score = 0;
  
  seed = int(seedInput.value());
  gridSize = max(2, int(sizeInput.value()) || 20);
  speed = speedSlider.value();

  randomSeed(seed);

  grid = new Grid(gridSize, seed, 0.2);
  cellSize = min(width / grid.size, height / grid.size);

  path = null;

  start = randomFreeNode();
  goal = randomFreeNode(start);

  grid.clear();

  pathAlgo = pickPathAlgorithm();
  pathAlgo.init(grid, start, goal);

  if (!grid.hasVisited(start)) {
    grid.visit(start, -1);
  }

  state = State.SEARCHING;
  agentIndex = 0;
  agentNode = start;
}

function startSearch() {
  resetAll();
}

function setup() {
  createCanvas(600, 600);
  setupUI();
  resetAll();
}

function draw() {
  background(0);

  speed = speedSlider.value();

  if (!pathAlgo) return;

  grid.draw(cellSize);

  if (state === State.SEARCHING) {

    for (let i = 0; i < speed; i++) {
      if (pathAlgo.step()) {
        path = grid.getPath(goal);

        agentIndex = 0;
        agentNode = path[0];

        state = State.MOVING;
        break;
      }
    }

  } else if (state === State.MOVING) {
    if (path && agentIndex < path.length - 1) {
      let currentNode = path[agentIndex];
      let nextNode = path[agentIndex + 1];
      
      let p1 = grid.pos(currentNode);
      let p2 = grid.pos(nextNode);

      // 1. Calcula a velocidade baseada no custo do terreno de ORIGEM
      let terrainWeight = grid.cost(p1.x, p1.y);
      
      // Ajuste o valor '0.1' para mudar a velocidade geral
      // Quanto maior o peso (água=50), menor o incremento no progresso
      let stepSize = 0.5 / terrainWeight; 
      
      moveProgress += stepSize;

      // 2. Interpola a posição para o desenho
      let visualX = lerp(p1.x, p2.x, moveProgress);
      let visualY = lerp(p1.y, p2.y, moveProgress);
      agentNodePos = { x: visualX, y: visualY }; // Usaremos isso para desenhar

      // 3. Quando chega em 1, pula para o próximo nó
      if (moveProgress >= 1) {
        moveProgress = 0;
        agentIndex++;
        agentNode = path[agentIndex];
      }
    } else {
      // O agente tocou na comida!
      score++; // Incrementa o contador
      
      // Transfere o objetivo atual para o novo ponto de partida
      start = goal;
      // Sorteia um novo objetivo aleatório no mapa atual
      goal = randomFreeNode(start);
      
      // Limpa os dados de visualização da busca anterior
      grid.clear();
      
      // Reinicia o algoritmo para o novo alvo
      pathAlgo = pickPathAlgorithm();
      pathAlgo.init(grid, start, goal);
      grid.visit(start, -1);
      
      // Reseta os estados de controle de animação
      path = null;
      agentIndex = 0;
      agentNode = start;
      agentNodePos = null;
      moveProgress = 0;
      state = State.SEARCHING;
    }
  }

  grid.draw(cellSize); // desenha o mapa, obstáculos e os visitados 

  if (path && state === State.MOVING) {
    // Isso cria o efeito de "revelar" o bioma sob uma névoa clara
    fill(255, 255, 255, 120); 
    for (let p of path) {
      let { x, y } = grid.pos(p);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Alvo (Vermelho sólido)
  fill(255, 0, 0);
  let g = grid.pos(goal);
  rect(g.x * cellSize, g.y * cellSize, cellSize, cellSize);
  
  // Desenho do agente dinâmico
  if (state === State.MOVING && agentNodePos) {
    fill(255, 255, 0);
    rect(agentNodePos.x * cellSize, agentNodePos.y * cellSize, cellSize, cellSize);
  } else if (agentNode !== null) {
    fill(255, 255, 0);
    let a = grid.pos(agentNode);
    rect(a.x * cellSize, a.y * cellSize, cellSize, cellSize);
  }
  
  // Placar na tela
  fill(0); // Cor branca
  textSize(20); // Tamanho da fonte
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}