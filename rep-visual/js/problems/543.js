/* 543. Diameter of Binary Tree — DFS de altura con mejor global. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",         "funcion diameterOfBinaryTree(root):",          "function diameterOfBinaryTree(root):"],
    ["mejor0",     "  mejor empieza en 0",                                  "  best starts at 0"],
    ["llamaAltura","  altura(root)",                               "  height(root)"],
    ["retorna",    "  retornar mejor",                             "  return best"],
    ["",           "",                                             ""],
    ["alturaFn",   "funcion altura(nodo):",                        "function height(node):"],
    ["esNulo",     "  si nodo es nulo:",                           "  if node is null:"],
    ["retCero",    "    retornar 0",                               "    return 0"],
    ["bajaIzq",    "  izq pasa a ser altura(nodo.izq)",                     "  left becomes height(node.left)"],
    ["bajaDer",    "  der pasa a ser altura(nodo.der)",                     "  right becomes height(node.right)"],
    ["camino",     "  camino pasa a ser izq + der        // el camino que pasa por nodo",
                   "  path becomes left + right          // the path going through node"],
    ["actualiza",  "  mejor pasa a ser la mayor de mejor y camino",         "  best becomes the larger of best and path"],
    ["retAltura",  "  retornar 1 + la mayor de izq y der",         "  return 1 + the larger of left and right"],
  ]);
  const A = C.L;

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
    code: C,
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
             "Postorder traversal computing each subtree's height."), A.llamaAltura);
      function altura(nd) {
        if (!nd) return 0;
        state[nd.id] = "current";
        snap(L(`Entramos a ${nd.val}: primero sus hijos.`, `Enter ${nd.val}: its children first.`),
             [A.alturaFn, A.bajaIzq, A.bajaDer]);
        const izq = altura(nd.left);
        const der = altura(nd.right);
        if (izq + der > mejor) { mejor = izq + der; mejorId = nd.id; }
        state[nd.id] = "done";
        snap(L(`En ${nd.val}: alturas ${izq} y ${der}. Camino por aquí = ${izq + der}. Mejor = ${mejor}.`,
               `At ${nd.val}: heights ${izq} and ${der}. Path here = ${izq + der}. Best = ${mejor}.`),
             [A.camino, A.actualiza]);
        return 1 + Math.max(izq, der);
      }
      altura(root);
      snap(L(`Diámetro del árbol: <b>${mejor}</b> aristas.`,
             `Tree diameter: <b>${mejor}</b> edges.`), A.retorna);
      return steps;
    },
  };
})();
