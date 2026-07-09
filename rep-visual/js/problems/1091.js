/* 1091. Shortest Path in Binary Matrix — BFS 8-direccional de esquina a esquina. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion shortestPath(grid):",                          "function shortestPath(grid):"],
    ["bloqueada", "  si la esquina inicial o la final están bloqueadas:", "  if the start or the end corner is blocked:"],
    ["sinCamino", "    retornar -1",                                      "    return -1"],
    ["cola0",     "  cola empieza con (0, 0) dentro",                                    "  queue starts with (0, 0) inside"],
    ["dist0",     "  dist[0][0] empieza en 1",                                     "  dist[0][0] starts at 1"],
    ["mientras",  "  mientras la cola no esté vacía:",                    "  while the queue is not empty:"],
    ["saca",      "    sacar la primera de la cola y llamarla (r, c)",             "    take the first one out of the queue and call it (r, c)"],
    ["esFinal",   "    si (r, c) es la esquina final:",                   "    if (r, c) is the final corner:"],
    ["retDist",   "      retornar dist[r][c]",                            "      return dist[r][c]"],
    ["porVecina", "    para cada una de las 8 vecinas de (r, c):",        "    for each of the 8 neighbors of (r, c):"],
    ["libre",     "      si la vecina está libre y no ha sido visitada:", "      if the neighbor is clear and unvisited:"],
    ["marcaDist", "        dist[vecina] pasa a ser dist[r][c] + 1",                "        dist[neighbor] becomes dist[r][c] + 1"],
    ["mete",      "        meter vecina en la cola",                      "        put the neighbor into the queue"],
    ["retMenos1", "  retornar -1   // se acabó la cola sin llegar al final",
                  "  return -1     // the queue ran out before reaching the end"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("Camino 4 (3×3)", "Path 4 (3×3)"), input: [[0,0,0],[1,1,0],[1,1,0]] },
      // El grid [[0,1],[1,0]] se llamaba "Bloqueado" pero da 2: en 8 direcciones
      // la diagonal (0,0)→(1,1) es legal. Este sí agota la cola sin llegar.
      { name: L("Sin camino (-1)", "No path (-1)"), input: [[0,0,1],[1,1,1],[1,1,0]] },
      { name: L("Diagonal 5×5", "Diagonal 5×5"), input: [
        [0,0,0,0,0],
        [1,1,1,1,0],
        [0,0,0,1,0],
        [0,1,0,0,0],
        [0,1,1,1,0]] },
    ],

    // Modo interactivo: el usuario dibuja los muros y ejecuta este mismo BFS.
    // Los métodos usan `this`, así que hay que llamarlos sobre el objeto.
    editor: {
      rows: 5,
      cols: 5,
      initial() {
        return Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
      },
      // Inicio (0,0) y meta (rows-1, cols-1) son fijos: el toque no los cambia.
      cycle(v, r, c) {
        if (r === 0 && c === 0) return v;
        if (r === this.rows - 1 && c === this.cols - 1) return v;
        return v === 0 ? 1 : 0;
      },
      // El muro gana sobre inicio/meta, pero `cycle` nunca los amuralla.
      cellView(v, r, c) {
        if (v === 1) return { v: "", cls: "wall" };
        if (r === 0 && c === 0) return { v: "A", cls: "current" };
        if (r === this.rows - 1 && c === this.cols - 1) return { v: "B", cls: "target" };
        return { v: "", cls: "water" };
      },
      // build(input) de 1091 recibe la cuadrícula directamente.
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para poner o quitar un muro. Inicio (A) y meta (B) son fijos. Luego pulsa Ejecutar.",
        en: "Tap a cell to add or remove a wall. Start (A) and goal (B) are fixed. Then press Run.",
      },
    },

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
               "The start or the end is blocked: no path. Answer <b>-1</b>."), [A.bloqueada, A.sinCamino]);
        return steps;
      }
      q.push([0, 0]); dist[0][0] = 1;
      snap(L("Arrancamos en (0,0) con distancia 1.", "Start at (0,0) with distance 1."), [A.cola0, A.dist0]);

      while (q.length) {
        const [r, c] = q.shift();
        cur = [r, c];
        if (r === n - 1 && c === n - 1) {
          snap(L(`Llegamos al destino con distancia <b>${dist[r][c]}</b>. Camino más corto.`,
                 `Reached the goal with distance <b>${dist[r][c]}</b>. Shortest path.`), [A.esFinal, A.retDist]);
          return steps;
        }
        snap(L(`Expandimos (${r},${c}), dist ${dist[r][c]}. Miramos sus 8 vecinas.`,
               `Expand (${r},${c}), dist ${dist[r][c]}. Look at its 8 neighbors.`), [A.saca, A.porVecina]);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
          if (input[nr][nc] === 1 || dist[nr][nc] > 0) continue;
          dist[nr][nc] = dist[r][c] + 1;
          q.push([nr, nc]);
          cur = [nr, nc];
          snap(L(`(${nr},${nc}) libre → dist ${dist[nr][nc]}, entra a la cola.`,
                 `(${nr},${nc}) clear → dist ${dist[nr][nc]}, enters the queue.`), [A.libre, A.marcaDist, A.mete]);
        }
      }
      cur = null;
      snap(L("Se agotó la cola sin llegar al final. Respuesta <b>-1</b>.",
             "Queue exhausted without reaching the end. Answer <b>-1</b>."), A.retMenos1);
      return steps;
    },
  };
})();
