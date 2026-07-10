/* 210. Course Schedule II — orden topológico devolviendo un orden válido. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion findOrder(n, prereqs):",                 "function findOrder(n, prereqs):"],
    ["construye", "  construir el grafo de dependencias",           "  build the dependency graph"],
    ["grados",    "  grado[c] pasa a ser cuántos prerrequisitos tiene el curso c",
                  "  degree[c] becomes how many prerequisites course c has"],
    ["cola0",     "  cola empieza con los cursos de grado 0 dentro",                "  queue starts with the degree-0 courses inside"],
    ["orden0",    "  orden empieza vacío",                          "  order starts empty"],
    ["mientras",  "  mientras la cola no esté vacía:",              "  while the queue is not empty:"],
    ["saca",      "    sacar el primero de la cola y llamarlo curso",        "    take the first one out of the queue and call it course"],
    ["anade",     "    añadir curso al final de orden",             "    append course to the end of order"],
    ["porSig",    "    para cada curso siguiente que dependa de curso:",
                  "    for each course next that depends on course:"],
    ["baja",      "      restar 1 a grado[siguiente]",  "      subtract 1 from degree[next]"],
    ["esCero",    "      si grado[siguiente] es 0:",                "      if degree[next] is 0:"],
    ["mete",      "        meter siguiente en la cola",             "        put next into the queue"],
    ["todos",     "  si orden tiene los n cursos:",                 "  if order has all n courses:"],
    ["retOrden",  "    retornar orden",                             "    return order"],
    ["siNo",      "  si no:                          // faltan cursos: había un ciclo",
                  "  else:                           // courses are missing: there was a cycle"],
    ["retVacio",  "    retornar la lista vacía",                    "    return the empty list"],
  ]);
  const A = C.L;

  P["210"] = {
    num: 210, slug: "course-schedule-ii", title: "Course Schedule II",
    difficulty: "M", block: "grafos", tags: ["orden topológico", "BFS"],
    summary: L(
      "Como Course Schedule, pero devolvemos un orden válido para tomar los cursos. Kahn: vamos sacando los de grado 0 y ese es el orden. Si sobran, hay ciclo → [].",
      "Like Course Schedule, but we return a valid order to take the courses. Kahn: we pop the degree-0 ones and that is the order. If some remain, there's a cycle → []."),
    legend: [
      { cls: "frontier", label: L("grado 0 (en la cola)", "degree 0 (in queue)") },
      { cls: "current", label: L("procesando", "processing") },
      { cls: "done", label: L("ya en el orden", "in the order") },
    ],
    code: C,
    cases: [
      { name: L("4 cursos", "4 courses"), input: { n: 4, prereqs: [[1,0],[2,0],[3,1],[3,2]] } },
      { name: L("Con ciclo → []", "With cycle → []"), input: { n: 2, prereqs: [[0,1],[1,0]] } },
    ],

    editor: VIS.graphEditor({
      id: 210,
      maxNodos: 15,
      directed: true,
      defaultInput: "[[1,0],[2,0],[3,1],[3,2]]",
      parser: VIS.parse.prereqList,
      hint: L("Ej: [[1,0]] (para el 1, toma el 0)", "Ex: [[1,0]] (to take 1, take 0)")
    }),

    build(input) {
      const n = input.n, prereqs = input.prereqs;
      const adj = Array.from({ length: n }, () => []);
      const grado = new Array(n).fill(0);
      for (const [a, b] of prereqs) { adj[b].push(a); grado[a]++; }
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const steps = [], q = [], orden = [];
      const state = new Array(n).fill("base");

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Cursos (b→a)", "Courses (b→a)"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges: prereqs.map(([a, b]) => ({ from: b, to: a, directed: true })) },
        queue: { label: L("Cola (grado 0)", "Queue (degree 0)"), arrows: true, items: q.slice() },
        list: { label: L("Orden", "Order"), items: orden.slice() },
        vars: [{ k: L("grados", "degrees"), v: "[" + grado.join(",") + "]" }] });

      snap(L("Calculamos grados de entrada.", "Compute in-degrees."), [A.construye, A.grados]);
      for (let i = 0; i < n; i++) if (grado[i] === 0) { q.push(i); state[i] = "frontier"; }
      snap(L(`A la cola los de grado 0: [${q.join(", ")}].`,
             `Degree-0 ones into the queue: [${q.join(", ")}].`), A.cola0);

      while (q.length) {
        const curso = q.shift();
        state[curso] = "current";
        orden.push(curso);
        snap(L(`Sacamos ${curso} y lo añadimos al orden.`,
               `Pop ${curso} and append it to the order.`), [A.saca, A.anade]);
        for (const sig of adj[curso]) {
          grado[sig]--;
          if (grado[sig] === 0) { q.push(sig); state[sig] = "frontier";
            snap(L(`${sig} llega a grado 0 → a la cola.`, `${sig} reaches degree 0 → into the queue.`), [A.baja, A.esCero, A.mete]); }
        }
        state[curso] = "done";
      }
      if (orden.length === n) snap(L(`Orden válido: [${orden.join(", ")}].`,
                                    `Valid order: [${orden.join(", ")}].`), [A.todos, A.retOrden]);
      else snap(L(`Solo ${orden.length}/${n}: hay ciclo. Respuesta [].`,
                 `Only ${orden.length}/${n}: there's a cycle. Answer [].`), [A.siNo, A.retVacio]);
      return steps;
    },
  };
})();
