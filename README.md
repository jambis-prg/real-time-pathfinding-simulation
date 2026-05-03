# Pathfinding Visualizer (p5.js)

Interactive pathfinding visualization tool built with **p5.js**.  
It demonstrates how classic graph search algorithms explore a procedural grid in real time.

<img width="683" height="720" alt="image" src="https://github.com/user-attachments/assets/89657a9d-5dcd-4f89-8e90-f5cd0d6a707e" />

<img width="686" height="716" alt="image" src="https://github.com/user-attachments/assets/7ca64337-94d5-47f0-8191-bb85b2cb51a3" />

---

# Core Idea

The system is built around two main components:

-  `Grid` → procedural world + path memory
-  `PathAlgorithm` → interchangeable search strategies

All algorithms operate on the same interface:

```javascript
init(grid, start, goal)
step()
isFinished()
clear()
```

This allows BFS, DFS, Dijkstra, A* and Greedy to be swapped at runtime.

---

# 🌍 Grid System

## 📦 Overview

The `Grid` class represents a **procedural 2D world** used for pathfinding.

Each cell is represented as a single integer:

```javascript
index(x, y) = y * size + x
```

And converted back with:

```javascript
pos(i) → { x, y }
```

This avoids object overhead and simplifies graph traversal.

---

## Procedural Generation

The grid is fully deterministic using:

```javascript
hash(x, y, seed)
```

This ensures:

- same seed → same world
- no stored map data
- reproducible simulations

Used in:

```javascript
terrainType(x, y)
isWall(x, y)
```

---

## 🟩 Terrain System

Each node has a movement cost:

```javascript
cost(x, y)
```

| Terrain | Color | Cost |
|----------|------|------|
| grass    | green | 1 |
| sand     | yellow | 3 |
| water    | blue | 50 |

Used by:
- `Dijkstra`
- `A*`

---

## ⛔ Walls

Walls are generated separately:

```javascript
isWall(x, y)
```

- rendered as black cells
- fully blocking movement
- independent from terrain

---

## Search Memory (visited Map)

The grid stores search state using:

```javascript
visited: Map(node → parent)
```

This is the **core structure of all algorithms**.

Example:

```text
node → parent
goal → ...
...  → ...
start → -1
```

---

## Path Reconstruction

The function:

```javascript
getPath(goal)
```

works by backtracking:

```javascript
while (visited.has(current)) {
  current = visited.get(current)
}
```

It reconstructs:

```
goal → ... → start
```

---

# ⚙️ PathAlgorithm Interface

## 📦 Overview

All algorithms follow a shared interface defined in:

```javascript
class PathAlgorithm
```

This allows full interchangeability between:

- BFS
- DFS
- Dijkstra
- A*
- Greedy

---

## Required Methods

### `init(grid, start, goal)`
Initializes algorithm state:

```javascript
this.grid = grid
this.start = start
this.goal = goal
```

Also resets internal structures like:
- queue
- stack
- priority data
- visited state

---

### `step()`
Executes **one iteration** of the algorithm.

Typical behavior:

```javascript
expand current node
check neighbors
grid.visit(next, current)
add nodes to structure
```

Returns:

- `true` → finished
- `false` → still running

---

### `isFinished()`

Returns whether:

- goal was reached OR
- no more nodes exist

---

### `clear()`

Resets algorithm state so it can be reused:

```javascript
this.finished = false
```

---

# Algorithms in depth

Each implementation shares the same `PathAlgorithm` interface. Below: overview, step-by-step behavior, and trade-offs. A **single comparison table** for all five algorithms appears at the end of this section.

---

## Breadth-First Search (BFS)

### Overview

`BFS` explores the grid **layer by layer**: all nodes at distance *k* from the start are visited before any node at distance *k+1*. On an **unweighted** graph (each move counts as one step), it finds a path with the **minimum number of moves**. It does **not** use `grid.cost(x, y)` — terrain weights are ignored for ordering the search.

### Behavior

```javascript
queue = [start]
visit(start, -1)
while queue not empty:
  current = queue.shift()          // FIFO
  if current == goal → done
  for each unvisited neighbor:
    visit(neighbor, current)
    queue.push(neighbor)
grid.frontier = [...queue]
```

### Trade-offs

- **Strengths:** Complete on finite grids; shortest path in **edge count**; predictable expansion ring.
- **Weaknesses:** Ignores terrain cost — not cheapest path in this project’s weighted map; queue can grow large.

---

## Depth-First Search (DFS)

### Overview

`DFS` goes **as deep as possible** along one branch before backtracking (implicitly, via stack order). It is **not** guaranteed to find the shortest path in edges or cost. Like BFS, it does **not** use terrain weights for expansion order.

### Behavior

```javascript
stack = [start]
visit(start, -1)
while stack not empty:
  current = stack.pop()              // LIFO
  if current == goal → done
  for each unvisited neighbor:
    visit(neighbor, current)
    stack.push(neighbor)
grid.frontier = [...stack]
```

### Trade-offs

- **Strengths:** Low memory in many cases; fast when the goal lies deep along the first branch tried.
- **Weaknesses:** Path length and total terrain cost can be poor; order depends on neighbor enumeration.

---

## Dijkstra's algorithm

### Overview

`Dijkstra` treats each cell’s move cost from `grid.cost(x, y)` (grass, sand, water). It always expands the node with the **smallest known cumulative cost** `g(n)` from the start. With non-negative weights, it finds a **minimum-cost path** to the goal.

