/* 199. Binary Tree Right Side View — BFS por niveles, último de cada nivel. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["199"] = {
    num: 199, slug: "right-side-view", title: "Binary Tree Right Side View",
    difficulty: "M", block: "arboles", tags: ["BFS", "niveles"],
    summary: L(
      "Lo que verías mirando el árbol desde la derecha: el último nodo de cada nivel. BFS nivel por nivel; en cada nivel guardamos el nodo más a la derecha.",
      "What you'd see looking at the tree from the right: the last node of each level. Level-by-level BFS; on each level we keep the rightmost node."),
    legend: [
      { cls: "frontier", label: L("en la cola", "in the queue") },
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "path", label: L("visible (derecha)", "visible (right)") },
      { cls: "done", label: L("procesado", "processed") },
    ],
    code: {
      es: [
        "funcion rightSideView(root):",
        "  si root es nulo: retornar []",
        "  resp ← []; cola ← [root]",
        "  mientras cola no vacía:",
        "    tam ← tamaño de la cola",
        "    para i de 0 a tam-1:",
        "      nodo ← sacar de la cola",
        "      si i == tam-1: resp.añadir(nodo.val)",
        "      si nodo.izq: encolar izq",
        "      si nodo.der: encolar der",
        "  retornar resp",
      ],
      en: [
        "function rightSideView(root):",
        "  if root is null: return []",
        "  ans ← []; queue ← [root]",
        "  while queue not empty:",
        "    size ← queue size",
        "    for i from 0 to size-1:",
        "      node ← pop from queue",
        "      if i == size-1: ans.append(node.val)",
        "      if node.left: enqueue left",
        "      if node.right: enqueue right",
        "  return ans",
      ],
    },
    cases: [
      { name: L("[1,2,3,null,5,null,4]", "[1,2,3,null,5,null,4]"), input: [1,2,3,null,5,null,4] },
      { name: L("[1,2,3,4]", "[1,2,3,4]"), input: [1,2,3,4] },
      { name: L("Rama izquierda", "Left branch"), input: [1,2,null,3,null,4] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: 1, note: L("Árbol vacío: respuesta [].", "Empty tree: answer [].") }); return steps; }

      const layout = VIS.binaryLayout(root);
      const state = {};

      const treeSpec = () => ({
        label: L("Árbol", "Tree"), r: 18,
        nodes: layout.nodes.map((nn) => ({ id: nn.id, label: nn.label, x: nn.x, y: nn.y, cls: state[nn.id] || "" })),
        edges: layout.edges,
      });
      const resp = [];
      const snap = (note, line, q) => {
        steps.push({ line, note, tree: treeSpec(),
          queue: { label: L("Cola (nivel)", "Queue (level)"), arrows: true, items: q.map((nd) => nd.val) },
          list: { label: L("Vista derecha", "Right view"), items: resp.slice() } });
      };

      let cola = [root];
      state[root.id] = "frontier";
      snap(L("Metemos la raíz a la cola.", "Push the root into the queue."), [2], cola);

      while (cola.length) {
        const tam = cola.length;
        snap(L(`Nivel con ${tam} nodo(s). El último que saquemos será visible desde la derecha.`,
               `Level with ${tam} node(s). The last one we pop is visible from the right.`), 4, cola);
        for (let i = 0; i < tam; i++) {
          const nodo = cola.shift();
          state[nodo.id] = "current";
          const esUltimo = i === tam - 1;
          snap(L(`Sacamos ${nodo.val}${esUltimo ? " (último del nivel → visible)" : ""}.`,
                 `Pop ${nodo.val}${esUltimo ? " (last of the level → visible)" : ""}.`), [6, 7], cola);
          if (esUltimo) { resp.push(nodo.val); state[nodo.id] = "path"; }
          else state[nodo.id] = "done";
          if (nodo.left) { cola.push(nodo.left); state[nodo.left.id] = "frontier"; }
          if (nodo.right) { cola.push(nodo.right); state[nodo.right.id] = "frontier"; }
        }
      }
      snap(L(`Vista desde la derecha: [${resp.join(", ")}].`,
             `Right side view: [${resp.join(", ")}].`), 10, []);
      return steps;
    },
  };
})();
