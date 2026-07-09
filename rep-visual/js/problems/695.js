/* 695. Max Area of Island — DFS que mide el área de cada isla. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",          "funcion maxAreaOfIsland(grid):",                "function maxAreaOfIsland(grid):"],
    ["mejor0",      "  mejor empieza en 0",                                   "  best starts at 0"],
    ["recorre",     "  para cada celda (r, c) de grid:",             "  for each cell (r, c) in grid:"],
    ["esTierra",    "    si grid[r][c] es tierra:",                  "    if grid[r][c] is land:"],
    ["actualiza",   "      mejor pasa a ser la mayor de mejor y area(r, c)",  "      best becomes the larger of best and area(r, c)"],
    ["retorna",     "  retornar mejor",                              "  return best"],
    ["",            "",                                              ""],
    ["areaFn",      "funcion area(r, c):",                           "function area(r, c):"],
    ["fuera",       "  si (r, c) cae fuera de la cuadrícula:",       "  if (r, c) falls outside the grid:"],
    ["fueraCero",   "    retornar 0",                                "    return 0"],
    ["noTierra",    "  si grid[r][c] no es tierra:",                 "  if grid[r][c] is not land:"],
    ["noTierraCero", "    retornar 0",                               "    return 0"],
    ["marcar",      "  marcar grid[r][c] como visitada",             "  mark grid[r][c] as visited"],
    ["sumaVecinas", "  retornar 1 + la suma de las áreas de las 4 vecinas",
                    "  return 1 + the sum of the areas of the 4 neighbors"],
  ]);
  const A = C.L;

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
    code: C,
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

    // Modo interactivo: dibuja islas y mide la más grande.
    editor: {
      rows: 5, cols: 5,
      initial() {
        return Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
      },
      cycle(v) { return v === 0 ? 1 : 0; },
      cellView(v) {
        return v === 1 ? { v: "1", cls: "land" } : { v: "0", cls: "water" };
      },
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para alternar entre tierra (1) y agua (0). Luego pulsa Ejecutar.",
        en: "Tap a cell to switch between land (1) and water (0). Then press Run.",
      },
    },

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
             "We look for unvisited land; for each island we'll measure its area."), [A.fn, A.recorre]);

      function area(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] === 0) return 0;
        grid[r][c] = 0;
        sunk.add(r + "," + c);
        areaActual++;
        cur = [r, c];
        snap(L(`Sumamos (${r},${c}) a la isla. Área acumulada: ${areaActual}.`,
               `Add (${r},${c}) to the island. Running area: ${areaActual}.`),
             [A.marcar, A.sumaVecinas]);
        return 1 + area(r - 1, c) + area(r + 1, c) + area(r, c - 1) + area(r, c + 1);
      }

      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
          if (grid[r][c] === 1) {
            areaActual = 0;
            cur = [r, c];
            snap(L(`Tierra nueva en (${r},${c}). Medimos su área con DFS.`,
                   `New land at (${r},${c}). We measure its area with DFS.`), [A.esTierra, A.actualiza]);
            const a = area(r, c);
            mejor = Math.max(mejor, a);
            cur = null;
            snap(L(`Isla completa: área ${a}. Mejor hasta ahora: <b>${mejor}</b>.`,
                   `Island complete: area ${a}. Best so far: <b>${mejor}</b>.`), A.actualiza);
          }

      snap(L(`Recorrido terminado. Área máxima: <b>${mejor}</b>.`,
             `Scan complete. Max area: <b>${mejor}</b>.`), A.retorna);
      return steps;
    },
  };
})();
