/* 103. Zigzag Level Order — BFS por niveles alternando la dirección. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["103"] = {
    num: 103, slug: "zigzag-level-order", title: "Binary Tree Zigzag Level Order Traversal",
    difficulty: "M", block: "arboles", tags: ["BFS", "niveles"],
    summary: L(
      "Recorrido por niveles pero serpenteando: primer nivel de izquierda a derecha, el siguiente de derecha a izquierda, y así. BFS normal; solo invertimos el orden en los niveles impares.",
      "Level-order traversal but zigzagging: first level left-to-right, next right-to-left, and so on. Plain BFS; we just reverse the order on odd levels."),
    legend: [
      { cls: "frontier", label: L("en la cola", "in the queue") },
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("procesado", "processed") },
    ],
    code: {
      es: [
        "funcion zigzag(root):",
        "  si root nulo: retornar []",
        "  resp ← []; cola ← [root]; izqADer ← verdadero",
        "  mientras cola no vacía:",
        "    tam ← tamaño;  nivel ← []",
        "    repetir tam veces:",
        "      nodo ← sacar;  encolar hijos",
        "      si izqADer: nivel al final",
        "      si no: nivel al inicio",
        "    resp += nivel;  izqADer ← no izqADer",
        "  retornar resp",
      ],
      en: [
        "function zigzag(root):",
        "  if root null: return []",
        "  ans ← []; queue ← [root]; leftToRight ← true",
        "  while queue not empty:",
        "    size ← queue size;  level ← []",
        "    repeat size times:",
        "      node ← pop;  enqueue children",
        "      if leftToRight: append to level",
        "      else: prepend to level",
        "    ans += level;  leftToRight ← not leftToRight",
        "  return ans",
      ],
    },
    cases: [
      { name: L("[3,9,20,null,null,15,7]", "[3,9,20,null,null,15,7]"), input: [3,9,20,null,null,15,7] },
      { name: L("[1,2,3,4,5,6,7]", "[1,2,3,4,5,6,7]"), input: [1,2,3,4,5,6,7] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: 1, note: L("Árbol vacío: [].", "Empty tree: [].") }); return steps; }
      const layout = VIS.binaryLayout(root);
      const state = {};
      const resp = [];

      const snap = (note, line, cola) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        queue: { label: L("Cola", "Queue"), arrows: true, items: cola.map((nd) => nd.val) },
        list: { label: L("Resultado", "Result"), items: resp.map((lv) => "[" + lv.join(",") + "]") } });

      let cola = [root]; state[root.id] = "frontier"; let izqADer = true;
      snap(L("Raíz a la cola. Empezamos de izquierda a derecha.",
             "Root into the queue. We start left-to-right."), 2, cola);
      while (cola.length) {
        const tam = cola.length; const nivel = [];
        snap(L(`Nivel con ${tam} nodo(s), dirección ${izqADer ? "→" : "←"}.`,
               `Level with ${tam} node(s), direction ${izqADer ? "→" : "←"}.`), 4, cola);
        for (let i = 0; i < tam; i++) {
          const nodo = cola.shift();
          state[nodo.id] = "current";
          if (izqADer) nivel.push(nodo.val); else nivel.unshift(nodo.val);
          snap(L(`Sacamos ${nodo.val}; lo ponemos ${izqADer ? "al final" : "al inicio"} del nivel.`,
                 `Pop ${nodo.val}; place it at the ${izqADer ? "end" : "start"} of the level.`), [6, 7, 8], cola);
          if (nodo.left) { cola.push(nodo.left); state[nodo.left.id] = "frontier"; }
          if (nodo.right) { cola.push(nodo.right); state[nodo.right.id] = "frontier"; }
          state[nodo.id] = "done";
        }
        resp.push(nivel);
        izqADer = !izqADer;
      }
      snap(L(`Recorrido zigzag: [${resp.map((lv) => "[" + lv.join(",") + "]").join(", ")}].`,
             `Zigzag traversal: [${resp.map((lv) => "[" + lv.join(",") + "]").join(", ")}].`), 10, []);
      return steps;
    },
  };
})();
