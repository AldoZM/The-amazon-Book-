/* 297. Serialize and Deserialize Binary Tree — BFS a una cadena (y de vuelta). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion serialize(root):",                      "function serialize(root):"],
    ["esNulo",    "  si root es nulo:",                            "  if root is null:"],
    ["retMarca",  "    retornar \"#\"",                            "    return \"#\""],
    ["cola0",     "  cola empieza con root dentro",                               "  queue starts with root inside"],
    ["salida0",   "  salida empieza vacía",                        "  output starts empty"],
    ["mientras",  "  mientras la cola no esté vacía:",             "  while the queue is not empty:"],
    ["saca",      "    sacar el primero de la cola y llamarlo nodo",        "    take the first one out of the queue and call it node"],
    ["hijoNulo",  "    si nodo es nulo:",                          "    if node is null:"],
    ["marca",     "      añadir \"#\" a salida     // aquí no había hijo",
                  "      append \"#\" to output    // there was no child here"],
    ["continua",  "      continuar",                               "      continue"],
    ["anota",     "    añadir nodo.val a salida",                  "    append node.val to output"],
    ["encolaIzq", "    encolar nodo.izq",                          "    enqueue node.left"],
    ["encolaDer", "    encolar nodo.der",                          "    enqueue node.right"],
    ["retorna",   "  retornar salida unida por comas",             "  return output joined by commas"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("[1,2,3,null,null,4,5]", "[1,2,3,null,null,4,5]"), input: [1,2,3,null,null,4,5] },
      { name: L("[1,2,3]", "[1,2,3]"), input: [1,2,3] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) {
        steps.push({ line: [A.esNulo, A.retMarca],
          note: L("Árbol vacío → \"#\".", "Empty tree → \"#\".") });
        return steps;
      }
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
             "BFS: push the root. Null children are marked with '#'."), [A.cola0, A.salida0], cola);
      while (cola.length) {
        const nodo = cola.shift();
        if (!nodo) {
          salida.push("#");
          snap(L("Hijo nulo → añadimos '#'.", "Null child → append '#'."), [A.hijoNulo, A.marca], cola);
          continue;
        }
        state[nodo.id] = "current";
        salida.push(String(nodo.val));
        snap(L(`Serializamos ${nodo.val} y encolamos sus dos hijos.`,
               `Serialize ${nodo.val} and enqueue its two children.`), [A.anota, A.encolaIzq, A.encolaDer], cola);
        cola.push(nodo.left); cola.push(nodo.right);
        state[nodo.id] = "done";
      }
      snap(L(`Cadena final: <b>${salida.join(",")}</b>. Deserializar la lee en el mismo orden BFS.`,
             `Final string: <b>${salida.join(",")}</b>. Deserializing reads it in the same BFS order.`), A.retorna, []);
      return steps;
    },
  };
})();
