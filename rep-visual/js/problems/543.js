/* 543. Diameter of Binary Tree — DFS de altura con mejor global. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["543"] = {
    num: 543, slug: "diameter-of-binary-tree", title: "Diameter of Binary Tree",
    difficulty: "M", block: "arboles", tags: ["DFS", "altura"],
    summary: L(
      "El diámetro es el camino más largo (en aristas) entre dos nodos. En cada nodo, el camino que pasa por él mide altura_izq + altura_der; guardamos el máximo global.",
      "The diameter is the longest path (in edges) between two nodes. At each node, the path through it measures left_height + right_height; we keep the global maximum."),
    legend: [
      { cls: "current", label: L("calculando altura", "computing height") },
      { cls: "done", label: L("altura lista", "height ready") },
      { cls: "path", label: L("nodo con mejor diámetro", "node with best diameter") },
    ],
    code: {
      es: [
        "funcion diameter(root):",
        "  mejor ← 0",
        "  altura(root)",
        "  retornar mejor",
        "",
        "funcion altura(nodo):",
        "  si nodo es nulo: retornar 0",
        "  izq ← altura(nodo.izq)",
        "  der ← altura(nodo.der)",
        "  mejor ← máx(mejor, izq + der)   // pasa por nodo",
        "  retornar 1 + máx(izq, der)",
      ],
      en: [
        "function diameter(root):",
        "  best ← 0",
        "  height(root)",
        "  return best",
        "",
        "function height(node):",
        "  if node is null: return 0",
        "  left ← height(node.left)",
        "  right ← height(node.right)",
        "  best ← max(best, left + right)   // through node",
        "  return 1 + max(left, right)",
      ],
    },
    cases: [
      { name: L("[1,2,3,4,5] → 3", "[1,2,3,4,5] → 3"), input: [1,2,3,4,5] },
      { name: L("Cadena → 3", "Chain → 3"), input: [1,2,null,3,null,4] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      let mejor = 0, mejorId = null;

      const snap = (note, line) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y,
            cls: n.id === mejorId ? "path" : (state[n.id] || "") })),
          edges: layout.edges },
        vars: [{ k: L("mejor diámetro", "best diameter"), v: mejor, cls: "result" }] });

      snap(L("Recorremos en postorden calculando la altura de cada subárbol.",
             "Postorder traversal computing each subtree's height."), 2);
      function altura(nd) {
        if (!nd) return 0;
        state[nd.id] = "current";
        snap(L(`Entramos a ${nd.val}: primero sus hijos.`, `Enter ${nd.val}: its children first.`), [5, 6]);
        const izq = altura(nd.left);
        const der = altura(nd.right);
        if (izq + der > mejor) { mejor = izq + der; mejorId = nd.id; }
        state[nd.id] = "done";
        snap(L(`En ${nd.val}: alturas ${izq} y ${der}. Camino por aquí = ${izq + der}. Mejor = ${mejor}.`,
               `At ${nd.val}: heights ${izq} and ${der}. Path here = ${izq + der}. Best = ${mejor}.`), [8, 9]);
        return 1 + Math.max(izq, der);
      }
      altura(root);
      snap(L(`Diámetro del árbol: <b>${mejor}</b> aristas.`,
             `Tree diameter: <b>${mejor}</b> edges.`), 3);
      return steps;
    },
  };
})();
