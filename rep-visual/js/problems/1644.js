/* 1644. LCA II — como 236 pero p o q pueden no existir: hay que confirmarlos. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion lcaII(root, p, q):",
        "  encontrados ← 0",
        "  res ← dfs(root)",
        "  retornar (encontrados == 2) ? res : nulo",
        "",
        "funcion dfs(nodo):",
        "  si nodo es nulo: retornar nulo",
        "  izq ← dfs(nodo.izq);  der ← dfs(nodo.der)",
        "  mid ← (nodo == p o nodo == q)",
        "  si mid: encontrados += 1",
        "  si mid + (izq≠nulo) + (der≠nulo) ≥ 2: retornar nodo",
        "  retornar izq ó der ó (mid ? nodo : nulo)",
      ],
      en: [
        "function lcaII(root, p, q):",
        "  found ← 0",
        "  res ← dfs(root)",
        "  return (found == 2) ? res : null",
        "",
        "function dfs(node):",
        "  if node is null: return null",
        "  left ← dfs(node.left);  right ← dfs(node.right)",
        "  mid ← (node == p or node == q)",
        "  if mid: found += 1",
        "  if mid + (left≠null) + (right≠null) ≥ 2: return node",
        "  return left or right or (mid ? node : null)",
      ],
    },
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
             `We search for ${input.p} and ${input.q}. We traverse the WHOLE tree to confirm them.`), 1);
      function dfs(nd) {
        if (!nd) return null;
        if (state[nd.id] !== "target") state[nd.id] = "current";
        snap(L(`Visitamos ${nd.val}.`, `Visit ${nd.val}.`), 7);
        const izq = dfs(nd.left);
        const der = dfs(nd.right);
        const mid = nd.val === input.p || nd.val === input.q;
        if (mid) { encontrados++; snap(L(`${nd.val} es uno de los buscados. encontrados = ${encontrados}.`,
                                        `${nd.val} is one of the sought. found = ${encontrados}.`), [8, 9]); }
        if ((mid ? 1 : 0) + (izq ? 1 : 0) + (der ? 1 : 0) >= 2) {
          state[nd.id] = "path";
          snap(L(`${nd.val} junta dos señales → candidato a LCA.`,
                 `${nd.val} joins two signals → LCA candidate.`), 10);
          return nd;
        }
        if (state[nd.id] === "current") state[nd.id] = "done";
        return izq || der || (mid ? nd : null);
      }
      const res = dfs(root);
      if (encontrados === 2 && res) { state[res.id] = "path"; snap(L(`Ambos presentes. LCA = <b>${res.val}</b>.`,
                                                                    `Both present. LCA = <b>${res.val}</b>.`), 3); }
      else snap(L(`Solo encontramos ${encontrados}/2. Respuesta <b>null</b>.`,
                 `We only found ${encontrados}/2. Answer <b>null</b>.`), 3);
      return steps;
    },
  };
})();
