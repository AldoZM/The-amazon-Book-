/* 323. Number of Connected Components — Union-Find. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion countComponents(n, edges):",
        "  padre[i] ← i   (cada nodo su propia raíz)",
        "  componentes ← n",
        "  para cada arista (a,b):",
        "    ra ← find(a); rb ← find(b)",
        "    si ra != rb:",
        "      padre[ra] ← rb        // unir",
        "      componentes -= 1",
        "  retornar componentes",
        "",
        "funcion find(x): mientras padre[x]≠x: x←padre[x]; retornar x",
      ],
      en: [
        "function countComponents(n, edges):",
        "  parent[i] ← i   (each node its own root)",
        "  components ← n",
        "  for each edge (a,b):",
        "    ra ← find(a); rb ← find(b)",
        "    if ra != rb:",
        "      parent[ra] ← rb        // union",
        "      components -= 1",
        "  return components",
        "",
        "function find(x): while parent[x]≠x: x←parent[x]; return x",
      ],
    },
    cases: [
      { name: L("2 componentes", "2 components"), input: { n: 5, edges: [[0,1],[1,2],[3,4]] } },
      { name: L("1 componente", "1 component"), input: { n: 4, edges: [[0,1],[1,2],[2,3]] } },
      { name: L("Arista redundante", "Redundant edge"), input: { n: 3, edges: [[0,1],[1,2],[0,2]] } },
    ],

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

      snap(L("Cada nodo empieza como su propio grupo.", "Each node starts as its own group."), [1, 2]);
      edges.forEach(([a, b], k) => {
        hotEdge = k;
        const ra = find(a), rb = find(b);
        state[a] = "current"; state[b] = "current";
        if (ra !== rb) {
          padre[ra] = rb; comp--;
          snap(L(`Arista (${a},${b}): raíces ${ra}≠${rb}, unimos. Componentes = ${comp}.`,
                 `Edge (${a},${b}): roots ${ra}≠${rb}, merge. Components = ${comp}.`), [6, 7]);
        } else {
          snap(L(`Arista (${a},${b}): ya estaban en el mismo grupo (raíz ${ra}). No baja el conteo.`,
                 `Edge (${a},${b}): already in the same group (root ${ra}). Count stays.`), 5);
        }
        state[a] = "done"; state[b] = "done";
      });
      hotEdge = edges.length;
      snap(L(`Componentes conexos: <b>${comp}</b>.`, `Connected components: <b>${comp}</b>.`), 8);
      return steps;
    },
  };
})();
