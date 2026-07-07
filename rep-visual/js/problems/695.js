/* 695. Max Area of Island — DFS que mide el área de cada isla. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["695"] = {
    num: 695, slug: "max-area-of-island", title: "Max Area of Island",
    difficulty: "M", block: "grafos", tags: ["DFS", "grid", "área"],
    summary: L(
      "Igual que contar islas, pero en vez de contarlas medimos el tamaño (número de celdas) de cada una y nos quedamos con la mayor.",
      "Like counting islands, but instead of counting we measure each one's size (number of cells) and keep the largest."),
    legend: [
      { cls: "land", label: L("tierra sin visitar (1)", "unvisited land (1)") },
      { cls: "water", label: L("agua (0)", "water (0)") },
      { cls: "current", label: L("celda actual", "current cell") },
      { cls: "visited", label: L("contada", "counted") },
    ],
    code: {
      es: [
        "funcion maxArea(grid):",
        "  mejor ← 0",
        "  para cada celda (r,c):",
        "    si grid[r][c] == 1:",
        "      mejor ← máx(mejor, area(r,c))",
        "  retornar mejor",
        "",
        "funcion area(r,c):",
        "  si fuera de límites o grid[r][c]==0: retornar 0",
        "  grid[r][c] ← 0            // marcar visitada",
        "  return 1 + area(r-1,c)+area(r+1,c)",
        "           + area(r,c-1)+area(r,c+1)",
      ],
      en: [
        "function maxArea(grid):",
        "  best ← 0",
        "  for each cell (r,c):",
        "    if grid[r][c] == 1:",
        "      best ← max(best, area(r,c))",
        "  return best",
        "",
        "function area(r,c):",
        "  if out of bounds or grid[r][c]==0: return 0",
        "  grid[r][c] ← 0            // mark visited",
        "  return 1 + area(r-1,c)+area(r+1,c)",
        "           + area(r,c-1)+area(r,c+1)",
      ],
    },
    cases: [
      { name: L("Área máxima 5", "Max area 5"), input: [
        [0,0,1,0,0],
        [0,1,1,1,0],
        [0,0,1,0,0],
        [1,1,0,0,1]] },
      { name: L("Dos islas 4 y 1", "Two islands 4 and 1"), input: [
        [1,1,0,0],
        [1,1,0,1],
        [0,0,0,0]] },
    ],

    build(input) {
      const grid = input.map((r) => r.slice());
      const m = grid.length, n = grid[0].length;
      const steps = [];
      const sunk = new Set();
      let mejor = 0, areaActual = 0, cur = null;

      const snap = (note, line) => {
        const cells = grid.map((row, r) => row.map((v, c) => {
          let cls;
          if (cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (v === 0 && sunk.has(r + "," + c)) cls = "visited";
          else if (v === 1) cls = "land";
          else cls = "water";
          return { v: String(v), cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: "grid", coords: true },
          vars: [{ k: L("mejor", "best"), v: mejor, cls: "result" }, { k: L("área actual", "current area"), v: areaActual }] });
      };

      snap(L("Buscamos tierra sin visitar; por cada isla mediremos su área.",
             "We look for unvisited land; for each island we'll measure its area."), [0, 2]);

      function area(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 0) return 0;
        grid[r][c] = 0;
        sunk.add(r + "," + c);
        areaActual++;
        cur = [r, c];
        snap(L(`Sumamos (${r},${c}) a la isla. Área acumulada: ${areaActual}.`,
               `Add (${r},${c}) to the island. Running area: ${areaActual}.`), 9);
        return 1 + area(r - 1, c) + area(r + 1, c) + area(r, c - 1) + area(r, c + 1);
      }

      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
          if (grid[r][c] === 1) {
            areaActual = 0;
            cur = [r, c];
            snap(L(`Tierra nueva en (${r},${c}). Medimos su área con DFS.`,
                   `New land at (${r},${c}). We measure its area with DFS.`), [3, 4]);
            const a = area(r, c);
            mejor = Math.max(mejor, a);
            cur = null;
            snap(L(`Isla completa: área ${a}. Mejor hasta ahora: <b>${mejor}</b>.`,
                   `Island complete: area ${a}. Best so far: <b>${mejor}</b>.`), 4);
          }

      snap(L(`Recorrido terminado. Área máxima: <b>${mejor}</b>.`,
             `Scan complete. Max area: <b>${mejor}</b>.`), 5);
      return steps;
    },
  };
})();
