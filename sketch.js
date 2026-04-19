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

function randomFreeNode(exclude = -1) {
  let maxTries = grid.cols * grid.rows;

  for (let i = 0; i < maxTries; i++) {

    let x = floor(random(grid.cols));
    let y = floor(random(grid.rows));

    if (grid.isWall(x, y)) continue;

    let idx = grid.index(x, y);

    if (idx === exclude) continue;

    return idx;
  }

  // fallback: procura linearmente
  for (let i = 0; i < grid.cols * grid.rows; i++) {
    let { x, y } = grid.pos(i);

    if (!grid.isWall(x, y) && i !== exclude) {
      return i;
    }
  }

  // último fallback extremo
  return 0;
}

function resetAll() {
  seed = int(seedInput.value());
  gridSize = int(sizeInput.value());
  speed = speedSlider.value();

  algo = algoSelect.value().toLowerCase();

  grid = new Grid(gridSize, seed, 0.2);

  cellSize = min(width / grid.size, height / grid.size);

  path = null;

  start = randomFreeNode();
  goal = grid.index(grid.size - 1, grid.size - 1);

  grid.clear();

  if (algo === "bfs") {
    pathAlgo = new BFS();
  } else if (algo === "dfs") {
    pathAlgo = new DFS();
  } else if (algo === "dijkstra") {
    pathAlgo = new Dijkstra();
  } else if (algo === "A*") {
    pathAlgo = new AStar();
  }

  grid.visit(start, start);
  pathAlgo.init(grid, start, goal);
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
  
  grid.draw(cellSize);
  // 🔴 caminho final
  if (pathAlgo.isFinished()) {
    fill(255, 0, 0);
    for (let p of path) {
      let { x, y } = grid.pos(p);
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  } else{
    for (let i = 0; i < speed; i++) {
      if (pathAlgo.step())
      {
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