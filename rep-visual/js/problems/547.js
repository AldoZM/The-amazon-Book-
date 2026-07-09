/* 547. Number of Provinces — DFS por componentes conexas (matriz de adyacencia). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",         "funcion findCircleNum(M):",                          "function findCircleNum(M):"],
    ["vistoInit",  "  ninguna ciudad ha sido visitada",                  "  no city has been visited"],
    ["provInit",   "  provincias empieza en 0",                                   "  provinces starts at 0"],
    ["porCiudad",  "  para cada ciudad i:",                              "  for each city i:"],
    ["noVisitada", "    si la ciudad i no ha sido visitada:",            "    if city i has not been visited:"],
    ["suma",       "      sumar 1 a provincias",                  "      add 1 to provinces"],
    ["llamaDfs",   "      dfs(i)                    // marca toda la provincia",
                   "      dfs(i)                    // marks the whole province"],
    ["retorna",    "  retornar provincias",                              "  return provinces"],
    ["",           "",                                                   ""],
    ["dfsFn",      "funcion dfs(i):",                                    "function dfs(i):"],
    ["marca",      "  marcar la ciudad i como visitada",                 "  mark city i as visited"],
    ["porVecina",  "  para cada ciudad j conectada con i:",              "  for each city j connected to i:"],
    ["noVista",    "    si la ciudad j no ha sido visitada:",            "    if city j has not been visited:"],
    ["baja",       "      dfs(j)",                                       "      dfs(j)"],
  ]);
  const A = C.L;

  P["547"] = {
    num: 547, slug: "number-of-provinces", title: "Number of Provinces",
    difficulty: "M", block: "grafos", tags: ["DFS", "componentes"],
    summary: L(
      "Una provincia es un grupo de ciudades conectadas directa o indirectamente. Contamos componentes conexas: por cada ciudad no visitada, +1 provincia y DFS a todo su grupo.",
      "A province is a group of cities connected directly or indirectly. We count connected components: for each unvisited city, +1 province and DFS over its whole group."),
    legend: [
      { cls: "current", label: L("ciudad actual", "current city") },
      { cls: "done", label: L("visitada", "visited") },
    ],
    code: C,
    cases: [
      { name: L("2 provincias", "2 provinces"), input: [[1,1,0],[1,1,0],[0,0,1]] },
      { name: L("3 aisladas", "3 isolated"), input: [[1,0,0],[0,1,0],[0,0,1]] },
      { name: L("Todas conectadas", "All connected"), input: [[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]] },
    ],

    build(input) {
      const M = input, n = M.length;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const steps = [];
      const visto = new Array(n).fill(false);
      const state = new Array(n).fill("base");
      let provincias = 0;
      const edges = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (M[i][j]) edges.push({ from: i, to: j });

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Ciudades", "Cities"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges },
        vars: [{ k: L("provincias", "provinces"), v: provincias, cls: "result" }] });

      snap(L("Recorreremos las ciudades; cada una no visitada abre una provincia nueva.",
             "We scan the cities; each unvisited one opens a new province."), A.porCiudad);
      function dfs(i) {
        visto[i] = true;
        state[i] = "current";
        snap(L(`Visitamos la ciudad ${i} (provincia #${provincias}).`,
               `Visit city ${i} (province #${provincias}).`), A.marca);
        for (let j = 0; j < n; j++) if (M[i][j] === 1 && !visto[j]) dfs(j);
        state[i] = "done";
      }
      for (let i = 0; i < n; i++) {
        if (!visto[i]) {
          provincias++;
          snap(L(`Ciudad ${i} sin visitar → nueva provincia #${provincias}. DFS a su grupo.`,
                 `City ${i} unvisited → new province #${provincias}. DFS over its group.`),
               [A.noVisitada, A.suma, A.llamaDfs]);
          dfs(i);
        }
      }
      snap(L(`Total de provincias: <b>${provincias}</b>.`, `Total provinces: <b>${provincias}</b>.`), A.retorna);
      return steps;
    },
  };
})();
