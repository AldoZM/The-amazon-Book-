/* 133. Clone Graph — BFS copiando nodos y reconectando aristas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["133"] = {
    num: 133, slug: "clone-graph", title: "Clone Graph",
    difficulty: "M", block: "grafos", tags: ["BFS", "hash map"],
    summary: L(
      "Copia profunda de un grafo. BFS/DFS recorriendo el original; un mapa original→copia evita duplicar nodos y permite reconectar las aristas del clon.",
      "Deep copy of a graph. BFS/DFS over the original; an original→copy map avoids duplicating nodes and lets us reconnect the clone's edges."),
    legend: [
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("ya clonado", "already cloned") },
    ],
    code: {
      es: [
        "funcion cloneGraph(nodo):",
        "  si nodo es nulo: retornar nulo",
        "  copia[nodo] ← nuevo Nodo(nodo.val)",
        "  cola ← [nodo]",
        "  mientras cola no vacía:",
        "    actual ← sacar de la cola",
        "    para cada vecino de actual:",
        "      si vecino no está en copia:",
        "        copia[vecino] ← nuevo Nodo(vecino.val)",
        "        encolar vecino",
        "      copia[actual].vecinos += copia[vecino]",
        "  retornar copia[inicio]",
      ],
      en: [
        "function cloneGraph(node):",
        "  if node is null: return null",
        "  copy[node] ← new Node(node.val)",
        "  queue ← [node]",
        "  while queue not empty:",
        "    current ← pop from queue",
        "    for each neighbor of current:",
        "      if neighbor not in copy:",
        "        copy[neighbor] ← new Node(neighbor.val)",
        "        enqueue neighbor",
        "      copy[current].neighbors += copy[neighbor]",
        "  return copy[start]",
      ],
    },
    cases: [
      { name: L("4 nodos en ciclo", "4 nodes in a cycle"), input: { n: 4, adj: [[1,3],[0,2],[1,3],[0,2]] } },
      { name: L("Triángulo", "Triangle"), input: { n: 3, adj: [[1,2],[0,2],[0,1]] } },
    ],

    build(input) {
      const n = input.n, adj = input.adj;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const edges = [];
      for (let i = 0; i < n; i++) for (const j of adj[i]) if (i < j) edges.push({ from: i, to: j });
      const steps = [];
      const state = new Array(n).fill("base");
      const copia = new Set();
      const clonAristas = [];

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Grafo original", "Original graph"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges },
        list: { label: L("Nodos clonados", "Cloned nodes"), items: Array.from(copia).sort((a, b) => a - b) },
        vars: [{ k: L("aristas clon", "clone edges"), v: clonAristas.length }] });

      const cola = [0];
      copia.add(0);
      state[0] = "done";
      snap(L("Clonamos el nodo inicial 0 y lo metemos a la cola.",
             "Clone the start node 0 and push it into the queue."), [2, 3]);

      while (cola.length) {
        const actual = cola.shift();
        state[actual] = "current";
        snap(L(`Procesamos ${actual}. Recorremos sus vecinos.`,
               `Process ${actual}. We go through its neighbors.`), [5, 6]);
        for (const vec of adj[actual]) {
          if (!copia.has(vec)) {
            copia.add(vec);
            cola.push(vec);
            snap(L(`Vecino ${vec} nuevo: creamos su clon y lo encolamos.`,
                   `New neighbor ${vec}: create its clone and enqueue it.`), [7, 8, 9]);
          }
          const key = Math.min(actual, vec) + "-" + Math.max(actual, vec);
          if (!clonAristas.includes(key)) clonAristas.push(key);
          snap(L(`Conectamos en el clon: ${actual} — ${vec}.`,
                 `Connect in the clone: ${actual} — ${vec}.`), 10);
        }
        state[actual] = "done";
      }
      snap(L(`Clon completo: ${copia.size} nodos y sus aristas copiadas.`,
             `Clone complete: ${copia.size} nodes and their edges copied.`), 11);
      return steps;
    },
  };
})();
