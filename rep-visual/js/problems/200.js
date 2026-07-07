/* 200. Number of Islands — DFS que "hunde" tierra conectada. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion numIslands(grid):",
        "  si grid está vacía: retornar 0",
        "  islas ← 0",
        "  para cada celda (r, c) de grid:",
        "    si grid[r][c] == '1':      // tierra nueva",
        "      islas ← islas + 1",
        "      hundir(r, c)",
        "  retornar islas",
        "",
        "funcion hundir(r, c):",
        "  si (r,c) fuera de límites: retornar",
        "  si grid[r][c] != '1': retornar   // agua o ya visitada",
        "  grid[r][c] ← '0'                 // hundir esta celda",
        "  hundir(r-1,c); hundir(r+1,c)     // arriba / abajo",
        "  hundir(r,c-1); hundir(r,c+1)     // izq / der",
      ],
      en: [
        "function numIslands(grid):",
        "  if grid is empty: return 0",
        "  islands ← 0",
        "  for each cell (r, c) in grid:",
        "    if grid[r][c] == '1':      // new land",
        "      islands ← islands + 1",
        "      sink(r, c)",
        "  return islands",
        "",
        "function sink(r, c):",
        "  if (r,c) out of bounds: return",
        "  if grid[r][c] != '1': return     // water or visited",
        "  grid[r][c] ← '0'                 // sink this cell",
        "  sink(r-1,c); sink(r+1,c)         // up / down",
        "  sink(r,c-1); sink(r,c+1)         // left / right",
      ],
    },
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
             "We start. We'll scan the grid looking for unvisited land."), [0, 3]);

      function hundir(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n) return;
        if (grid[r][c] !== "1") return;
        grid[r][c] = "0";
        sunk.add(r + "," + c);
        cur = [r, c];
        snap(L(`Hundimos (${r},${c}): tierra → agua para no recontarla. Exploramos sus 4 vecinas.`,
               `Sink (${r},${c}): land → water so we don't recount it. We explore its 4 neighbors.`), 12);
        hundir(r - 1, c); hundir(r + 1, c);
        hundir(r, c - 1); hundir(r, c + 1);
      }

      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          if (grid[r][c] === "1") {
            islas++;
            cur = [r, c];
            snap(L(`(${r},${c}) es tierra nueva → isla #${islas}. Lanzamos DFS para hundir toda su región.`,
                   `(${r},${c}) is new land → island #${islas}. We launch DFS to sink its whole region.`), [4, 5, 6]);
            hundir(r, c);
          }
        }
      }
      cur = null;
      snap(L(`Fin del recorrido. Total de islas: <b>${islas}</b>.`,
             `Scan complete. Total islands: <b>${islas}</b>.`), 7);
      return steps;
    },
  };
})();
