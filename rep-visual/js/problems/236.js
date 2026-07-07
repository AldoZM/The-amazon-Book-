/* 236. Lowest Common Ancestor — DFS que sube el ancestro común. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion lca(nodo, p, q):",
        "  si nodo es nulo: retornar nulo",
        "  si nodo == p o nodo == q: retornar nodo",
        "  izq ← lca(nodo.izq, p, q)",
        "  der ← lca(nodo.der, p, q)",
        "  si izq y der: retornar nodo   // lados distintos",
        "  retornar izq ó der (el no nulo)",
      ],
      en: [
        "function lca(node, p, q):",
        "  if node is null: return null",
        "  if node == p or node == q: return node",
        "  left ← lca(node.left, p, q)",
        "  right ← lca(node.right, p, q)",
        "  if left and right: return node   // different sides",
        "  return left or right (the non-null one)",
      ],
    },
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
             `We search for the LCA of ${input.p} and ${input.q} (marked).`), 0);

      function lca(nd) {
        if (!nd) return null;
        if (state[nd.id] !== "target") state[nd.id] = "current";
        if (isPQ(nd)) { snap(L(`Encontramos ${nd.val}: lo devolvemos hacia arriba.`,
                              `Found ${nd.val}: return it upward.`), 2); return nd; }
        snap(L(`Visitamos ${nd.val}. Bajamos a sus hijos.`, `Visit ${nd.val}. Descend to its children.`), [3]);
        const izq = lca(nd.left);
        const der = lca(nd.right);
        if (izq && der) {
          state[nd.id] = "path";
          snap(L(`${nd.val} recibe respuesta por AMBOS lados → es el LCA.`,
                 `${nd.val} gets an answer from BOTH sides → it's the LCA.`), 5);
          return nd;
        }
        if (state[nd.id] === "current") state[nd.id] = "done";
        const r = izq || der;
        if (r) snap(L(`${nd.val} pasa hacia arriba la respuesta del lado ${izq ? "izquierdo" : "derecho"} (${r.val}).`,
                     `${nd.val} passes up the answer from the ${izq ? "left" : "right"} side (${r.val}).`), 6);
        return r;
      }
      const ans = lca(root);
      if (ans) { state[ans.id] = "path"; snap(L(`LCA(${input.p}, ${input.q}) = <b>${ans.val}</b>.`,
                                              `LCA(${input.p}, ${input.q}) = <b>${ans.val}</b>.`), 5); }
      return steps;
    },
  };
})();
