/* 337. House Robber III — DP en árbol: cada nodo devuelve (robar, saltar). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["337"] = {
    num: 337, slug: "house-robber-iii", title: "House Robber III",
    difficulty: "M", block: "arboles", tags: ["DP en árbol", "DFS"],
    summary: L(
      "No se pueden robar dos casas conectadas (padre-hijo). Cada nodo devuelve dos valores: lo máximo si lo roba (entonces salta a los hijos) y si no lo roba (los hijos deciden libremente).",
      "You can't rob two connected houses (parent-child). Each node returns two values: the max if you rob it (then skip its children) and if you don't (children decide freely)."),
    legend: [
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("resuelto (robar, saltar)", "solved (rob, skip)") },
    ],
    code: {
      es: [
        "funcion rob(root):",
        "  (r, s) ← dfs(root)",
        "  retornar máx(r, s)",
        "",
        "funcion dfs(nodo):",
        "  si nodo es nulo: retornar (0, 0)",
        "  (ri, si) ← dfs(nodo.izq)",
        "  (rd, sd) ← dfs(nodo.der)",
        "  robar  ← nodo.val + si + sd    // hijos saltados",
        "  saltar ← máx(ri,si) + máx(rd,sd)",
        "  retornar (robar, saltar)",
      ],
      en: [
        "function rob(root):",
        "  (r, s) ← dfs(root)",
        "  return max(r, s)",
        "",
        "function dfs(node):",
        "  if node is null: return (0, 0)",
        "  (rl, sl) ← dfs(node.left)",
        "  (rr, sr) ← dfs(node.right)",
        "  rob  ← node.val + sl + sr    // children skipped",
        "  skip ← max(rl,sl) + max(rr,sr)",
        "  return (rob, skip)",
      ],
    },
    cases: [
      { name: L("[3,2,3,null,3,null,1] → 7", "[3,2,3,null,3,null,1] → 7"), input: [3,2,3,null,3,null,1] },
      { name: L("[3,4,5,1,3,null,1] → 9", "[3,4,5,1,3,null,1] → 9"), input: [3,4,5,1,3,null,1] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const layout = VIS.binaryLayout(root);
      const steps = [];
      const state = {};
      const etiqueta = {};

      const snap = (note, line) => steps.push({ line, note,
        tree: { label: L("Casas (etiqueta = robar/saltar)", "Houses (label = rob/skip)"), r: 20,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: etiqueta[n.id] != null ? n.label + "·" + etiqueta[n.id] : n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges } });

      snap(L("Postorden: resolvemos los hijos antes que el padre.",
             "Postorder: solve children before the parent."), 1);
      function dfs(nd) {
        if (!nd) return [0, 0];
        state[nd.id] = "current";
        snap(L(`Entramos a la casa ${nd.val}.`, `Enter house ${nd.val}.`), [4]);
        const [ri, si] = dfs(nd.left);
        const [rd, sd] = dfs(nd.right);
        const robar = nd.val + si + sd;
        const saltar = Math.max(ri, si) + Math.max(rd, sd);
        etiqueta[nd.id] = robar + "/" + saltar;
        state[nd.id] = "done";
        snap(L(`Casa ${nd.val}: robar=${robar} (salta hijos), saltar=${saltar}.`,
               `House ${nd.val}: rob=${robar} (skip children), skip=${saltar}.`), [8, 9]);
        return [robar, saltar];
      }
      const [r, s] = dfs(root);
      snap(L(`Botín máximo = máx(${r}, ${s}) = <b>${Math.max(r, s)}</b>.`,
             `Max loot = max(${r}, ${s}) = <b>${Math.max(r, s)}</b>.`), 2);
      return steps;
    },
  };
})();
