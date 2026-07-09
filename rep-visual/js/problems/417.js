/* 417. Pacific Atlantic Water Flow — DFS desde los bordes hacia adentro. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion pacificAtlantic(alturas):",                     "function pacificAtlantic(heights):"],
    ["pacInit",   "  ninguna celda alcanza todavía el Pacífico",           "  no cell reaches the Pacific yet"],
    ["atlInit",   "  ninguna celda alcanza todavía el Atlántico",          "  no cell reaches the Atlantic yet"],
    ["bordeP",    "  para cada celda del borde de arriba o del izquierdo:", "  for each cell on the top or left border:"],
    ["subeP",     "    dfs(pacifico, celda)",                              "    dfs(pacific, cell)"],
    ["bordeA",    "  para cada celda del borde de abajo o del derecho:",   "  for each cell on the bottom or right border:"],
    ["subeA",     "    dfs(atlantico, celda)",                             "    dfs(atlantic, cell)"],
    ["resp",      "  resp pasa a ser las celdas que alcanzan el Pacífico y también el Atlántico",
                  "  ans becomes the cells that reach the Pacific and also the Atlantic"],
    ["retorna",   "  retornar resp",                                       "  return ans"],
    ["",          "",                                                      ""],
    ["dfsFn",     "funcion dfs(alcanza, r, c):",                           "function dfs(reaches, r, c):"],
    ["marca",     "  marcar (r, c) como alcanzada por ese océano",         "  mark (r, c) as reached by that ocean"],
    ["porVecina", "  para cada vecina de (r, c):",                         "  for each neighbor of (r, c):"],
    ["subeAgua",  "    si la vecina no está marcada y su altura es igual o mayor:",
                  "    if the neighbor is not marked and its height is equal or greater:"],
    ["baja",      "      dfs(alcanza, vecina)",                            "      dfs(reaches, neighbor)"],
  ]);
  const A = C.L;

  P["417"] = {
    num: 417, slug: "pacific-atlantic", title: "Pacific Atlantic Water Flow",
    difficulty: "M", block: "grafos", tags: ["DFS", "grid", "dos pasadas"],
    summary: L(
      "El agua fluye a celdas de altura igual o menor. Buscamos celdas desde donde el agua llega a AMBOS océanos. Truco: DFS al revés, desde cada océano hacia arriba.",
      "Water flows to cells of equal or lower height. We want cells from which water reaches BOTH oceans. Trick: reverse DFS, from each ocean uphill."),
    legend: [
      { cls: "water", label: L("no alcanza", "does not reach") },
      { cls: "visited", label: L("alcanza el océano", "reaches the ocean") },
      { cls: "current", label: L("celda actual", "current cell") },
      { cls: "path", label: L("llega a ambos", "reaches both") },
    ],
    code: C,
    cases: [
      { name: L("Ejemplo 5×5", "Example 5×5"), input: [
        [1,2,2,3,5],
        [3,2,3,4,4],
        [2,4,5,3,1],
        [6,7,1,4,5],
        [5,1,1,2,4]] },
      { name: L("Pequeño 3×3", "Small 3×3"), input: [
        [3,3,3],
        [3,1,3],
        [3,3,3]] },
    ],

    // Modo interactivo: esculpe la isla y mira desde qué celdas el agua alcanza
    // los dos océanos. La celda no es binaria: guarda una altura de 1 a 9, y
    // `cycle` sube un escalón (tras el 9 vuelve al 1).
    editor: {
      rows: 5, cols: 5,
      // Se arranca con las alturas del ejemplo clásico: da algo interesante que
      // modificar, en vez de una meseta plana donde todo alcanza ambos océanos.
      initial() {
        return [
          [1,2,2,3,5],
          [3,2,3,4,4],
          [2,4,5,3,1],
          [6,7,1,4,5],
          [5,1,1,2,4],
        ];
      },
      cycle(v) { return v >= 9 ? 1 : v + 1; },
      cellView(v) { return { v: String(v), cls: "water" }; },
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para subir su altura (del 1 al 9, luego vuelve al 1). El Pacífico está arriba y a la izquierda; el Atlántico, abajo y a la derecha. Luego pulsa Ejecutar.",
        en: "Tap a cell to raise its height (1 to 9, then back to 1). The Pacific is up and left; the Atlantic is down and right. Then press Run.",
      },
    },

    build(input) {
      const h = input, m = h.length, n = h[0].length;
      const pac = h.map((r) => r.map(() => false));
      const atl = h.map((r) => r.map(() => false));
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      const steps = [];
      let cur = null, phase = "pac";

      const gridSpec = (reach, active, label, both) => ({
        label, coords: false,
        cells: h.map((row, r) => row.map((v, c) => {
          let cls;
          if (both && pac[r][c] && atl[r][c]) cls = "path";
          else if (active && cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (reach[r][c]) cls = "visited";
          else cls = "water";
          return { v: String(v), cls };
        })),
      });
      const snap = (note, line, both) => {
        steps.push({ line, note,
          grids: [ gridSpec(pac, phase === "pac", L("Pacífico ↖", "Pacific ↖"), both),
                   gridSpec(atl, phase === "atl", L("Atlántico ↘", "Atlantic ↘"), both) ] });
      };

      function dfs(reach, r, c) {
        reach[r][c] = true;
        cur = [r, c];
        snap(L(`(${r},${c}) alcanza el ${phase === "pac" ? "Pacífico" : "Atlántico"}. Subimos a vecinas más altas o iguales.`,
               `(${r},${c}) reaches the ${phase === "pac" ? "Pacific" : "Atlantic"}. We climb to higher-or-equal neighbors.`),
             [A.marca, A.porVecina]);
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
          if (reach[nr][nc] || h[nr][nc] < h[r][c]) continue;
          dfs(reach, nr, nc);
        }
      }

      phase = "pac";
      snap(L("Pasada 1: agua del Pacífico entra por el borde superior e izquierdo.",
             "Pass 1: Pacific water enters through the top and left borders."), [A.bordeP, A.subeP]);
      for (let i = 0; i < m; i++) if (!pac[i][0]) dfs(pac, i, 0);
      for (let j = 0; j < n; j++) if (!pac[0][j]) dfs(pac, 0, j);

      phase = "atl";
      cur = null;
      snap(L("Pasada 2: agua del Atlántico entra por el borde inferior y derecho.",
             "Pass 2: Atlantic water enters through the bottom and right borders."), [A.bordeA, A.subeA]);
      for (let i = 0; i < m; i++) if (!atl[i][n-1]) dfs(atl, i, n - 1);
      for (let j = 0; j < n; j++) if (!atl[m-1][j]) dfs(atl, m - 1, j);

      cur = null;
      const resp = [];
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
          if (pac[r][c] && atl[r][c]) resp.push(`(${r},${c})`);
      snap(L(`Celdas que llegan a ambos océanos (resaltadas): ${resp.length}. ` + resp.join(" "),
             `Cells reaching both oceans (highlighted): ${resp.length}. ` + resp.join(" ")),
           [A.resp, A.retorna], true);
      return steps;
    },
  };
})();
