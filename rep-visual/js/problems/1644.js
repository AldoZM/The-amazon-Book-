/* 1644. LCA II — como 236 pero p o q pueden no existir: hay que confirmarlos. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",         "funcion lcaII(root, p, q):",                    "function lcaII(root, p, q):"],
    ["cero",       "  encontrados empieza en 0",                             "  found starts at 0"],
    ["llama",      "  res pasa a ser dfs(root)",                             "  res becomes dfs(root)"],
    ["ambos",      "  si encontrados = 2:",                         "  if found = 2:"],
    ["retRes",     "    retornar res",                              "    return res"],
    ["retNulo",    "  retornar nulo        // faltaba p, q, o los dos",
                   "  return null          // p, q, or both were missing"],
    ["",           "",                                              ""],
    ["dfsFn",      "funcion dfs(nodo):",                            "function dfs(node):"],
    ["esNulo",     "  si nodo es nulo:",                            "  if node is null:"],
    ["nuloRet",    "    retornar nulo",                             "    return null"],
    ["bajaIzq",    "  izq pasa a ser dfs(nodo.izq)",                         "  left becomes dfs(node.left)"],
    ["bajaDer",    "  der pasa a ser dfs(nodo.der)",                         "  right becomes dfs(node.right)"],
    ["esBuscado",  "  buscado pasa a ser nodo es p o nodo es q",             "  sought becomes node is p or node is q"],
    ["siBuscado",  "  si buscado:",                                 "  if sought:"],
    ["cuenta",     "    sumar 1 a encontrados",             "    add 1 to found"],
    ["senales",    "  señales pasa a ser cuántas de estas tres se cumplen: buscado, izq no es nulo, der no es nulo",
                   "  signals becomes how many of these three hold: sought, left is not null, right is not null"],
    ["dos",        "  si señales es 2 o más:",                      "  if signals is 2 or more:"],
    ["retNodo",    "    retornar nodo      // aquí se juntan las dos ramas",
                   "    return node        // the two branches meet here"],
    ["hayIzq",     "  si izq no es nulo:",                          "  if left is not null:"],
    ["retIzq",     "    retornar izq",                              "    return left"],
    ["hayDer",     "  si der no es nulo:",                          "  if der is not null:"],
    ["retDer",     "    retornar der",                              "    return right"],
    ["siBuscado2", "  si buscado:",                                 "  if sought:"],
    ["retNodo2",   "    retornar nodo",                             "    return node"],
    ["nada",       "  retornar nulo",                               "  return null"],
  ]);
  const A = C.L;

  P["1644"] = {
    num: 1644, slug: "lca-ii", title: "Lowest Common Ancestor II",
    difficulty: "M", block: "arboles", tags: ["DFS", "recursión"],
    summary: L(
      "Igual que el LCA clásico, pero p o q podrían NO estar en el árbol. Recorremos completo, contamos cuántos de los dos aparecen, y solo devolvemos el LCA si encontramos a AMBOS.",
      "Like the classic LCA, but p or q might NOT be in the tree. We traverse the whole tree, count how many of the two appear, and only return the LCA if we found BOTH."),
    legend: [
      { cls: "target", label: L("p y q buscados", "p and q sought") },
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("explorado", "explored") },
      { cls: "path", label: "LCA" },
    ],
    code: C,
    cases: [
      { name: L("p=5, q=4 (ambos) → 5", "p=5, q=4 (both) → 5"), input: { tree: [3,5,1,6,2,0,8,null,null,7,4], p: 5, q: 4 } },
      { name: L("q=99 no existe → null", "q=99 missing → null"), input: { tree: [3,5,1,6,2,0,8], p: 5, q: 99 } },
    ],

    build(input) {
      const root = VIS.treeFromArray(input.tree);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      let encontrados = 0;
      layout.nodes.forEach((n) => { if (n.label === input.p || n.label === input.q) state[n.id] = "target"; });

      const snap = (note, line) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        vars: [{ k: L("encontrados", "found"), v: encontrados + "/2", cls: "result" }] });

      snap(L(`Buscamos ${input.p} y ${input.q}. Recorremos TODO el árbol para confirmarlos.`,
             `We search for ${input.p} and ${input.q}. We traverse the WHOLE tree to confirm them.`),
           [A.fn, A.cero, A.llama]);
      function dfs(nd) {
        if (!nd) return null;
        if (state[nd.id] !== "target") state[nd.id] = "current";
        snap(L(`Visitamos ${nd.val}.`, `Visit ${nd.val}.`), A.dfsFn);
        const izq = dfs(nd.left);
        const der = dfs(nd.right);
        const mid = nd.val === input.p || nd.val === input.q;
        if (mid) { encontrados++; snap(L(`${nd.val} es uno de los buscados. encontrados = ${encontrados}.`,
                                        `${nd.val} is one of the sought. found = ${encontrados}.`),
                                      [A.esBuscado, A.siBuscado, A.cuenta]); }
        if ((mid ? 1 : 0) + (izq ? 1 : 0) + (der ? 1 : 0) >= 2) {
          state[nd.id] = "path";
          snap(L(`${nd.val} junta dos señales → candidato a LCA.`,
                 `${nd.val} joins two signals → LCA candidate.`), [A.senales, A.dos, A.retNodo]);
          return nd;
        }
        if (state[nd.id] === "current") state[nd.id] = "done";
        return izq || der || (mid ? nd : null);
      }
      const res = dfs(root);
      if (encontrados === 2 && res) { state[res.id] = "path"; snap(L(`Ambos presentes. LCA = <b>${res.val}</b>.`,
                                                                    `Both present. LCA = <b>${res.val}</b>.`), [A.ambos, A.retRes]); }
      else snap(L(`Solo encontramos ${encontrados}/2. Respuesta <b>null</b>.`,
                 `We only found ${encontrados}/2. Answer <b>null</b>.`), [A.ambos, A.retNulo]);
      return steps;
    },
  };
})();
