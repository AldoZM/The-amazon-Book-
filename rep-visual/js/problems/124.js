/* 124. Binary Tree Maximum Path Sum — DFS de ganancia con mejor global. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",         "funcion maxPathSum(root):",                       "function maxPathSum(root):"],
    ["mejor0",     "  mejor empieza en menos infinito",                        "  best becomes minus infinity"],
    ["llama",      "  ganancia(root)",                                "  gain(root)"],
    ["retorna",    "  retornar mejor",                                "  return best"],
    ["",           "",                                                ""],
    ["gananciaFn", "funcion ganancia(nodo):",                         "function gain(node):"],
    ["esNulo",     "  si nodo es nulo:",                              "  if node is null:"],
    ["cero",       "    retornar 0",                                  "    return 0"],
    ["izq",        "  izq pasa a ser la mayor de ganancia(nodo.izq) y 0  // una rama negativa no conviene",
                   "  left becomes the larger of gain(node.left) and 0  // a negative branch is not worth it"],
    ["der",        "  der pasa a ser la mayor de ganancia(nodo.der) y 0",      "  right becomes the larger of gain(node.right) and 0"],
    ["dobla",      "  mejor pasa a ser la mayor de mejor y (nodo.val + izq + der)  // el camino dobla aquí",
                   "  best becomes the larger of best and (node.val + left + right)  // the path bends here"],
    ["sube",       "  retornar nodo.val + la mayor de izq y der            // hacia arriba sube una sola rama",
                   "  return node.val + the larger of left and right          // only one branch goes upward"],
  ]);
  const A = C.L;

  P["124"] = {
    num: 124, slug: "max-path-sum", title: "Binary Tree Maximum Path Sum",
    difficulty: "H", block: "arboles", tags: ["DFS", "recursión"],
    summary: L(
      "Suma máxima de un camino cualquiera (puede doblar en un nodo). En cada nodo probamos el camino que dobla ahí (valor + ganancia izq + ganancia der) y devolvemos hacia arriba solo una rama.",
      "Maximum sum of any path (it may bend at a node). At each node we try the path that bends there (value + left gain + right gain) and return only one branch upward."),
    legend: [
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("procesado", "processed") },
      { cls: "path", label: L("mejor cima", "best apex") },
    ],
    code: C,
    cases: [
      { name: L("[1,2,3] → 6", "[1,2,3] → 6"), input: [1,2,3] },
      { name: L("[-10,9,20,null,null,15,7] → 42", "[-10,9,20,null,null,15,7] → 42"), input: [-10,9,20,null,null,15,7] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      let mejor = -Infinity, mejorId = null;

      const snap = (note, line) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y,
            cls: n.id === mejorId ? "path" : (state[n.id] || "") })),
          edges: layout.edges },
        vars: [{ k: L("mejor", "best"), v: mejor === -Infinity ? "-∞" : mejor, cls: "result" }] });

      snap(L("Postorden: calculamos la ganancia de cada rama.",
             "Postorder: compute each branch's gain."), [A.mejor0, A.llama]);
      function ganancia(nd) {
        if (!nd) return 0;
        state[nd.id] = "current";
        snap(L(`Entramos a ${nd.val}.`, `Enter ${nd.val}.`), A.gananciaFn);
        const izq = Math.max(ganancia(nd.left), 0);
        const der = Math.max(ganancia(nd.right), 0);
        const dobla = nd.val + izq + der;
        if (dobla > mejor) { mejor = dobla; mejorId = nd.id; }
        state[nd.id] = "done";
        snap(L(`En ${nd.val}: izq=${izq}, der=${der}. Camino que dobla = ${dobla}. Mejor = ${mejor}.`,
               `At ${nd.val}: left=${izq}, right=${der}. Bending path = ${dobla}. Best = ${mejor}.`),
             [A.izq, A.der, A.dobla, A.sube]);
        return nd.val + Math.max(izq, der);
      }
      ganancia(root);
      snap(L(`Suma máxima de camino: <b>${mejor}</b>.`,
             `Maximum path sum: <b>${mejor}</b>.`), A.retorna);
      return steps;
    },
  };
})();
