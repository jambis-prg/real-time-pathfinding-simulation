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

This allows BFS, DFS, Dijkstra and A* to be swapped at runtime.

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
```

Switches active instance of:

```javascript
algorithm = new BFS()
algorithm = new DFS()
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

- BFS vs DFS vs Dijkstra vs A*
- real-time path visualization
- procedural map generation
- algorithm comparison in identical conditions
