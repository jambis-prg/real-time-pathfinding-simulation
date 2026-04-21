class BFS extends PathAlgorithm {
  constructor() {
    super();
    this.queue = [];
  }

  init(grid, start, goal) {
    super.init(grid, start, goal);
    this.grid.clear();
    this.queue = [start];
    this.grid.visit(start, -1);
  }

  step() {
    if (this.queue.length === 0 || this.finished) {
      this.finished = true;
      return true;
    }

    let current = this.queue.shift();

    if (current === this.goal) {
      this.finished = true;
      return true;
    }

    let neighbors = this.grid.neighbors(current);

    for (let neighbor of neighbors) {
      if (!this.grid.hasVisited(neighbor)) {
        this.grid.visit(neighbor, current);
        this.queue.push(neighbor);
      }
    }

    return false;
  }
}