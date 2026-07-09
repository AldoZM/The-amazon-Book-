/* 103. Zigzag Level Order — BFS por niveles alternando la dirección. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion zigzagLevelOrder(root):",                  "function zigzagLevelOrder(root):"],
    ["vacio",     "  si root es nulo:",                               "  if root is null:"],
    ["vacioRet",  "    retornar una lista vacía",                     "    return an empty list"],
    ["resp0",     "  resp empieza vacía",                             "  ans starts empty"],
    ["cola0",     "  cola empieza con root dentro",                                  "  queue starts with root inside"],
    ["dir0",      "  izqADer pasa a ser verdadero",                            "  leftToRight becomes true"],
    ["mientras",  "  mientras la cola no está vacía:",                "  while the queue is not empty:"],
    ["tam",       "    tam pasa a ser cuántos nodos hay en la cola  // los de este nivel",
                  "    size becomes how many nodes are in the queue  // the ones of this level"],
    ["nivel0",    "    nivel empieza vacío",                          "    level starts empty"],
    ["repite",    "    repetir tam veces:",                           "    repeat size times:"],
    ["saca",      "      sacar el primero de la cola y llamarlo nodo",         "      take the first one out of the queue and call it node"],
    ["alFinal",   "      si izqADer:",                                "      if leftToRight:"],
    ["alFinalDo", "        agregar nodo.val al final de nivel",       "        add node.val at the end of level"],
    ["alInicio",  "      si no:",                                     "      else:"],
    ["alInicioDo","        agregar nodo.val al inicio de nivel",      "        add node.val at the start of level"],
    ["encola",    "      encolar los hijos de nodo, primero el izquierdo",
                  "      enqueue node's children, the left one first"],
    ["agrega",    "    agregar nivel al final de resp",               "    add level at the end of ans"],
    ["voltea",    "    izqADer pasa a ser lo contrario de izqADer  // el siguiente nivel va al revés",
                  "    leftToRight becomes the opposite of leftToRight  // next level goes the other way"],
    ["retorna",   "  retornar resp",                                  "  return ans"],
  ]);
  const A = C.L;

  P["103"] = {
    num: 103, slug: "zigzag-level-order", title: "Binary Tree Zigzag Level Order Traversal",
    difficulty: "M", block: "arboles", tags: ["BFS", "niveles"],
    summary: L(
      "Recorrido por niveles pero serpenteando: primer nivel de izquierda a derecha, el siguiente de derecha a izquierda, y así. BFS normal; solo invertimos el orden en los niveles impares.",
      "Level-order traversal but zigzagging: first level left-to-right, next right-to-left, and so on. Plain BFS; we just reverse the order on odd levels."),
    legend: [
      { cls: "frontier", label: L("en la cola", "in the queue") },
      { cls: "current", label: L("nodo actual", "current node") },
      { cls: "done", label: L("procesado", "processed") },
    ],
    code: C,
    cases: [
      { name: L("[3,9,20,null,null,15,7]", "[3,9,20,null,null,15,7]"), input: [3,9,20,null,null,15,7] },
      { name: L("[1,2,3,4,5,6,7]", "[1,2,3,4,5,6,7]"), input: [1,2,3,4,5,6,7] },
    ],

    build(input) {
      const root = VIS.treeFromArray(input);
      const steps = [];
      if (!root) { steps.push({ line: [A.vacio, A.vacioRet], note: L("Árbol vacío: [].", "Empty tree: [].") }); return steps; }
      const layout = VIS.binaryLayout(root);
      const state = {};
      const resp = [];

      const snap = (note, line, cola) => steps.push({ line, note,
        tree: { label: L("Árbol", "Tree"), r: 18,
          nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: state[n.id] || "" })),
          edges: layout.edges },
        queue: { label: L("Cola", "Queue"), arrows: true, items: cola.map((nd) => nd.val) },
        list: { label: L("Resultado", "Result"), items: resp.map((lv) => "[" + lv.join(",") + "]") } });

      let cola = [root]; state[root.id] = "frontier"; let izqADer = true;
      snap(L("Raíz a la cola. Empezamos de izquierda a derecha.",
             "Root into the queue. We start left-to-right."), [A.cola0, A.dir0], cola);
      while (cola.length) {
        const tam = cola.length; const nivel = [];
        snap(L(`Nivel con ${tam} nodo(s), dirección ${izqADer ? "→" : "←"}.`,
               `Level with ${tam} node(s), direction ${izqADer ? "→" : "←"}.`), [A.mientras, A.tam, A.nivel0], cola);
        for (let i = 0; i < tam; i++) {
          const nodo = cola.shift();
          state[nodo.id] = "current";
          if (izqADer) nivel.push(nodo.val); else nivel.unshift(nodo.val);
          snap(L(`Sacamos ${nodo.val}; lo ponemos ${izqADer ? "al final" : "al inicio"} del nivel.`,
                 `Pop ${nodo.val}; place it at the ${izqADer ? "end" : "start"} of the level.`),
               izqADer ? [A.saca, A.alFinal, A.alFinalDo] : [A.saca, A.alInicio, A.alInicioDo], cola);
          if (nodo.left) { cola.push(nodo.left); state[nodo.left.id] = "frontier"; }
          if (nodo.right) { cola.push(nodo.right); state[nodo.right.id] = "frontier"; }
          state[nodo.id] = "done";
        }
        resp.push(nivel);
        izqADer = !izqADer;
      }
      snap(L(`Recorrido zigzag: [${resp.map((lv) => "[" + lv.join(",") + "]").join(", ")}].`,
             `Zigzag traversal: [${resp.map((lv) => "[" + lv.join(",") + "]").join(", ")}].`), A.retorna, []);
      return steps;
    },
  };
})();
