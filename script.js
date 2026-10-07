const ROWS = 20;
const COLS = 25;

const gridElement = document.getElementById("grid");
const algorithmSelect = document.getElementById("algorithm");
const runBtn = document.getElementById("runBtn");
const mazeBtn = document.getElementById("mazeBtn");
const clearBtn = document.getElementById("clearBtn");

const algorithmName = document.getElementById("algorithmName");
const visitedCount = document.getElementById("visitedCount");
const pathLength = document.getElementById("pathLength");
const timeTaken = document.getElementById("timeTaken");
const statusText = document.getElementById("statusText");

let grid = [];
let start = { row: 10, col: 5 };
let end = { row: 10, col: 19 };

let isDrawing = false;
let running = false;

function createGrid() {

    grid = [];

    for (let row = 0; row < ROWS; row++) {

        const rowArray = [];

        for (let col = 0; col < COLS; col++) {

            rowArray.push({
                row: row,
                col: col,
                wall: false
            });
        }

        grid.push(rowArray);
    }

    renderGrid();
}

function renderGrid() {

    gridElement.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = row;
            cell.dataset.col = col;

            const node = grid[row][col];

            if (node.wall) {
                cell.classList.add("wall");
            }

            if (row === start.row && col === start.col) {
                cell.classList.add("start");
            }

            if (row === end.row && col === end.col) {
                cell.classList.add("end");
            }

            cell.addEventListener("pointerdown", function (event) {

                if (running) return;

                event.preventDefault();

                isDrawing = true;

                toggleWall(row, col);

            });

            cell.addEventListener("pointerenter", function () {

                if (running) return;

                if (isDrawing) {
                    toggleWall(row, col);
                }

            });

            gridElement.appendChild(cell);
        }
    }
}

document.addEventListener("pointerup", function () {
    isDrawing = false;
});

function toggleWall(row, col) {

    if (
        (row === start.row && col === start.col) ||
        (row === end.row && col === end.col)
    ) {
        return;
    }

    grid[row][col].wall = !grid[row][col].wall;

    renderGrid();
}

function getNeighbors(node) {

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    const neighbors = [];

    for (const direction of directions) {

        const newRow = node.row + direction[0];
        const newCol = node.col + direction[1];

        if (
            newRow >= 0 &&
            newRow < ROWS &&
            newCol >= 0 &&
            newCol < COLS
        ) {

            if (!grid[newRow][newCol].wall) {
                neighbors.push(grid[newRow][newCol]);
            }
        }
    }

    return neighbors;
}

function getCellElement(row, col) {

    const index = row * COLS + col;

    return gridElement.children[index];
}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));
}

async function bfs() {

    const queue = [];

    const visited = new Set();

    const parent = new Map();

    const startNode = grid[start.row][start.col];

    const endKey = `${end.row},${end.col}`;

    queue.push(startNode);

    visited.add(`${start.row},${start.col}`);

    let visitedNodes = 0;

    while (queue.length > 0) {

        const current = queue.shift();

        visitedNodes++;

        const currentKey = `${current.row},${current.col}`;

        if (
            !(current.row === start.row &&
              current.col === start.col) &&
            !(current.row === end.row &&
              current.col === end.col)
        ) {

            getCellElement(current.row, current.col)
                .classList.add("visited");
        }

        await sleep(25);

        if (currentKey === endKey) {

            return {
                found: true,
                parent: parent,
                visited: visitedNodes
            };
        }

        const neighbors = getNeighbors(current);

        for (const neighbor of neighbors) {

            const key = `${neighbor.row},${neighbor.col}`;

            if (!visited.has(key)) {

                visited.add(key);

                parent.set(key, currentKey);

                queue.push(neighbor);
            }
        }
    }

    return {
        found: false,
        parent: parent,
        visited: visitedNodes
    };
}

