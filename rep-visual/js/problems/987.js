/* 987. Vertical Order Traversal — BFS asignando columnas y agrupando. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["987"] = {
    num: 987, slug: "vertical-order", title: "Vertical Order Traversal of a Binary Tree",
    difficulty: "H", block: "arboles", tags: ["BFS", "coordenadas"],
    summary: L(
      "Agrupar nodos por columna (izquierda resta 1, derecha suma 1). Dentro de cada columna se ordena por fila y, si empatan, por valor. BFS asignando (fila, columna) a cada nodo.",
      "Group nodes by column (left subtracts 1, right adds 1). Within each column sort by row and, on ties, by value. BFS assigning (row, column) to each node."),
    legend: [
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("asignado", "assigned") },
    ],
    code: {
      es: [
        "funcion verticalOrder(root):",
        "  cola ← [(root, fila=0, col=0)]",
        "  mapa[col] ← lista de (fila, valor)",
        "  mientras cola no vacía:",
        "    (nodo, fila, col) ← sacar",
        "    mapa[col] += (fila, nodo.val)",
        "    encolar (izq, fila+1, col-1)",
        "    encolar (der, fila+1, col+1)",
        "  por cada col (de menor a mayor):",
        "    ordenar por (fila, valor) y volcar",
        "  retornar columnas en orden",
      ],
      en: [
        "function verticalOrder(root):",
        "  queue ← [(root, row=0, col=0)]",
        "  map[col] ← list of (row, value)",
        "  while queue not empty:",
        "    (node, row, col) ← pop",
        "    map[col] += (row, node.val)",
        "    enqueue (left, row+1, col-1)",
        "    enqueue (right, row+1, col+1)",
        "  for each col (low to high):",
        "    sort by (row, value) and dump",
        "  return columns in order",
      ],
    },
    cases: [
      { name: L("[3,9,20,null,null,15,7]", "[3,9,20,null,null,15,7]"), input: [3,9,20,null,null,15,7] },
      { name: L("[1,2,3,4,5,6,7]", "[1,2,3,4,5,6,7]"), input: [1,2,3,4,5,6,7] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: 1, note: L("Árbol vacío: [].", "Empty tree: [].") }); return steps; }
      const layout = VIS.binaryLayout(root);
      const state = {};
      const mapa = {};

      const colList = () => Object.keys(mapa).map(Number).sort((a, b) => a - b).map((c) => {
        const arr = mapa[c].slice().sort((x, y) => x[0] - y[0] || x[1] - y[1]).map((p) => p[1]);
        return "c" + c + ":[" + arr.join(",") + "]";
      });
      const snap = (note, line, cola) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        queue: { label: L("Cola (nodo, fila, col)", "Queue (node, row, col)"), arrows: true, items: cola.map((x) => x.node.val + "@" + x.fila + "," + x.col) },
        list: { label: L("Columnas", "Columns"), items: colList() } });

      const cola = [{ node: root, fila: 0, col: 0 }];
      snap(L("Encolamos la raíz con fila 0, columna 0.", "Enqueue the root with row 0, column 0."), [1, 2], cola);
      while (cola.length) {
        const { node, fila, col } = cola.shift();
        state[node.id] = "current";
        (mapa[col] = mapa[col] || []).push([fila, node.val]);
        snap(L(`${node.val} va a la columna ${col} (fila ${fila}).`,
               `${node.val} goes to column ${col} (row ${fila}).`), 5, cola);
        if (node.left) cola.push({ node: node.left, fila: fila + 1, col: col - 1 });
        if (node.right) cola.push({ node: node.right, fila: fila + 1, col: col + 1 });
        state[node.id] = "done";
      }
      snap(L(`Columnas de izquierda a derecha: ${colList().join("  ")}.`,
             `Columns left to right: ${colList().join("  ")}.`), [9, 10], []);
      return steps;
    },
  };
})();
