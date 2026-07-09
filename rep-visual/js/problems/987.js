/* 987. Vertical Order Traversal — BFS asignando columnas y agrupando. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion verticalTraversal(root):",                     "function verticalTraversal(root):"],
    ["cola",      "  cola empieza con la terna (root, fila 0, columna 0) dentro", "  queue starts with the triple (root, row 0, column 0) inside"],
    ["mapa",      "  mapa guarda, para cada columna, una lista de pares (fila, valor)",
                  "  map holds, for each column, a list of pairs (row, value)"],
    ["mientras",  "  mientras la cola no esté vacía:",                    "  while the queue is not empty:"],
    ["saca",      "    sacar (nodo, fila, col) del frente de la cola",    "    take (node, row, col) from the front of the queue"],
    ["anota",     "    añadir el par (fila, valor de nodo) a mapa[col]",  "    add the pair (row, value of node) to map[col]"],
    ["hayIzq",    "    si nodo tiene hijo izquierdo:",                    "    if node has a left child:"],
    ["encolaIzq", "      encolar (hijo izquierdo, fila + 1, col - 1)",    "      enqueue (left child, row + 1, col - 1)"],
    ["hayDer",    "    si nodo tiene hijo derecho:",                      "    if node has a right child:"],
    ["encolaDer", "      encolar (hijo derecho, fila + 1, col + 1)",      "      enqueue (right child, row + 1, col + 1)"],
    ["porCol",    "  para cada columna, de la menor a la mayor:",         "  for each column, from smallest to largest:"],
    ["ordena",    "    ordenar su lista por fila y, si dos empatan, por valor",
                  "    sort its list by row and, if two tie, by value"],
    ["vuelca",    "    volcar los valores ya ordenados",                  "    dump the sorted values"],
    ["retorna",   "  retornar las columnas en orden",                     "  return the columns in order"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("[3,9,20,null,null,15,7]", "[3,9,20,null,null,15,7]"), input: [3,9,20,null,null,15,7] },
      { name: L("[1,2,3,4,5,6,7]", "[1,2,3,4,5,6,7]"), input: [1,2,3,4,5,6,7] },
    ],

    // Modo interactivo: escribe el árbol en la notación de LeetCode (por
    // niveles, con null para los huecos) y se dibuja mientras escribes.
    editor: VIS.treeEditor("[3,9,20,null,null,15,7]", {
      es: "Escribe el árbol y míralo recorrer por columnas, de izquierda a derecha. Luego pulsa Ejecutar.",
      en: "Type the tree and watch the column-by-column traversal, left to right. Then press Run.",
    }),

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: A.retorna, note: L("Árbol vacío: [].", "Empty tree: [].") }); return steps; }
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
      snap(L("Encolamos la raíz con fila 0, columna 0.", "Enqueue the root with row 0, column 0."), [A.cola, A.mapa], cola);
      while (cola.length) {
        const { node, fila, col } = cola.shift();
        state[node.id] = "current";
        (mapa[col] = mapa[col] || []).push([fila, node.val]);
        snap(L(`${node.val} va a la columna ${col} (fila ${fila}).`,
               `${node.val} goes to column ${col} (row ${fila}).`), [A.saca, A.anota], cola);
        if (node.left) cola.push({ node: node.left, fila: fila + 1, col: col - 1 });
        if (node.right) cola.push({ node: node.right, fila: fila + 1, col: col + 1 });
        state[node.id] = "done";
      }
      snap(L(`Columnas de izquierda a derecha: ${colList().join("  ")}.`,
             `Columns left to right: ${colList().join("  ")}.`), [A.porCol, A.ordena, A.vuelca, A.retorna], []);
      return steps;
    },
  };
})();
