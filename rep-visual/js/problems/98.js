/* 98. Validate Binary Search Tree — DFS con rango permitido (bajo, alto). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",       "funcion isValidBST(root):",                          "function isValidBST(root):"],
    ["llama",    "  retornar valida(root, menos infinito, más infinito)",
                 "  return valid(root, minus infinity, plus infinity)"],
    ["",         "",                                                   ""],
    ["validaFn", "funcion valida(nodo, bajo, alto):",                  "function valid(node, low, high):"],
    ["esNulo",   "  si nodo es nulo:",                                 "  if node is null:"],
    ["nuloOk",   "    retornar verdadero              // un hueco nunca rompe nada",
                 "    return true                     // a gap never breaks anything"],
    ["fuera",    "  si nodo.val no está entre bajo y alto:   // los extremos no cuentan",
                 "  if node.val is not between low and high: // the ends don't count"],
    ["falso",    "    retornar falso",                                 "    return false"],
    ["izq",      "  izq pasa a ser valida(nodo.izq, bajo, nodo.val)  // a la izquierda, nodo.val es el techo",
                 "  left becomes valid(node.left, low, node.val)  // on the left, node.val is the ceiling"],
    ["der",      "  der pasa a ser valida(nodo.der, nodo.val, alto)  // a la derecha, nodo.val es el piso",
                 "  right becomes valid(node.right, node.val, high)  // on the right, node.val is the floor"],
    ["ambos",    "  retornar izq y der",                               "  return left and right"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("[2,1,3] válido", "[2,1,3] valid"), input: [2,1,3] },
      { name: L("[5,1,4,null,null,3,6] inválido", "[5,1,4,null,null,3,6] invalid"), input: [5,1,4,null,null,3,6] },
    ],

    // Modo interactivo: escribe el árbol en la notación de LeetCode (por
    // niveles, con null para los huecos) y se dibuja mientras escribes.
    editor: VIS.treeEditor("[2,1,3]", {
      es: "Escribe un árbol y comprueba si es un BST. Prueba [5,1,4,null,null,3,6], que no lo es. Luego pulsa Ejecutar.",
      en: "Type a tree and check whether it is a BST. Try [5,1,4,null,null,3,6], which is not. Then press Run.",
    }),

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
             "Each node must fall within a range (low, high)."), [A.fn, A.llama]);
      let ok = true;
      function valida(nd, bajo, alto) {
        if (!nd) return true;
        state[nd.id] = "current";
        snap(L(`Validamos ${nd.val}: debe estar en (${fmt(bajo)}, ${fmt(alto)}).`,
               `Validate ${nd.val}: must be in (${fmt(bajo)}, ${fmt(alto)}).`), [A.validaFn, A.fuera], [bajo, alto]);
        if (nd.val <= bajo || nd.val >= alto) {
          state[nd.id] = "target"; ok = false;
          snap(L(`${nd.val} viola el rango → NO es BST.`,
                 `${nd.val} violates the range → NOT a BST.`), [A.fuera, A.falso], [bajo, alto]);
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
                 "We found a violation: <b>not a BST</b>."), ok ? A.ambos : A.falso);
      return steps;
    },
  };
})();
