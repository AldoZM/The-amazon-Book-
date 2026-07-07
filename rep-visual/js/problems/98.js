/* 98. Validate Binary Search Tree — DFS con rango permitido (bajo, alto). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["98"] = {
    num: 98, slug: "validate-bst", title: "Validate Binary Search Tree",
    difficulty: "M", block: "arboles", tags: ["DFS", "rango"],
    summary: L(
      "Un BST cumple que TODO nodo a la izquierda es menor y a la derecha mayor. No basta comparar con el padre: cada nodo hereda un rango (bajo, alto) que debe respetar.",
      "A BST requires that EVERY node on the left is smaller and on the right larger. Comparing with the parent isn't enough: each node inherits a range (low, high) it must respect."),
    legend: [
      { cls: "current", label: L("validando", "validating") },
      { cls: "done", label: L("válido", "valid") },
      { cls: "target", label: L("viola el rango", "violates the range") },
    ],
    code: {
      es: [
        "funcion isValidBST(root):",
        "  retornar valida(root, -∞, +∞)",
        "",
        "funcion valida(nodo, bajo, alto):",
        "  si nodo es nulo: retornar verdadero",
        "  si nodo.val <= bajo o nodo.val >= alto:",
        "    retornar falso   // fuera de rango",
        "  izq ← valida(nodo.izq, bajo, nodo.val)",
        "  der ← valida(nodo.der, nodo.val, alto)",
        "  retornar izq y der",
      ],
      en: [
        "function isValidBST(root):",
        "  return valid(root, -∞, +∞)",
        "",
        "function valid(node, low, high):",
        "  if node is null: return true",
        "  if node.val <= low or node.val >= high:",
        "    return false   // out of range",
        "  left ← valid(node.left, low, node.val)",
        "  right ← valid(node.right, node.val, high)",
        "  return left and right",
      ],
    },
    cases: [
      { name: L("[2,1,3] válido", "[2,1,3] valid"), input: [2,1,3] },
      { name: L("[5,1,4,null,null,3,6] inválido", "[5,1,4,null,null,3,6] invalid"), input: [5,1,4,null,null,3,6] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      const fmt = (x) => (x === -Infinity ? "-∞" : x === Infinity ? "+∞" : x);

      const snap = (note, line, rango) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        vars: rango ? [{ k: L("rango permitido", "allowed range"), v: "(" + fmt(rango[0]) + ", " + fmt(rango[1]) + ")" }] : [] });

      snap(L("Cada nodo debe caer dentro de un rango (bajo, alto).",
             "Each node must fall within a range (low, high)."), 1);
      let ok = true;
      function valida(nd, bajo, alto) {
        if (!nd) return true;
        state[nd.id] = "current";
        snap(L(`Validamos ${nd.val}: debe estar en (${fmt(bajo)}, ${fmt(alto)}).`,
               `Validate ${nd.val}: must be in (${fmt(bajo)}, ${fmt(alto)}).`), [3, 4], [bajo, alto]);
        if (nd.val <= bajo || nd.val >= alto) {
          state[nd.id] = "target"; ok = false;
          snap(L(`${nd.val} viola el rango → NO es BST.`,
                 `${nd.val} violates the range → NOT a BST.`), 5, [bajo, alto]);
          return false;
        }
        state[nd.id] = "done";
        const izq = valida(nd.left, bajo, nd.val);
        if (!izq) return false;
        const der = valida(nd.right, nd.val, alto);
        return izq && der;
      }
      valida(root, -Infinity, Infinity);
      snap(ok ? L("Todos los nodos respetan su rango: <b>es BST</b>.",
                 "All nodes respect their range: <b>it is a BST</b>.")
              : L("Encontramos una violación: <b>no es BST</b>.",
                 "We found a violation: <b>not a BST</b>."), 9);
      return steps;
    },
  };
})();
