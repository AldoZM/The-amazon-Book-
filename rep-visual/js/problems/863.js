/* 863. All Nodes Distance K — árbol → grafo (con padres) + BFS desde el objetivo. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["863"] = {
    num: 863, slug: "all-nodes-distance-k", title: "All Nodes Distance K in Binary Tree",
    difficulty: "M", block: "arboles", tags: ["BFS", "grafo"],
    summary: L(
      "Nodos a distancia exactamente K de un objetivo. Truco: añadir punteros al padre convierte el árbol en grafo; luego un BFS desde el objetivo se expande en las 3 direcciones (izq, der, padre).",
      "Nodes at exactly distance K from a target. Trick: adding parent pointers turns the tree into a graph; then a BFS from the target expands in 3 directions (left, right, parent)."),
    legend: [
      { cls: "target", label: L("objetivo", "target") },
      { cls: "current", label: L("frontera BFS", "BFS frontier") },
      { cls: "done", label: L("visitado", "visited") },
      { cls: "path", label: L("a distancia K", "at distance K") },
    ],
    code: {
      es: [
        "funcion distanceK(root, target, k):",
        "  padres[] ← DFS que guarda el padre de cada nodo",
        "  cola ← [target]; visto ← {target}; dist ← 0",
        "  mientras cola no vacía:",
        "    si dist == k: retornar valores en la cola",
        "    por cada nodo del nivel:",
        "      vecinos = {izq, der, padre}",
        "      si vecino no visto: marcar y encolar",
        "    dist += 1",
        "  retornar []   // no hay suficientes niveles",
      ],
      en: [
        "function distanceK(root, target, k):",
        "  parents[] ← DFS storing each node's parent",
        "  queue ← [target]; seen ← {target}; dist ← 0",
        "  while queue not empty:",
        "    if dist == k: return values in the queue",
        "    for each node of the level:",
        "      neighbors = {left, right, parent}",
        "      if neighbor unseen: mark and enqueue",
        "    dist += 1",
        "  return []   // not enough levels",
      ],
    },
    cases: [
      { name: L("target=5, k=2", "target=5, k=2"), input: { tree: [3,5,1,6,2,0,8,null,null,7,4], target: 5, k: 2 } },
      { name: L("target=3, k=1", "target=3, k=1"), input: { tree: [3,5,1,6,2,0,8], target: 3, k: 1 } },
    ],

    build(input) {
      const root = VIS.treeFromArray(input.tree);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      const parent = {};
      (function walk(nd, p) { if (!nd) return; parent[nd.id] = p; walk(nd.left, nd); walk(nd.right, nd); })(root, null);
      let targetNode = null;
      (function find(nd) { if (!nd) return; if (nd.val === input.target) targetNode = nd; find(nd.left); find(nd.right); })(root);
      state[targetNode.id] = "target";

      const snap = (note, line, cola, distVal) => steps.push({ line, note,
        tree: { label: L("Árbol (BFS trata padre como vecino)", "Tree (BFS treats parent as a neighbor)"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        queue: { label: L("Frontera", "Frontier"), arrows: true, items: cola.map((nd) => nd.val) },
        vars: [{ k: "dist", v: (distVal != null ? distVal : 0), cls: "result" }] });

      let cola = [targetNode]; const visto = new Set([targetNode.id]); let dist = 0;
      snap(L(`Objetivo ${input.target}. BFS por anillos; buscamos distancia ${input.k}.`,
             `Target ${input.target}. Ring BFS; we look for distance ${input.k}.`), 2, cola, dist);
      while (cola.length) {
        if (dist === input.k) {
          cola.forEach((nd) => (state[nd.id] = "path"));
          snap(L(`Distancia ${dist} = K. Nodos: [${cola.map((n) => n.val).join(", ")}].`,
                 `Distance ${dist} = K. Nodes: [${cola.map((n) => n.val).join(", ")}].`), 4, cola, dist);
          return steps;
        }
        const sig = [];
        for (const nd of cola) {
          if (state[nd.id] !== "target") state[nd.id] = "current";
          const vecinos = [nd.left, nd.right, parent[nd.id]];
          for (const v of vecinos) {
            if (v && !visto.has(v.id)) { visto.add(v.id); sig.push(v); }
          }
          if (state[nd.id] !== "target") state[nd.id] = "done";
        }
        dist++;
        cola = sig;
        snap(L(`Avanzamos un anillo. dist = ${dist}. Frontera: [${cola.map((n) => n.val).join(", ")}].`,
               `Advance one ring. dist = ${dist}. Frontier: [${cola.map((n) => n.val).join(", ")}].`), [8], cola, dist);
      }
      snap(L(`No hay nodos a distancia ${input.k}. Respuesta [].`,
             `No nodes at distance ${input.k}. Answer [].`), 9, [], dist);
      return steps;
    },
  };
})();
