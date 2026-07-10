/* 261. Graph Valid Tree — Union-Find: sin ciclo y conexo con n-1 aristas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion validTree(n, edges):",                        "function validTree(n, edges):"],
    ["cuenta",    "  si el número de aristas no es n - 1:",              "  if the number of edges is not n - 1:"],
    ["noArbol",   "    retornar falso",                                  "    return false"],
    ["padres",    "  padre[i] pasa a ser i, para todo i  // cada nodo empieza solo, siendo su propia raíz",
                  "  parent[i] becomes i, for every i  // each node starts alone, being its own root"],
    ["porArista", "  para cada arista (a, b):",                          "  for each edge (a, b):"],
    ["raizA",     "    ra pasa a ser find(a)",                                    "    ra becomes find(a)"],
    ["raizB",     "    rb pasa a ser find(b)",                                    "    rb becomes find(b)"],
    ["mismaRaiz", "    si ra es rb:                // a y b ya estaban conectados: hay un ciclo",
                  "    if ra is rb:                // a and b were already connected: there is a cycle"],
    ["ciclo",     "      retornar falso",                                "      return false"],
    ["une",       "    padre[ra] pasa a ser rb     // union: colgamos un grupo del otro",
                  "    parent[ra] becomes rb       // union: hang one group under the other"],
    ["esArbol",   "  retornar verdadero            // n - 1 aristas y sin ciclos: es conexo",
                  "  return true                   // n - 1 edges and no cycles: it is connected"],
    ["",          "",                                                    ""],
    ["findFn",    "funcion find(x):                // la raíz del grupo de x",
                  "function find(x):               // the root of x's group"],
    ["subiendo",  "  mientras padre[x] no es x:",                        "  while parent[x] is not x:"],
    ["sube",      "    x pasa a ser padre[x]",                                    "    x becomes parent[x]"],
    ["raiz",      "  retornar x",                                        "  return x"],
  ]);
  const A = C.L;

  P["261"] = {
    num: 261, slug: "graph-valid-tree", title: "Graph Valid Tree",
    difficulty: "M", block: "grafos", tags: ["union-find", "ciclo"],
    summary: L(
      "Un grafo es árbol si es conexo y sin ciclos. Truco: debe tener exactamente n-1 aristas, y al unir con Union-Find nunca deben coincidir dos raíces (eso sería un ciclo).",
      "A graph is a tree if it's connected and acyclic. Trick: it must have exactly n-1 edges, and when merging with Union-Find two roots must never coincide (that would be a cycle)."),
    legend: [
      { cls: "current", label: L("arista actual", "current edge") },
      { cls: "done", label: L("unido", "merged") },
    ],
    code: C,
    cases: [
      { name: L("Árbol válido (n=5)", "Valid tree (n=5)"), input: { n: 5, edges: [[0,1],[0,2],[0,3],[1,4]] } },
      { name: L("Con ciclo (falso)", "With cycle (false)"), input: { n: 5, edges: [[0,1],[1,2],[2,3],[1,3],[1,4]] } },
      { name: L("Desconectado (falso)", "Disconnected (false)"), input: { n: 4, edges: [[0,1],[2,3]] } },
    ],

    editor: VIS.graphEditor({
      id: 261,
      maxNodos: 15,
      directed: false,
      defaultInput: "[[0,1],[0,2],[0,3],[1,4]]",
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
      let hotEdge = -1;

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Grafo", "Graph"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges: edges.map(([a, b], k) => ({ from: a, to: b, cls: k === hotEdge ? "hot" : (k < hotEdge ? "done" : "") })) },
        list: { label: L("padre[]", "parent[]"), items: padre.map((v, i) => i + "→" + v) },
        vars: [{ k: L("aristas", "edges"), v: edges.length }, { k: "n-1", v: n - 1 }] });

      if (edges.length !== n - 1) {
        snap(L(`Tiene ${edges.length} aristas pero un árbol de ${n} nodos necesita ${n - 1}. Respuesta <b>falso</b>.`,
               `It has ${edges.length} edges but a tree of ${n} nodes needs ${n - 1}. Answer <b>false</b>.`), [A.cuenta, A.noArbol]);
        return steps;
      }
      snap(L(`${edges.length} aristas = n-1. Vamos uniendo y vigilando ciclos.`,
             `${edges.length} edges = n-1. We merge while watching for cycles.`), [A.cuenta, A.padres]);

      for (let k = 0; k < edges.length; k++) {
        const [a, b] = edges[k];
        hotEdge = k;
        const ra = find(a), rb = find(b);
        state[a] = "current"; state[b] = "current";
        if (ra === rb) {
          snap(L(`Arista (${a},${b}): ya conectados (raíz ${ra}) → ciclo. Respuesta <b>falso</b>.`,
                 `Edge (${a},${b}): already connected (root ${ra}) → cycle. Answer <b>false</b>.`), [A.mismaRaiz, A.ciclo]);
          return steps;
        }
        padre[ra] = rb;
        snap(L(`Arista (${a},${b}): unimos ${ra} bajo ${rb}.`,
               `Edge (${a},${b}): merge ${ra} under ${rb}.`), [A.raizA, A.raizB, A.une]);
        state[a] = "done"; state[b] = "done";
      }
      hotEdge = edges.length;
      snap(L("Sin ciclos y con n-1 aristas → conexo. Es un árbol válido: <b>verdadero</b>.",
             "No cycles and n-1 edges → connected. It's a valid tree: <b>true</b>."), A.esArbol);
      return steps;
    },
  };
})();
