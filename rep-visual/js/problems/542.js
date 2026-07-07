/* 542. 01 Matrix — BFS multifuente: distancia de cada celda al 0 más cercano. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion updateMatrix(mat):",
        "  dist ← ∞ en todo; cola ← vacía",
        "  para cada celda con mat==0:",
        "    dist ← 0; meter en la cola",
        "  mientras cola no vacía:",
        "    (r,c) ← sacar de la cola",
        "    para cada vecina:",
        "      si dist[vecina] > dist[r][c] + 1:",
        "        dist[vecina] ← dist[r][c] + 1",
        "        meter vecina en la cola",
        "  retornar dist",
      ],
      en: [
        "function updateMatrix(mat):",
        "  dist ← ∞ everywhere; queue ← empty",
        "  for each cell with mat==0:",
        "    dist ← 0; push into queue",
        "  while queue not empty:",
        "    (r,c) ← pop from queue",
        "    for each neighbor:",
        "      if dist[neighbor] > dist[r][c] + 1:",
        "        dist[neighbor] ← dist[r][c] + 1",
        "        push neighbor into queue",
        "  return dist",
      ],
    },
    cases: [
      { name: L("Ejemplo clásico", "Classic example"), input: [[0,0,0],[0,1,0],[1,1,1]] },
      { name: L("Un solo cero", "A single zero"), input: [[1,1,1],[1,0,1],[1,1,1]] },
    ],

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
             `All zeros are sources (dist 0) and enter the queue: ${q.length}.`), [2, 3]);

      while (q.length) {
        const [r, c] = q.shift();
        cur = [r, c];
        snap(L(`Sacamos (${r},${c}) con dist ${dist[r][c]}. Revisamos vecinas.`,
               `Pop (${r},${c}) with dist ${dist[r][c]}. Check its neighbors.`), 5);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
          if (dist[nr][nc] > dist[r][c] + 1) {
            dist[nr][nc] = dist[r][c] + 1;
            q.push([nr, nc]);
            cur = [nr, nc];
            snap(L(`(${nr},${nc}) recibe dist ${dist[nr][nc]} y entra a la cola.`,
                   `(${nr},${nc}) gets dist ${dist[nr][nc]} and enters the queue.`), [7, 8, 9]);
          }
        }
      }
      cur = null;
      snap(L("Cola vacía: toda celda tiene su distancia mínima. Listo.",
             "Queue empty: every cell has its minimum distance. Done."), 10);
      return steps;
    },
  };
})();
