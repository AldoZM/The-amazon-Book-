/* 297. Serialize and Deserialize Binary Tree — BFS a una cadena (y de vuelta). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["297"] = {
    num: 297, slug: "serialize-deserialize", title: "Serialize and Deserialize Binary Tree",
    difficulty: "H", block: "arboles", tags: ["BFS", "diseño"],
    summary: L(
      "Convertir un árbol en texto y reconstruirlo. Con BFS recorremos por niveles, usando un símbolo ('#') para los hijos nulos; esa cadena guarda la forma exacta para deserializar igual.",
      "Turn a tree into text and rebuild it. With BFS we traverse level by level, using a symbol ('#') for null children; that string stores the exact shape to deserialize identically."),
    legend: [
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("serializado", "serialized") },
    ],
    code: {
      es: [
        "funcion serialize(root):",
        "  si root nulo: retornar \"#\"",
        "  cola ← [root];  salida ← []",
        "  mientras cola no vacía:",
        "    nodo ← sacar de la cola",
        "    si nodo es nulo: salida += \"#\"; seguir",
        "    salida += nodo.val",
        "    encolar nodo.izq;  encolar nodo.der",
        "  retornar unir(salida, \",\")",
      ],
      en: [
        "function serialize(root):",
        "  if root null: return \"#\"",
        "  queue ← [root];  output ← []",
        "  while queue not empty:",
        "    node ← pop from queue",
        "    if node is null: output += \"#\"; continue",
        "    output += node.val",
        "    enqueue node.left;  enqueue node.right",
        "  return join(output, \",\")",
      ],
    },
    cases: [
      { name: L("[1,2,3,null,null,4,5]", "[1,2,3,null,null,4,5]"), input: [1,2,3,null,null,4,5] },
      { name: L("[1,2,3]", "[1,2,3]"), input: [1,2,3] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: 1, note: L("Árbol vacío → \"#\".", "Empty tree → \"#\".") }); return steps; }
      const layout = VIS.binaryLayout(root);
      const state = {};
      const salida = [];

      const snap = (note, line, cola) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        queue: { label: L("Cola BFS", "BFS queue"), arrows: true, items: cola.map((nd) => (nd ? nd.val : "#")) },
        list: { label: L("Cadena", "String"), items: salida.slice() } });

      const cola = [root];
      snap(L("BFS: metemos la raíz. Los hijos nulos se marcan con '#'.",
             "BFS: push the root. Null children are marked with '#'."), [2], cola);
      while (cola.length) {
        const nodo = cola.shift();
        if (!nodo) { salida.push("#"); snap(L("Hijo nulo → añadimos '#'.", "Null child → append '#'."), 5, cola); continue; }
        state[nodo.id] = "current";
        salida.push(String(nodo.val));
        snap(L(`Serializamos ${nodo.val} y encolamos sus dos hijos.`,
               `Serialize ${nodo.val} and enqueue its two children.`), [6, 7], cola);
        cola.push(nodo.left); cola.push(nodo.right);
        state[nodo.id] = "done";
      }
      snap(L(`Cadena final: <b>${salida.join(",")}</b>. Deserializar la lee en el mismo orden BFS.`,
             `Final string: <b>${salida.join(",")}</b>. Deserializing reads it in the same BFS order.`), 8, []);
      return steps;
    },
  };
})();
