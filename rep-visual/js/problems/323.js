/* 323. Number of Connected Components — Union-Find. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",         "funcion countComponents(n, aristas):",          "function countComponents(n, edges):"],
    ["padreInit",  "  padre[i] pasa a ser i, para todo nodo i  // cada nodo es su propia raíz",
                   "  parent[i] becomes i, for every node i  // each node is its own root"],
    ["compInit",   "  componentes empieza en n",                             "  components starts at n"],
    ["porArista",  "  para cada arista (a, b):",                    "  for each edge (a, b):"],
    ["raizA",      "    ra pasa a ser find(a)",                              "    ra becomes find(a)"],
    ["raizB",      "    rb pasa a ser find(b)",                              "    rb becomes find(b)"],
    ["distintas",  "    si ra no es rb:",                           "    if ra is not rb:"],
    ["unir",       "      padre[ra] pasa a ser rb        // unir los dos grupos",
                   "      parent[ra] becomes rb          // merge the two groups"],
    ["restar",     "      restar 1 a componentes",           "      subtract 1 from components"],
    ["retorna",    "  retornar componentes",                        "  return components"],
    ["",           "",                                              ""],
    ["findFn",     "funcion find(x):",                              "function find(x):"],
    ["mientras",   "  mientras padre[x] no es x:",                  "  while parent[x] is not x:"],
    ["sube",       "    x pasa a ser padre[x]",                              "    x becomes parent[x]"],
    ["devuelve",   "  retornar x",                                  "  return x"],
  ]);
  const A = C.L;

  P["323"] = {
    num: 323, slug: "connected-components", title: "Connected Components in an Undirected Graph",
    difficulty: "M", block: "grafos", tags: ["union-find"],
    summary: L(
      "Contamos grupos conectados con Union-Find: cada arista une dos conjuntos; cuando de verdad se unen (raíces distintas), hay un componente menos.",
      "We count connected groups with Union-Find: each edge merges two sets; when they truly merge (different roots), there's one component fewer."),
    legend: [
      { cls: "current", label: L("arista actual", "current edge") },
      { cls: "done", label: L("ya unido", "already merged") },
    ],
    code: C,
    cases: [
      { name: L("2 componentes", "2 components"), input: { n: 5, edges: [[0,1],[1,2],[3,4]] } },
      { name: L("Con ciclo", "With cycle"), input: { n: 5, edges: [[0,1],[1,2],[2,0],[3,4]] } },
      { name: L("Sin aristas", "No edges"), input: { n: 3, edges: [] } },
    ],

    editor: VIS.graphEditor({
      id: 323,
      maxNodos: 15,
      directed: false,
      defaultInput: "[[0,1],[1,2],[3,4]]",
      parser: VIS.parse.edgeList,
      hint: L("Ej: [[0,1]] (arista 0-1)", "Ex: [[0,1]] (edge 0-1)")
    }),

    build(input) {
      const n = input.n, edges = input.edges;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const padre = Array.from({ length: n }, (_, i) => i);
      const find = (x) => { while (padre[x] !== x) x = padre[x]; return x; };
      const steps = [];
      const state = new Array(n).fill("base");
      let comp = n, hotEdge = -1;

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Grafo", "Graph"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges: edges.map(([a, b], k) => ({ from: a, to: b, cls: k === hotEdge ? "hot" : (k < hotEdge ? "done" : "") })) },
        list: { label: L("padre[]", "parent[]"), items: padre.map((v, i) => i + "→" + v) },
        vars: [{ k: L("componentes", "components"), v: comp, cls: "result" }] });

      snap(L("Cada nodo empieza como su propio grupo.", "Each node starts as its own group."),
           [A.padreInit, A.compInit]);
      edges.forEach(([a, b], k) => {
        hotEdge = k;
        const ra = find(a), rb = find(b);
        state[a] = "current"; state[b] = "current";
        if (ra !== rb) {
          padre[ra] = rb; comp--;
          snap(L(`Arista (${a},${b}): raíces ${ra}≠${rb}, unimos. Componentes = ${comp}.`,
                 `Edge (${a},${b}): roots ${ra}≠${rb}, merge. Components = ${comp}.`), [A.unir, A.restar]);
        } else {
          snap(L(`Arista (${a},${b}): ya estaban en el mismo grupo (raíz ${ra}). No baja el conteo.`,
                 `Edge (${a},${b}): already in the same group (root ${ra}). Count stays.`), A.distintas);
        }
        state[a] = "done"; state[b] = "done";
      });
      hotEdge = edges.length;
      snap(L(`Componentes conexos: <b>${comp}</b>.`, `Connected components: <b>${comp}</b>.`), A.retorna);
      return steps;
    },
  };
})();