### Behavior

```javascript
priority queue ordered by g(n) = distance from start
visit nodes as they are finalized (smallest g first)
relax neighbors: if g(neighbor) improves, update parent and push to queue
grid.frontier = nodes currently in the queue
```

### Trade-offs

- **Strengths:** Optimal path **including terrain**; no heuristic required.
- **Weaknesses:** Explores many nodes “in all directions”; slower than A* or Greedy when a good heuristic exists.

---

## A* (A-Star)

### Overview

`A*` combines **accumulated cost** `g(n)` with the **Manhattan heuristic** `h(n)` to the goal: `f(n) = g(n) + h(n)`. With a consistent/admissible heuristic (Manhattan on a grid without diagonal moves is admissible here), it finds an **optimal** minimum-cost path like Dijkstra but typically **fewer expansions**.

### Behavior

```javascript
priority queue ordered by f(n) = g(n) + grid.heuristic(node, goal)
when a cheaper path to a node is found, relax and update parent
grid.frontier = open queue nodes
```

### Trade-offs

- **Strengths:** Optimal terrain-aware path; usually faster than Dijkstra toward the goal.
- **Weaknesses:** Still more work than Greedy; heuristic must remain admissible for guaranteed optimality.

---

## Greedy Best-First Search

### Overview

The `Greedy` algorithm prioritizes nodes using **only** the heuristic `h(n)`:

```javascript
f(n) = h(n)   // Manhattan distance to goal
```

Unlike A*, it **does not** accumulate path cost `g(n)`. Unlike Dijkstra, it **ignores terrain cost** when choosing what to expand next.

### Behavior

```javascript
queue.sort((a, b) => b.h - a.h)
let node = queue.pop()           // smallest h(n)
expand neighbors with h(neighbor, goal)
```

Neighbors are discovered **only once** (no relaxation): without a global cost function there is no “better path” to update.

### Trade-offs

- **Strengths:** Very fast; strongly directed toward the goal.
- **Weaknesses:** Not optimal; may cross expensive terrain because only Euclidean/grid distance to the goal matters.

---

## Comparison across algorithms

Summary table for this project’s implementations:

| Property | BFS | DFS | Dijkstra | A* | Greedy |
|----------|-----|-----|----------|-----|--------|
| Frontier structure | Queue (FIFO) | Stack (LIFO) | Priority by `g` | Priority by `g+h` | Priority by `h` |
| Uses `grid.cost` | No | No | Yes | Yes | No |
| Uses `grid.heuristic` | No | No | No | Yes | Yes |
| Shortest in **edge count** | Yes (unweighted) | No | No | No | No |
| Minimum **terrain cost** path | No | No | Yes | Yes (admissible `h`) | No |
| Typical speed vs goal | Moderate | Variable | Slower | Balanced | Fastest expansion toward goal |

Greedy tends to feel fastest toward the goal visually but may choose **expensive** cells; Dijkstra and A* trade more exploration for **cheaper** total movement cost where grass/sand/water differ.

---

# Execution Model

Algorithms are executed incrementally:

```javascript
for (let i = 0; i < speed; i++) {
  algorithm.step();
}
```

This enables:

- real-time visualization
- animation of exploration
- comparison between algorithms

---

# 🎛️ User Interface (UI)

The system includes a fully interactive UI for controlling the simulation.

---

## ▶ Start Button

Starts a new simulation:

```javascript
startSearch()
```

Triggers:

- `grid.clear()`
- random start/goal generation
- algorithm `init()`

---

## Clear Button

Resets the simulation:

```javascript
resetAll()
```

Clears:

- visited map
- path data
- algorithm state

---

## Algorithm Selector

Implemented via dropdown:

```javascript
"BFS"
"DFS"
"Dijkstra"
"A*"
"Greedy"
```

Switches active instance of:

```javascript
algorithm = new BFS()
algorithm = new DFS()
algorithm = new Greedy()
```

---

## Seed Input

Controls procedural generation:

```javascript
new Grid(size, seed)
```

- same seed = same map
- used in `hash(x, y, seed)`

---

## Grid Size Input

Controls:

```javascript
new Grid(size, seed)
```

- resolution of simulation
- number of nodes = size²

---

## ⚡ Speed Slider

Controls execution speed:

```javascript
for (let i = 0; i < speed; i++)
```

Range:

- 1x → slow debug mode
- 5–10x → fast simulation

---

## Start & Goal Generation

Generated using:

```javascript
randomFreeNode()
```

Rules:

- cannot be walls
- cannot overlap
- always valid position

---

# Visualization Layers

Rendering order:

### 1. Terrain
```javascript
grass / sand / water
```

### 2. Walls
```javascript
isWall(x, y) → black
```

### 3. Exploration
```javascript
visited nodes overlay
```

### 4. Path
```javascript
getPath(goal) → red path
```

### 5. Special Nodes
- Start → yellow
- Goal → white

---

# Design Philosophy

This project is built around:

- single source of truth (`Grid`)
- modular algorithms (`PathAlgorithm`)
- procedural deterministic world
- real-time step execution
- visual learning of graph search

---

# Result

The system allows:

- BFS vs DFS vs Dijkstra vs A* vs Greedy
- real-time path visualization
- procedural map generation
- algorithm comparison in identical conditions
