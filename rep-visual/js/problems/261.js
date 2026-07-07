/* 261. Graph Valid Tree — Union-Find: sin ciclo y conexo con n-1 aristas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion validTree(n, edges):",
        "  si #aristas != n-1: retornar falso",
        "  padre[i] ← i",
        "  para cada arista (a,b):",
        "    ra ← find(a); rb ← find(b)",
        "    si ra == rb: retornar falso   // ciclo",
        "    padre[ra] ← rb                 // unir",
        "  retornar verdadero   // conexo y sin ciclos",
      ],
      en: [
        "function validTree(n, edges):",
        "  if #edges != n-1: return false",
        "  parent[i] ← i",
        "  for each edge (a,b):",
        "    ra ← find(a); rb ← find(b)",
        "    if ra == rb: return false   // cycle",
        "    parent[ra] ← rb             // union",
        "  return true   // connected and acyclic",
      ],
    },
    cases: [
      { name: L("Árbol válido", "Valid tree"), input: { n: 5, edges: [[0,1],[0,2],[0,3],[1,4]] } },
      { name: L("Con ciclo", "With cycle"), input: { n: 4, edges: [[0,1],[1,2],[2,0],[2,3]] } },
      { name: L("Desconectado", "Disconnected"), input: { n: 4, edges: [[0,1],[2,3]] } },
    ],

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
               `It has ${edges.length} edges but a tree of ${n} nodes needs ${n - 1}. Answer <b>false</b>.`), 1);
        return steps;
      }
      snap(L(`${edges.length} aristas = n-1. Vamos uniendo y vigilando ciclos.`,
             `${edges.length} edges = n-1. We merge while watching for cycles.`), [1, 2]);

      for (let k = 0; k < edges.length; k++) {
        const [a, b] = edges[k];
        hotEdge = k;
        const ra = find(a), rb = find(b);
        state[a] = "current"; state[b] = "current";
        if (ra === rb) {
          snap(L(`Arista (${a},${b}): ya conectados (raíz ${ra}) → ciclo. Respuesta <b>falso</b>.`,
                 `Edge (${a},${b}): already connected (root ${ra}) → cycle. Answer <b>false</b>.`), 5);
          return steps;
        }
        padre[ra] = rb;
        snap(L(`Arista (${a},${b}): unimos ${ra} bajo ${rb}.`,
               `Edge (${a},${b}): merge ${ra} under ${rb}.`), 6);
        state[a] = "done"; state[b] = "done";
      }
      hotEdge = edges.length;
      snap(L("Sin ciclos y con n-1 aristas → conexo. Es un árbol válido: <b>verdadero</b>.",
             "No cycles and n-1 edges → connected. It's a valid tree: <b>true</b>."), 7);
      return steps;
    },
  };
})();
