/* 236. Lowest Common Ancestor — DFS que sube el ancestro común. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",       "funcion lowestCommonAncestor(nodo, p, q):",   "function lowestCommonAncestor(node, p, q):"],
    ["esNulo",   "  si nodo es nulo:",                          "  if node is null:"],
    ["retNulo",  "    retornar nulo",                           "    return null"],
    ["esPoQ",    "  si nodo es p o nodo es q:",                 "  if node is p or node is q:"],
    ["retNodo",  "    retornar nodo",                           "    return node"],
    ["bajaIzq",  "  izq pasa a ser lowestCommonAncestor(nodo.izq, p, q)","  left becomes lowestCommonAncestor(node.left, p, q)"],
    ["bajaDer",  "  der pasa a ser lowestCommonAncestor(nodo.der, p, q)","  right becomes lowestCommonAncestor(node.right, p, q)"],
    ["ambos",    "  si izq y der traen respuesta:        // p y q están en lados distintos",
                 "  if left and right bring an answer:   // p and q are on different sides"],
    ["esLca",    "    retornar nodo",                           "    return node"],
    ["soloIzq",  "  si izq trae respuesta:",                    "  if left brings an answer:"],
    ["retIzq",   "    retornar izq",                            "    return left"],
    ["retDer",   "  retornar der",                              "  return right"],
  ]);
  const A = C.L;

  P["236"] = {
    num: 236, slug: "lowest-common-ancestor", title: "Lowest Common Ancestor of a Binary Tree",
    difficulty: "M", block: "arboles", tags: ["DFS", "recursión"],
    summary: L(
      "Ancestro común más bajo de dos nodos. DFS que devuelve p o q cuando los encuentra; el primer nodo que recibe respuesta por sus DOS lados es el LCA.",
      "Lowest common ancestor of two nodes. A DFS returns p or q when it finds them; the first node that gets an answer from BOTH sides is the LCA."),
    legend: [
      { cls: "target", label: L("p y q", "p and q") },
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("explorado", "explored") },
      { cls: "path", label: "LCA" },
    ],
    code: C,
    cases: [
      { name: L("p=5, q=1 → 3", "p=5, q=1 → 3"), input: { tree: [3,5,1,6,2,0,8,null,null,7,4], p: 5, q: 1 } },
      { name: L("p=5, q=4 → 5", "p=5, q=4 → 5"), input: { tree: [3,5,1,6,2,0,8,null,null,7,4], p: 5, q: 4 } },
    ],

    build(input) {
      const root = VIS.treeFromArray(input.tree);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      const isPQ = (nd) => nd && (nd.val === input.p || nd.val === input.q);
      layout.nodes.forEach((n) => { if (n.label === input.p || n.label === input.q) state[n.id] = "target"; });

      const snap = (note, line) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges } });

      snap(L(`Buscamos el LCA de ${input.p} y ${input.q} (marcados).`,
             `We search for the LCA of ${input.p} and ${input.q} (marked).`), A.fn);

      function lca(nd) {
        if (!nd) return null;
        if (state[nd.id] !== "target") state[nd.id] = "current";
        if (isPQ(nd)) { snap(L(`Encontramos ${nd.val}: lo devolvemos hacia arriba.`,
                              `Found ${nd.val}: return it upward.`), [A.esPoQ, A.retNodo]); return nd; }
        snap(L(`Visitamos ${nd.val}. Bajamos a sus hijos.`, `Visit ${nd.val}. Descend to its children.`),
             [A.bajaIzq, A.bajaDer]);
        const izq = lca(nd.left);
        const der = lca(nd.right);
        if (izq && der) {
          state[nd.id] = "path";
          snap(L(`${nd.val} recibe respuesta por AMBOS lados → es el LCA.`,
                 `${nd.val} gets an answer from BOTH sides → it's the LCA.`), [A.ambos, A.esLca]);
          return nd;
        }
        if (state[nd.id] === "current") state[nd.id] = "done";
        const r = izq || der;
        if (r) snap(L(`${nd.val} pasa hacia arriba la respuesta del lado ${izq ? "izquierdo" : "derecho"} (${r.val}).`,
                     `${nd.val} passes up the answer from the ${izq ? "left" : "right"} side (${r.val}).`),
                    izq ? [A.soloIzq, A.retIzq] : A.retDer);
        return r;
      }
      const ans = lca(root);
      if (ans) { state[ans.id] = "path"; snap(L(`LCA(${input.p}, ${input.q}) = <b>${ans.val}</b>.`,
                                              `LCA(${input.p}, ${input.q}) = <b>${ans.val}</b>.`), A.esLca); }
      return steps;
    },
  };
})();
