/* 863. All Nodes Distance K — árbol → grafo (con padres) + BFS desde el objetivo. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion distanceK(root, target, k):",             "function distanceK(root, target, k):"],
    ["padres",    "  padres pasa a ser recorrer el árbol con DFS anotando el padre de cada nodo",
                  "  parents becomes walk the tree with DFS noting each node's parent"],
    ["cola",      "  cola empieza con target dentro",       "  queue starts with target inside"],
    ["visto",     "  visto empieza con target dentro",   "  seen starts with target inside"],
    ["dist0",     "  dist empieza en 0",                                      "  dist starts at 0"],
    ["mientras",  "  mientras la cola no esté vacía:",               "  while the queue is not empty:"],
    ["esK",       "    si dist = k:",                                "    if dist = k:"],
    ["retVals",   "      retornar los valores de la cola",           "      return the values in the queue"],
    ["siguiente", "    siguiente empieza vacío",                     "    next starts empty"],
    ["porNodo",   "    para cada nodo de la cola:",                  "    for each node in the queue:"],
    ["vecinos",   "      vecinos son su hijo izquierdo, su hijo derecho y su padre",
                  "      neighbors are its left child, its right child and its parent"],
    ["porVecino", "      para cada vecino que exista:",              "      for each neighbor that exists:"],
    ["noVisto",   "        si el vecino no ha sido visto:",          "        if the neighbor has not been seen:"],
    ["marca",     "          marcar el vecino como visto",           "          mark the neighbor as seen"],
    ["encola",    "          añadir el vecino a siguiente",          "          add the neighbor to next"],
    ["sube",      "    sumar 1 a dist",                             "    add 1 to dist"],
    ["avanza",    "    cola pasa a ser siguiente",                            "    queue becomes next"],
    ["vacio",     "  retornar la lista vacía   // el árbol no llega tan lejos",
                  "  return the empty list     // the tree does not reach that far"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("target=5, k=2", "target=5, k=2"), input: { tree: [3,5,1,6,2,0,8,null,null,7,4], target: 5, k: 2 } },
      { name: L("target=3, k=1", "target=3, k=1"), input: { tree: [3,5,1,6,2,0,8], target: 3, k: 1 } },
    ],

    // Modo interactivo: escribe el árbol, elige el objetivo y la distancia.
    // `target` es un desplegable de nodos existentes por una razón dura:
    // build() lanza una excepción si el objetivo no está en el árbol.
    // `k` llega al diámetro, no a la altura: la distancia puede subir y volver a
    // bajar, así que hay nodos más lejos de lo que el árbol es alto.
    editor: {
      kind: "text",
      fields: [
        VIS.arbol.campo(),
        { id: "target", type: "select", label: { es: "Objetivo", en: "Target" },
          options(state) { return VIS.arbol.opcionesDeNodos(state.tree); } },
        { id: "k", type: "select", label: { es: "Distancia k", en: "Distance k" },
          options(state) { return VIS.arbol.opcionesDeK(state.tree); } },
      ],
      initial() { return { tree: "[3,5,1,6,2,0,8,null,null,7,4]", target: "5", k: "2" }; },
      parse(state) { return VIS.arbol.parseCon(state, ["target", "k"]); },
      previewSpec(input) {
        return VIS.preview.tree(input.tree, { es: "Árbol", en: "Tree" }, [input.target]);
      },
      hint: {
        es: "Escribe el árbol, elige un nodo objetivo y una distancia. Se buscan los nodos a exactamente esa distancia. Luego pulsa Ejecutar.",
        en: "Type the tree, pick a target node and a distance. We look for the nodes exactly that far away. Then press Run.",
      },
    },

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
             `Target ${input.target}. Ring BFS; we look for distance ${input.k}.`),
           [A.cola, A.visto, A.dist0], cola, dist);
      while (cola.length) {
        if (dist === input.k) {
          cola.forEach((nd) => (state[nd.id] = "path"));
          snap(L(`Distancia ${dist} = K. Nodos: [${cola.map((n) => n.val).join(", ")}].`,
                 `Distance ${dist} = K. Nodes: [${cola.map((n) => n.val).join(", ")}].`),
               [A.esK, A.retVals], cola, dist);
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
               `Advance one ring. dist = ${dist}. Frontier: [${cola.map((n) => n.val).join(", ")}].`),
             [A.sube, A.avanza], cola, dist);
      }
      snap(L(`No hay nodos a distancia ${input.k}. Respuesta [].`,
             `No nodes at distance ${input.k}. Answer [].`), A.vacio, [], dist);
      return steps;
    },
  };
})();
