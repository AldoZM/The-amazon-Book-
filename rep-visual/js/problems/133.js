/* 133. Clone Graph — BFS copiando nodos y reconectando aristas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion cloneGraph(nodo):",                          "function cloneGraph(node):"],
    ["esNulo",    "  si nodo es nulo:",                                 "  if node is null:"],
    ["retNulo",   "    retornar nulo",                                  "    return null"],
    ["copiaIni",  "  copia[nodo] pasa a ser un nodo nuevo con el mismo valor",   "  copy[node] becomes a new node with the same value"],
    ["cola0",     "  cola empieza con el nodo inicial dentro",                           "  queue starts with the starting node inside"],
    ["mientras",  "  mientras la cola no esté vacía:",                  "  while the queue is not empty:"],
    ["saca",      "    sacar el primero de la cola y llamarlo actual",           "    take the first one out of the queue and call it current"],
    ["porVecino", "    para cada vecino de actual:",                    "    for each neighbor of current:"],
    ["esNuevo",   "      si vecino todavía no tiene copia:",            "      if neighbor does not have a copy yet:"],
    ["creaCopia", "        copia[vecino] pasa a ser un nodo nuevo con el mismo valor",
                  "        copy[neighbor] becomes a new node with the same value"],
    ["encola",    "        meter vecino en la cola",                    "        put neighbor into the queue"],
    ["conecta",   "      conectar copia[actual] con copia[vecino]",     "      connect copy[current] with copy[neighbor]"],
    ["retorna",   "  retornar copia[nodo inicial]",                     "  return copy[starting node]"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("Cuadrado (4 nodos)", "Square (4 nodes)"), input: { n: 4, adj: [[1,3],[0,2],[1,3],[0,2]] } },
      { name: L("Un solo nodo", "Single node"), input: { n: 1, adj: [[]] } },
      { name: L("Grafo vacío", "Empty graph"), input: { n: 0, adj: [] } },
    ],

    editor: VIS.graphEditor({
      id: 133,
      maxNodos: 15,
      directed: false,
      defaultInput: "[[2,4],[1,3],[2,4],[1,3]]",
      parser: VIS.parse.adjList,
      hint: L("Adyacencias (1-indexed), ej: [[2,4]]", "Adjacencies (1-indexed), ex: [[2,4]]")
    }),

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

      if (n === 0) {
        snap(L("El grafo está vacío, no hay nada que clonar.", "The graph is empty, nothing to clone."), [A.esNulo, A.retNulo]);
        return steps;
      }

      const cola = [0];
      copia.add(0);
      state[0] = "done";
      snap(L("Clonamos el nodo inicial 0 y lo metemos a la cola.",
             "Clone the start node 0 and push it into the queue."), [A.copiaIni, A.cola0]);

      while (cola.length) {
        const actual = cola.shift();
        state[actual] = "current";
        snap(L(`Procesamos ${actual}. Recorremos sus vecinos.`,
               `Process ${actual}. We go through its neighbors.`), [A.saca, A.porVecino]);
        for (const vec of adj[actual]) {
          if (!copia.has(vec)) {
            copia.add(vec);
            cola.push(vec);
            snap(L(`Vecino ${vec} nuevo: creamos su clon y lo encolamos.`,
                   `New neighbor ${vec}: create its clone and enqueue it.`), [A.esNuevo, A.creaCopia, A.encola]);
          }
          const key = Math.min(actual, vec) + "-" + Math.max(actual, vec);
          if (!clonAristas.includes(key)) clonAristas.push(key);
          snap(L(`Conectamos en el clon: ${actual} — ${vec}.`,
                 `Connect in the clone: ${actual} — ${vec}.`), A.conecta);
        }
        state[actual] = "done";
      }
      snap(L(`Clon completo: ${copia.size} nodos y sus aristas copiadas.`,
             `Clone complete: ${copia.size} nodes and their edges copied.`), A.retorna);
      return steps;
    },
  };
})();
