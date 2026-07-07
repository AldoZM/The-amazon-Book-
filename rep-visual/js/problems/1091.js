/* 1091. Shortest Path in Binary Matrix — BFS 8-direccional de esquina a esquina. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["1091"] = {
    num: 1091, slug: "shortest-path-binary-matrix", title: "Shortest Path in Binary Matrix",
    difficulty: "M", block: "grafos", tags: ["BFS", "grid", "8 direcciones"],
    summary: L(
      "Camino más corto de (0,0) a (n-1,n-1) por celdas libres (0), moviéndose en 8 direcciones. BFS: la primera vez que llegamos al destino es la distancia mínima.",
      "Shortest path from (0,0) to (n-1,n-1) through clear cells (0), moving in 8 directions. BFS: the first time we reach the goal is the minimum distance."),
    legend: [
      { cls: "wall", label: L("bloqueada (1)", "blocked (1)") },
      { cls: "water", label: L("libre sin visitar", "clear, unvisited") },
      { cls: "visited", label: L("visitada (dist)", "visited (dist)") },
      { cls: "current", label: L("celda actual", "current cell") },
      { cls: "target", label: L("destino", "goal") },
    ],
    code: {
      es: [
        "funcion shortestPath(grid):",
        "  si grid[0][0]==1 o grid[n-1][n-1]==1: retornar -1",
        "  cola ← [(0,0)]; dist[0][0] ← 1",
        "  mientras cola no vacía:",
        "    (r,c) ← sacar de la cola",
        "    si (r,c) es la esquina final: retornar dist[r][c]",
        "    para cada una de las 8 vecinas:",
        "      si libre y no visitada:",
        "        dist[vecina] ← dist[r][c] + 1",
        "        meter vecina en la cola",
        "  retornar -1",
      ],
      en: [
        "function shortestPath(grid):",
        "  if grid[0][0]==1 or grid[n-1][n-1]==1: return -1",
        "  queue ← [(0,0)]; dist[0][0] ← 1",
        "  while queue not empty:",
        "    (r,c) ← pop from queue",
        "    if (r,c) is the final corner: return dist[r][c]",
        "    for each of the 8 neighbors:",
        "      if clear and unvisited:",
        "        dist[neighbor] ← dist[r][c] + 1",
        "        push neighbor into queue",
        "  return -1",
      ],
    },
    cases: [
      { name: L("Camino 4 (3×3)", "Path 4 (3×3)"), input: [[0,0,0],[1,1,0],[1,1,0]] },
      { name: L("Bloqueado (-1)", "Blocked (-1)"), input: [[0,1],[1,0]] },
      { name: L("Diagonal 5×5", "Diagonal 5×5"), input: [
        [0,0,0,0,0],
        [1,1,1,1,0],
        [0,0,0,1,0],
        [0,1,0,0,0],
        [0,1,1,1,0]] },
    ],

    build(input) {
      const n = input.length;
      const dist = input.map((r) => r.map(() => 0));
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      const steps = [];
      const q = [];
      let cur = null;

      const snap = (note, line) => {
        const cells = input.map((row, r) => row.map((v, c) => {
          let cls;
          if (cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (v === 1) cls = "wall";
          else if (r === n - 1 && c === n - 1 && dist[r][c] === 0) cls = "target";
          else if (dist[r][c] > 0) cls = "visited";
          else cls = "water";
          return { v: v === 1 ? "1" : (dist[r][c] || ""), cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: L("grid (número = distancia)", "grid (number = distance)"), coords: true },
          queue: { label: L("Cola BFS", "BFS queue"), arrows: true, items: q.map((p) => p[0] + "," + p[1]) } });
      };

      if (input[0][0] === 1 || input[n-1][n-1] === 1) {
        snap(L("El inicio o el final está bloqueado: no hay camino. Respuesta <b>-1</b>.",
               "The start or the end is blocked: no path. Answer <b>-1</b>."), 1);
        return steps;
      }
      q.push([0, 0]); dist[0][0] = 1;
      snap(L("Arrancamos en (0,0) con distancia 1.", "Start at (0,0) with distance 1."), 2);

      while (q.length) {
        const [r, c] = q.shift();
        cur = [r, c];
        if (r === n - 1 && c === n - 1) {
          snap(L(`Llegamos al destino con distancia <b>${dist[r][c]}</b>. Camino más corto.`,
                 `Reached the goal with distance <b>${dist[r][c]}</b>. Shortest path.`), 5);
          return steps;
        }
        snap(L(`Expandimos (${r},${c}), dist ${dist[r][c]}. Miramos sus 8 vecinas.`,
               `Expand (${r},${c}), dist ${dist[r][c]}. Look at its 8 neighbors.`), [4, 6]);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
          if (input[nr][nc] === 1 || dist[nr][nc] > 0) continue;
          dist[nr][nc] = dist[r][c] + 1;
          q.push([nr, nc]);
          cur = [nr, nc];
          snap(L(`(${nr},${nc}) libre → dist ${dist[nr][nc]}, entra a la cola.`,
                 `(${nr},${nc}) clear → dist ${dist[nr][nc]}, enters the queue.`), [8, 9]);
        }
      }
      cur = null;
      snap(L("Se agotó la cola sin llegar al final. Respuesta <b>-1</b>.",
             "Queue exhausted without reaching the end. Answer <b>-1</b>."), 10);
      return steps;
    },
  };
})();
