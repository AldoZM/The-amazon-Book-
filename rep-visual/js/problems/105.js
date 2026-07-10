/* 105. Construct Binary Tree from Preorder and Inorder. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",      "funcion buildTree(trozo de preorden, trozo de inorden):",
                "function buildTree(chunk of preorder, chunk of inorder):"],
    ["vacio",   "  si el trozo está vacío:",                         "  if the chunk is empty:"],
    ["nulo",    "    retornar nulo",                                 "    return null"],
    ["raiz",    "  raiz pasa a ser el primer valor del trozo de preorden",    "  root becomes the first value of the preorder chunk"],
    ["busca",   "  k pasa a ser la posición de raiz dentro del trozo de inorden",
                "  k becomes the position of root inside the inorder chunk"],
    ["izq",     "  raiz.izq pasa a ser buildTree(lo que queda antes de k)  // subárbol izquierdo",
                "  root.left becomes buildTree(what lies before k)   // left subtree"],
    ["der",     "  raiz.der pasa a ser buildTree(lo que queda después de k)  // subárbol derecho",
                "  root.right becomes buildTree(what lies after k)   // right subtree"],
    ["retorna", "  retornar raiz",                                   "  return root"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("pre=[3,9,20,15,7] in=[9,3,15,20,7]", "pre=[3,9,20,15,7] in=[9,3,15,20,7]"), input: { pre: [3,9,20,15,7], ino: [9,3,15,20,7] } },
      { name: L("pre=[1,2,3] in=[2,1,3]", "pre=[1,2,3] in=[2,1,3]"), input: { pre: [1,2,3], ino: [2,1,3] } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "pre", type: "text", label: { es: "Preorder", en: "Preorder" }, placeholder: { es: "[3,9,20,15,7]", en: "[3,9,20,15,7]" } },
        { id: "ino", type: "text", label: { es: "Inorder", en: "Inorder" }, placeholder: { es: "[9,3,15,20,7]", en: "[9,3,15,20,7]" } }
      ],
      initial() { return { pre: "[3,9,20,15,7]", ino: "[9,3,15,20,7]" }; },
      parse(state) {
        const p = VIS.parse.numberArray(state.pre, 15);
        if (!p.ok) return { ok: false, field: "pre", error: p.error };
        const i = VIS.parse.numberArray(state.ino, 15);
        if (!i.ok) return { ok: false, field: "ino", error: i.error };
        
        if (p.arr.length !== i.arr.length) {
          return { ok: false, field: "ino", error: { es: "Ambos arreglos deben tener la misma longitud.", en: "Both arrays must have the same length." } };
        }
        
        const sortP = p.arr.slice().sort((a,b) => a-b);
        const sortI = i.arr.slice().sort((a,b) => a-b);
        for (let j = 0; j < sortP.length; j++) {
          if (sortP[j] !== sortI[j]) {
            return { ok: false, field: "ino", error: { es: "Los arreglos deben tener los mismos elementos.", en: "The arrays must have the same elements." } };
          }
          if (j > 0 && sortP[j] === sortP[j-1]) {
            return { ok: false, field: "pre", error: { es: "No puede haber elementos duplicados.", en: "There cannot be duplicate elements." } };
          }
        }
        
        return { ok: true, input: { pre: p.arr, ino: i.arr } };
      },
      previewSpec(input) {
        const { pre, ino } = input;
        const n = pre.length;
        let idc = 0;
        function make(preLo, preHi, inLo, inHi) {
          if (preLo > preHi) return null;
          const val = pre[preLo];
          const node = { id: idc++, val, left: null, right: null };
          let k = inLo; while (k <= inHi && ino[k] !== val) k++;
          if (k > inHi) return null; // En un input válido siempre se encuentra, pero por si acaso
          const leftSize = k - inLo;
          node.left = make(preLo + 1, preLo + leftSize, inLo, k - 1);
          node.right = make(preLo + leftSize + 1, preHi, k + 1, inHi);
          return node;
        }
        const root = make(0, n - 1, 0, n - 1);
        if (!root) return { type: "tree", label: { es: "Árbol", en: "Tree" }, r: 18, nodes: [], edges: [] };
        const layout = VIS.binaryLayout(root);
        return {
          type: "tree", label: { es: "Árbol", en: "Tree" }, r: 18,
          nodes: layout.nodes.map(nd => ({ id: nd.id, label: nd.label, x: nd.x, y: nd.y, cls: "" })),
          edges: layout.edges
        };
      },
      hint: { es: "Asegúrate de que ambos arreglos tengan los mismos elementos (sin duplicados).", en: "Ensure both arrays have the same elements (no duplicates)." }
    },

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
             "We build the tree by splitting with preorder + inorder."), A.fn, null);
      for (const ev of events) {
        created.add(ev.id);
        state[ev.id] = "current";
        snap(L(`Raíz ${ev.val} (preorder). En inorder está en la posición ${ev.k}: a su izquierda el subárbol izquierdo, a la derecha el derecho.`,
               `Root ${ev.val} (preorder). In inorder it's at position ${ev.k}: to its left the left subtree, to its right the right one.`),
             [A.raiz, A.busca], ev);
        state[ev.id] = "done";
      }
      snap(L("Árbol reconstruido por completo.", "Tree fully reconstructed."), A.retorna, null);
      return steps;
    },
  };
})();
