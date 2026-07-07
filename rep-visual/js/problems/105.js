/* 105. Construct Binary Tree from Preorder and Inorder. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["105"] = {
    num: 105, slug: "build-tree-pre-in", title: "Construct Binary Tree from Preorder and Inorder",
    difficulty: "M", block: "arboles", tags: ["recursión", "divide y vencerás"],
    summary: L(
      "Preorder da la raíz (su primer elemento); buscar esa raíz en inorder separa el subárbol izquierdo del derecho. Se repite recursivamente sobre cada mitad para construir todo el árbol.",
      "Preorder gives the root (its first element); finding that root in inorder splits the left subtree from the right. Repeat recursively on each half to build the whole tree."),
    legend: [
      { cls: "current", label: L("raíz recién creada", "newly created root") },
      { cls: "done", label: L("ya construido", "already built") },
    ],
    code: {
      es: [
        "funcion build(pre, ino):",
        "  si rango vacío: retornar nulo",
        "  raiz ← pre[inicio]        // 1º de preorder",
        "  k ← posición de raiz en inorder",
        "  izquierda ← build(mitad izquierda)",
        "  derecha  ← build(mitad derecha)",
        "  retornar raiz",
      ],
      en: [
        "function build(pre, ino):",
        "  if range empty: return null",
        "  root ← pre[start]         // 1st of preorder",
        "  k ← position of root in inorder",
        "  left  ← build(left half)",
        "  right ← build(right half)",
        "  return root",
      ],
    },
    cases: [
      { name: L("pre=[3,9,20,15,7] in=[9,3,15,20,7]", "pre=[3,9,20,15,7] in=[9,3,15,20,7]"), input: { pre: [3,9,20,15,7], ino: [9,3,15,20,7] } },
      { name: L("pre=[1,2,3] in=[2,1,3]", "pre=[1,2,3] in=[2,1,3]"), input: { pre: [1,2,3], ino: [2,1,3] } },
    ],

    build(input) {
      const pre = input.pre, ino = input.ino, n = pre.length;
      const events = [];
      let idc = 0;
      function make(preLo, preHi, inLo, inHi) {
        if (preLo > preHi) return null;
        const val = pre[preLo];
        const node = { id: idc++, val, left: null, right: null };
        let k = inLo; while (ino[k] !== val) k++;
        events.push({ id: node.id, val, preLo, inLo, inHi, k });
        const leftSize = k - inLo;
        node.left = make(preLo + 1, preLo + leftSize, inLo, k - 1);
        node.right = make(preLo + leftSize + 1, preHi, k + 1, inHi);
        return node;
      }
      const root = make(0, n - 1, 0, n - 1);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const created = new Set();
      const state = {};

      const snap = (note, line, ev) => {
        const nodes = layout.nodes.filter((nd) => created.has(nd.id))
          .map((nd) => ({ id: nd.id, label: nd.label, x: nd.x, y: nd.y, cls: state[nd.id] || "" }));
        const edges = layout.edges.filter((e) => created.has(e.from) && created.has(e.to));
        steps.push({ line, note, stage: [
          { type: "tree", label: L("Árbol en construcción", "Tree under construction"), r: 18, nodes, edges },
          { type: "list", label: "preorder", items: pre.map((v, i) => ({ v, cls: ev && i === ev.preLo ? "current" : "" })) },
          { type: "list", label: "inorder", items: ino.map((v, i) => ({ v, cls: ev && i === ev.k ? "current" : (ev && i >= ev.inLo && i <= ev.inHi ? "path" : "") })) },
        ] });
      };

      snap(L("Construimos el árbol dividiendo con preorder + inorder.",
             "We build the tree by splitting with preorder + inorder."), 0, null);
      for (const ev of events) {
        created.add(ev.id);
        state[ev.id] = "current";
        snap(L(`Raíz ${ev.val} (preorder). En inorder está en la posición ${ev.k}: a su izquierda el subárbol izquierdo, a la derecha el derecho.`,
               `Root ${ev.val} (preorder). In inorder it's at position ${ev.k}: to its left the left subtree, to its right the right one.`), [2, 3], ev);
        state[ev.id] = "done";
      }
      snap(L("Árbol reconstruido por completo.", "Tree fully reconstructed."), 6, null);
      return steps;
    },
  };
})();