async function dfs() {

    const stack = [];

    const visited = new Set();

    const parent = new Map();

    const startNode = grid[start.row][start.col];

    const endKey = `${end.row},${end.col}`;

    stack.push(startNode);

    visited.add(`${start.row},${start.col}`);

    let visitedNodes = 0;

    while (stack.length > 0) {

        const current = stack.pop();

        visitedNodes++;

        const currentKey = `${current.row},${current.col}`;

        if (
            !(current.row === start.row &&
              current.col === start.col) &&
            !(current.row === end.row &&
              current.col === end.col)
        ) {

            getCellElement(current.row, current.col)
                .classList.add("visited2");
        }

        await sleep(25);

        if (currentKey === endKey) {

            return {
                found: true,
                parent: parent,
                visited: visitedNodes
            };
        }

        const neighbors = getNeighbors(current);

        for (let i = neighbors.length - 1; i >= 0; i--) {

            const neighbor = neighbors[i];

            const key = `${neighbor.row},${neighbor.col}`;

            if (!visited.has(key)) {

                visited.add(key);

                parent.set(key, currentKey);

                stack.push(neighbor);
            }
        }
    }

    return {
        found: false,
        parent: parent,
        visited: visitedNodes
    };
}

async function drawPath(parent) {

    let currentKey = `${end.row},${end.col}`;

    const startKey = `${start.row},${start.col}`;

    const path = [];

    while (currentKey !== startKey) {

        if (!parent.has(currentKey)) {
            return 0;
        }

        path.push(currentKey);

        currentKey = parent.get(currentKey);
    }

    path.push(startKey);

    path.reverse();

    for (const key of path) {

        const parts = key.split(",");

        const row = Number(parts[0]);
        const col = Number(parts[1]);

        if (
            !(row === start.row && col === start.col) &&
            !(row === end.row && col === end.col)
        ) {

            getCellElement(row, col)
                .classList.remove("visited");

            getCellElement(row, col)
                .classList.remove("visited2");

            getCellElement(row, col)
                .classList.add("path");
        }

        await sleep(45);
    }

    return path.length - 1;
}

function clearVisualization() {

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            const cell = getCellElement(row, col);

            cell.classList.remove("visited");
            cell.classList.remove("visited2");
            cell.classList.remove("path");
        }
    }

    visitedCount.textContent = "0";
    pathLength.textContent = "0";
    timeTaken.textContent = "0 ms";
}

async function runAlgorithm() {

    if (running) return;

    running = true;

    runBtn.disabled = true;
    mazeBtn.disabled = true;
    clearBtn.disabled = true;

    clearVisualization();

    const algorithm = algorithmSelect.value;

    algorithmName.textContent =
        algorithm === "bfs" ? "BFS" : "DFS";

    statusText.textContent =
        algorithm === "bfs"
            ? "BFS is searching..."
            : "DFS is searching...";

    const startTime = performance.now();

    let result;

    if (algorithm === "bfs") {
        result = await bfs();
    } else {
        result = await dfs();
    }

    const endTime = performance.now();

    const elapsed = (endTime - startTime).toFixed(2);

    visitedCount.textContent = result.visited;
    timeTaken.textContent = elapsed + " ms";

    if (result.found) {

        statusText.textContent =
            "Path found! Drawing the final path...";

        const length = await drawPath(result.parent);

        pathLength.textContent = length;

        statusText.textContent =
            algorithm === "bfs"
                ? "✅ BFS completed successfully!"
                : "✅ DFS completed successfully!";

    } else {

        statusText.textContent =
            "❌ No path could be found.";

        pathLength.textContent = "0";
    }

    runBtn.disabled = false;
    mazeBtn.disabled = false;
    clearBtn.disabled = false;

    running = false;
}

function clearBoard() {

    if (running) return;

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            grid[row][col].wall = false;
        }
    }

    clearVisualization();

    statusText.textContent =
        "Board cleared. Create your maze and run an algorithm.";

    renderGrid();
}

function generateMaze() {

    if (running) return;

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            grid[row][col].wall = false;

            if (
                !(row === start.row && col === start.col) &&
                !(row === end.row && col === end.col)
            ) {

                if (Math.random() < 0.27) {
                    grid[row][col].wall = true;
                }
            }
        }
    }

    clearVisualization();

    renderGrid();

    statusText.textContent =
        "🧩 Random maze generated!";
}

algorithmSelect.addEventListener("change", function () {

    algorithmName.textContent =
        algorithmSelect.value === "bfs"
            ? "BFS"
            : "DFS";
});

runBtn.addEventListener("click", runAlgorithm);

mazeBtn.addEventListener("click", generateMaze);

clearBtn.addEventListener("click", clearBoard);

createGrid();
