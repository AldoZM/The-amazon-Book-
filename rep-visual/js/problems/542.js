/* 542. 01 Matrix — BFS multifuente: distancia de cada celda al 0 más cercano. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion updateMatrix(mat):",                        "function updateMatrix(mat):"],
    ["distInit",  "  dist[celda] empieza en infinito, para toda celda",         "  dist[cell] starts at infinity, for every cell"],
    ["colaInit",  "  cola empieza vacía",                                    "  queue starts empty"],
    ["porCero",   "  para cada celda que vale 0:",                     "  for each cell whose value is 0:"],
    ["esFuente",  "    dist de esa celda empieza en 0",                         "    dist of that cell starts at 0"],
    ["mete",      "    meterla en la cola",                            "    push it into the queue"],
    ["mientras",  "  mientras la cola no está vacía:",                 "  while the queue is not empty:"],
    ["saca",      "    sacar la primera de la cola y llamarla (r, c)",           "    take the first one out of the queue and call it (r, c)"],
    ["porVecina", "    para cada vecina de (r, c):",                   "    for each neighbor of (r, c):"],
    ["mejora",    "      si dist[vecina] > dist[r][c] + 1:",           "      if dist[neighbor] > dist[r][c] + 1:"],
    ["asigna",    "        dist[vecina] pasa a ser dist[r][c] + 1",             "        dist[neighbor] becomes dist[r][c] + 1"],
    ["encola",    "        meter la vecina en la cola",                "        push the neighbor into the queue"],
    ["retorna",   "  retornar dist",                                   "  return dist"],
  ]);
  const A = C.L;

  P["542"] = {
    num: 542, slug: "01-matrix", title: "01 Matrix",
    difficulty: "M", block: "grafos", tags: ["BFS", "grid", "multifuente"],
    summary: L(
      "Para cada celda, la distancia al 0 más cercano. BFS que empieza a la vez desde todos los 0; la onda va asignando distancias crecientes.",
      "For each cell, the distance to the nearest 0. BFS that starts from all zeros at once; the wave assigns increasing distances."),
    legend: [
      { cls: "fresh", label: L("fuente (0)", "source (0)") },
      { cls: "water", label: L("sin calcular (∞)", "unassigned (∞)") },
      { cls: "visited", label: L("distancia asignada", "distance assigned") },
      { cls: "current", label: L("celda actual", "current cell") },
    ],
    code: C,
    cases: [
      { name: L("Ejemplo clásico", "Classic example"), input: [[0,0,0],[0,1,0],[1,1,1]] },
      { name: L("Un solo cero", "A single zero"), input: [[1,1,1],[1,0,1],[1,1,1]] },
    ],

    // Modo interactivo: coloca las fuentes (0) y mira cómo se propagan las
    // distancias. Sin ninguna fuente, todas las distancias quedan en infinito:
    // es un resultado correcto, y didáctico.
    editor: {
      rows: 5, cols: 5,
      initial() {
        const g = Array.from({ length: this.rows }, () => new Array(this.cols).fill(1));
        g[2][2] = 0;   // una fuente al centro para arrancar con algo que ver
        return g;
      },
      cycle(v) { return v === 0 ? 1 : 0; },
      cellView(v) {
        // Mismas clases que usa build(): fuente en verde, resto sin calcular.
        return v === 0 ? { v: "0", cls: "fresh" } : { v: "1", cls: "water" };
      },
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para alternar entre fuente (0) y celda por calcular (1). Luego pulsa Ejecutar.",
        en: "Tap a cell to switch between source (0) and cell to compute (1). Then press Run.",
      },
    },

    build(input) {
      const m = input.length, n = input[0].length;
      const INF = Infinity;
      const dist = input.map((r) => r.map((v) => (v === 0 ? 0 : INF)));
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      const steps = [];
      const q = [];
      let cur = null;

      const snap = (note, line) => {
        const cells = dist.map((row, r) => row.map((v, c) => {
          let cls;
          if (cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (v === 0) cls = "fresh";
          else if (v === INF) cls = "water";
          else cls = "visited";
          return { v: v === INF ? "∞" : String(v), cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: "dist", coords: true },
          queue: { label: L("Cola BFS", "BFS queue"), arrows: true, items: q.map((p) => p[0] + "," + p[1]) } });
      };

      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
          if (input[r][c] === 0) q.push([r, c]);
      snap(L(`Todos los 0 son fuentes (dist 0) y entran a la cola: ${q.length}.`,
             `All zeros are sources (dist 0) and enter the queue: ${q.length}.`),
           [A.porCero, A.esFuente, A.mete]);

      while (q.length) {
        const [r, c] = q.shift();
        cur = [r, c];
        snap(L(`Sacamos (${r},${c}) con dist ${dist[r][c]}. Revisamos vecinas.`,
               `Pop (${r},${c}) with dist ${dist[r][c]}. Check its neighbors.`), A.saca);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
          if (dist[nr][nc] > dist[r][c] + 1) {
            dist[nr][nc] = dist[r][c] + 1;
            q.push([nr, nc]);
            cur = [nr, nc];
            snap(L(`(${nr},${nc}) recibe dist ${dist[nr][nc]} y entra a la cola.`,
                   `(${nr},${nc}) gets dist ${dist[nr][nc]} and enters the queue.`),
                 [A.mejora, A.asigna, A.encola]);
          }
        }
      }
      cur = null;
      snap(L("Cola vacía: toda celda tiene su distancia mínima. Listo.",
             "Queue empty: every cell has its minimum distance. Done."), A.retorna);
      return steps;
    },
  };
})();
