/* 337. House Robber III — DP en árbol: cada nodo devuelve (robar, saltar). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",       "funcion rob(root):",                                "function rob(root):"],
    ["llamaDfs", "  (robar, saltar) pasa a ser dfs(root)",                     "  (rob, skip) becomes dfs(root)"],
    ["retMejor", "  retornar la mayor de robar y saltar",             "  return the larger of rob and skip"],
    ["",         "",                                                  ""],
    ["dfsFn",    "funcion dfs(nodo):",                                "function dfs(node):"],
    ["esNulo",   "  si nodo es nulo:",                                "  if node is null:"],
    ["retCeros", "    retornar (0, 0)          // sin casa no hay botín",
                 "    return (0, 0)            // no house, no loot"],
    ["bajaIzq",  "  (robarIzq, saltarIzq) pasa a ser dfs(nodo.izq)",           "  (robLeft, skipLeft) becomes dfs(node.left)"],
    ["bajaDer",  "  (robarDer, saltarDer) pasa a ser dfs(nodo.der)",           "  (robRight, skipRight) becomes dfs(node.right)"],
    ["robar",    "  robar pasa a ser nodo.val + saltarIzq + saltarDer  // robo aquí: los hijos se saltan",
                 "  rob becomes node.val + skipLeft + skipRight  // rob here: children are skipped"],
    ["mejorIzq", "  mejorIzq pasa a ser la mayor de robarIzq y saltarIzq",     "  bestLeft becomes the larger of robLeft and skipLeft"],
    ["mejorDer", "  mejorDer pasa a ser la mayor de robarDer y saltarDer",     "  bestRight becomes the larger of robRight and skipRight"],
    ["saltar",   "  saltar pasa a ser mejorIzq + mejorDer      // no robo aquí: los hijos deciden",
                 "  skip becomes bestLeft + bestRight          // don't rob here: children decide"],
    ["retorna",  "  retornar (robar, saltar)",                        "  return (rob, skip)"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("[3,2,3,null,3,null,1] → 7", "[3,2,3,null,3,null,1] → 7"), input: [3,2,3,null,3,null,1] },
      { name: L("[3,4,5,1,3,null,1] → 9", "[3,4,5,1,3,null,1] → 9"), input: [3,4,5,1,3,null,1] },
    ],

    // Modo interactivo: escribe el árbol en la notación de LeetCode (por
    // niveles, con null para los huecos) y se dibuja mientras escribes.
    editor: VIS.treeEditor("[3,2,3,null,3,null,1]", {
      es: "Escribe el árbol de casas y busca el botín máximo sin robar dos casas vecinas. Luego pulsa Ejecutar.",
      en: "Type the tree of houses and find the maximum loot without robbing two adjacent houses. Then press Run.",
    }),

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
             "Postorder: solve children before the parent."), A.llamaDfs);
      function dfs(nd) {
        if (!nd) return [0, 0];
        state[nd.id] = "current";
        snap(L(`Entramos a la casa ${nd.val}.`, `Enter house ${nd.val}.`), [A.dfsFn]);
        const [ri, si] = dfs(nd.left);
        const [rd, sd] = dfs(nd.right);
        const robar = nd.val + si + sd;
        const saltar = Math.max(ri, si) + Math.max(rd, sd);
        etiqueta[nd.id] = robar + "/" + saltar;
        state[nd.id] = "done";
        snap(L(`Casa ${nd.val}: robar=${robar} (salta hijos), saltar=${saltar}.`,
               `House ${nd.val}: rob=${robar} (skip children), skip=${saltar}.`),
             [A.robar, A.mejorIzq, A.mejorDer, A.saltar]);
        return [robar, saltar];
      }
      const [r, s] = dfs(root);
      snap(L(`Botín máximo = máx(${r}, ${s}) = <b>${Math.max(r, s)}</b>.`,
             `Max loot = max(${r}, ${s}) = <b>${Math.max(r, s)}</b>.`), A.retMejor);
      return steps;
    },
  };
})();
