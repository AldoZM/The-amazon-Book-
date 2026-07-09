/* 200. Number of Islands — DFS que "hunde" tierra conectada. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",       "funcion numIslands(grid):",                  "function numIslands(grid):"],
    ["vacia",    "  si grid está vacía:",                      "  if grid is empty:"],
    ["cero",     "    retornar 0",                             "    return 0"],
    ["islas0",   "  islas empieza en 0",                       "  islands starts at 0"],
    ["recorre",  "  para cada celda (r, c) de grid:",          "  for each cell (r, c) in grid:"],
    ["esTierra", "    si grid[r][c] es tierra:",               "    if grid[r][c] is land:"],
    ["suma",     "      sumar 1 a islas",                      "      add 1 to islands"],
    ["lanza",    "      hundir(r, c)",                         "      sink(r, c)"],
    ["total",    "  retornar islas",                           "  return islands"],
    ["",         "",                                           ""],
    ["hundirFn", "funcion hundir(r, c):",                      "function sink(r, c):"],
    ["fuera",    "  si (r, c) cae fuera de la cuadrícula:",    "  if (r, c) falls outside the grid:"],
    ["fueraRet", "    retornar",                               "    return"],
    ["noTierra", "  si grid[r][c] no es tierra:",              "  if grid[r][c] is not land:"],
    ["noTierraRet", "    retornar",                            "    return"],
    ["marcar",   "  marcar grid[r][c] como agua",              "  mark grid[r][c] as water"],
    ["vecinas",  "  hundir cada vecina: arriba, abajo, izquierda, derecha",
                 "  sink each neighbor: up, down, left, right"],
  ]);
  const A = C.L;

  P["200"] = {
    num: 200, slug: "number-of-islands", title: "Number of Islands",
    difficulty: "M", block: "grafos", tags: ["DFS", "grid", "flood fill"],
    summary: L(
      "Cuenta islas en una cuadrícula de tierra ('1') y agua ('0'). Al hallar tierra nueva, suma una isla y hunde con DFS toda su región conectada.",
      "Count islands in a grid of land ('1') and water ('0'). When you find new land, add an island and sink its whole connected region with DFS."),
    legend: [
      { cls: "land", label: L("tierra sin visitar (1)", "unvisited land (1)") },
      { cls: "water", label: L("agua (0)", "water (0)") },
      { cls: "current", label: L("celda actual", "current cell") },
      { cls: "visited", label: L("tierra hundida", "sunk land") },
    ],
    code: C,
    cases: [
      { name: L("3 islas (5×4)", "3 islands (5×4)"), input: [
        ["1","1","0","0","0"],
        ["1","1","0","0","0"],
        ["0","0","1","0","0"],
        ["0","0","0","1","1"]] },
      { name: L("1 isla en forma de C", "1 C-shaped island"), input: [
        ["1","1","1","1","0"],
        ["1","1","0","1","0"],
        ["1","1","0","0","0"],
        ["0","0","0","0","0"]] },
      { name: L("Todo agua (0 islas)", "All water (0 islands)"), input: [
        ["0","0","0"],
        ["0","0","0"]] },
    ],

    build(input) {
      const grid = input.map((r) => r.slice());
      const m = grid.length, n = grid[0].length;
      const steps = [];
      const sunk = new Set();
      let islas = 0, cur = null;

      const snap = (note, line) => {
        const cells = grid.map((row, r) => row.map((v, c) => {
          let cls;
          if (cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (v === "0" && sunk.has(r + "," + c)) cls = "visited";
          else if (v === "1") cls = "land";
          else cls = "water";
          return { v, cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: "grid", coords: true },
          vars: [{ k: L("islas", "islands"), v: islas }] });
      };

      snap(L("Empezamos. Recorreremos la cuadrícula buscando tierra sin visitar.",
             "We start. We'll scan the grid looking for unvisited land."), [A.fn, A.recorre]);

      function hundir(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n) return;
        if (grid[r][c] !== "1") return;
        grid[r][c] = "0";
        sunk.add(r + "," + c);
        cur = [r, c];
        snap(L(`Hundimos (${r},${c}): tierra → agua para no recontarla. Exploramos sus 4 vecinas.`,
               `Sink (${r},${c}): land → water so we don't recount it. We explore its 4 neighbors.`),
             [A.marcar, A.vecinas]);
        hundir(r - 1, c); hundir(r + 1, c);
        hundir(r, c - 1); hundir(r, c + 1);
      }

      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          if (grid[r][c] === "1") {
            islas++;
            cur = [r, c];
            snap(L(`(${r},${c}) es tierra nueva → isla #${islas}. Lanzamos DFS para hundir toda su región.`,
                   `(${r},${c}) is new land → island #${islas}. We launch DFS to sink its whole region.`),
                 [A.esTierra, A.suma, A.lanza]);
            hundir(r, c);
          }
        }
      }
      cur = null;
      snap(L(`Fin del recorrido. Total de islas: <b>${islas}</b>.`,
             `Scan complete. Total islands: <b>${islas}</b>.`), A.total);
      return steps;
    },
  };
})();
