class PathAlgorithm {
  constructor() {
    this.grid = null;
    this.start = null;
    this.goal = null;
    this.finished = false;
  }

  init(grid, start, goal) {
    this.grid = grid;
    this.start = start;
    this.goal = goal;
    this.finished = false;
  }

  step() {}

  isFinished() {
    return this.finished;
  }
}