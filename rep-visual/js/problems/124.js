/* 124. Binary Tree Maximum Path Sum — DFS de ganancia con mejor global. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion maxPathSum(root):",
        "  mejor ← -∞",
        "  ganancia(root)",
        "  retornar mejor",
        "",
        "funcion ganancia(nodo):",
        "  si nodo es nulo: retornar 0",
        "  izq ← máx(ganancia(nodo.izq), 0)   // negativos se descartan",
        "  der ← máx(ganancia(nodo.der), 0)",
        "  mejor ← máx(mejor, nodo.val + izq + der)   // dobla aquí",
        "  retornar nodo.val + máx(izq, der)          // sube una rama",
      ],
      en: [
        "function maxPathSum(root):",
        "  best ← -∞",
        "  gain(root)",
        "  return best",
        "",
        "function gain(node):",
        "  if node is null: return 0",
        "  left ← max(gain(node.left), 0)   // discard negatives",
        "  right ← max(gain(node.right), 0)",
        "  best ← max(best, node.val + left + right)   // bends here",
        "  return node.val + max(left, right)          // go up one branch",
      ],
    },
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
             "Postorder: compute each branch's gain."), 2);
      function ganancia(nd) {
        if (!nd) return 0;
        state[nd.id] = "current";
        snap(L(`Entramos a ${nd.val}.`, `Enter ${nd.val}.`), [5]);
        const izq = Math.max(ganancia(nd.left), 0);
        const der = Math.max(ganancia(nd.right), 0);
        const dobla = nd.val + izq + der;
        if (dobla > mejor) { mejor = dobla; mejorId = nd.id; }
        state[nd.id] = "done";
        snap(L(`En ${nd.val}: izq=${izq}, der=${der}. Camino que dobla = ${dobla}. Mejor = ${mejor}.`,
               `At ${nd.val}: left=${izq}, right=${der}. Bending path = ${dobla}. Best = ${mejor}.`), [9, 10]);
        return nd.val + Math.max(izq, der);
      }
      ganancia(root);
      snap(L(`Suma máxima de camino: <b>${mejor}</b>.`,
             `Maximum path sum: <b>${mejor}</b>.`), 3);
      return steps;
    },
  };
})();
