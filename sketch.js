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

// Objetivo: canto inferior direito se for livre; senão a célula livre mais próxima (varredura a partir daí). excludeIdx = start.
function pickGoal(excludeIdx) {
  let gx = grid.size - 1;
  let gy = grid.size - 1;

  if (!grid.isWall(gx, gy)) {
    let idx = grid.index(gx, gy);
    if (idx !== excludeIdx) return idx;
  }

  for (let y = gy; y >= 0; y--) {
    for (let x = gx; x >= 0; x--) {
      if (grid.isWall(x, y)) continue;
      let idx = grid.index(x, y);
      if (idx !== excludeIdx) return idx;
    }
  }

  return excludeIdx;
}

function resetAll() {
  seed = int(seedInput.value());
  gridSize = max(2, int(sizeInput.value()) || 20);
  speed = speedSlider.value();

  grid = new Grid(gridSize, seed, 0.2);

  cellSize = min(width / grid.size, height / grid.size);

  path = null;

  start = randomFreeNode();
  goal = pickGoal(start);

  grid.clear();

  pathAlgo = pickPathAlgorithm();

  pathAlgo.init(grid, start, goal);

  if (!grid.hasVisited(start)) {
    grid.visit(start, -1);
  }
}

function startSearch() {
  randomSeed(millis());
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
  // 🔴 caminho final
  if (pathAlgo.isFinished()) {
    fill(255, 0, 0);
    for (let p of path || []) {
      let { x, y } = grid.pos(p);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  } else {
    for (let i = 0; i < speed; i++) {
      if (pathAlgo.step()) {
        path = grid.getPath(goal);
        break;
      }
    }
  }

  // 🟡 start / goal
  fill(255, 255, 0);
  let s = grid.pos(start);
  rect(s.x * cellSize, s.y * cellSize, cellSize, cellSize);

  fill(255, 255, 255);
  let g = grid.pos(goal);
  rect(g.x * cellSize, g.y * cellSize, cellSize, cellSize);
}