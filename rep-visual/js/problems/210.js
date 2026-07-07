/* 210. Course Schedule II — orden topológico devolviendo un orden válido. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion findOrder(n, prereqs):",
        "  grado[i] = # prerrequisitos; construir grafo",
        "  cola ← cursos con grado 0",
        "  orden ← []",
        "  mientras cola no vacía:",
        "    curso ← sacar de la cola",
        "    orden.añadir(curso)",
        "    para cada 'siguiente' que depende de curso:",
        "      grado[siguiente] -= 1",
        "      si grado[siguiente] == 0: encolar",
        "  si tamaño(orden) == n: retornar orden",
        "  si no: retornar []   // hay ciclo",
      ],
      en: [
        "function findOrder(n, prereqs):",
        "  degree[i] = # prerequisites; build graph",
        "  queue ← courses with degree 0",
        "  order ← []",
        "  while queue not empty:",
        "    course ← pop from queue",
        "    order.append(course)",
        "    for each 'next' that depends on course:",
        "      degree[next] -= 1",
        "      if degree[next] == 0: enqueue",
        "  if size(order) == n: return order",
        "  else: return []   // there is a cycle",
      ],
    },
    cases: [
      { name: L("4 cursos", "4 courses"), input: { n: 4, prereqs: [[1,0],[2,0],[3,1],[3,2]] } },
      { name: L("Con ciclo → []", "With cycle → []"), input: { n: 2, prereqs: [[0,1],[1,0]] } },
    ],

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

      snap(L("Calculamos grados de entrada.", "Compute in-degrees."), 1);
      for (let i = 0; i < n; i++) if (grado[i] === 0) { q.push(i); state[i] = "frontier"; }
      snap(L(`A la cola los de grado 0: [${q.join(", ")}].`,
             `Degree-0 ones into the queue: [${q.join(", ")}].`), 2);

      while (q.length) {
        const curso = q.shift();
        state[curso] = "current";
        orden.push(curso);
        snap(L(`Sacamos ${curso} y lo añadimos al orden.`,
               `Pop ${curso} and append it to the order.`), [5, 6]);
        for (const sig of adj[curso]) {
          grado[sig]--;
          if (grado[sig] === 0) { q.push(sig); state[sig] = "frontier";
            snap(L(`${sig} llega a grado 0 → a la cola.`, `${sig} reaches degree 0 → into the queue.`), [8, 9]); }
        }
        state[curso] = "done";
      }
      if (orden.length === n) snap(L(`Orden válido: [${orden.join(", ")}].`,
                                    `Valid order: [${orden.join(", ")}].`), 10);
      else snap(L(`Solo ${orden.length}/${n}: hay ciclo. Respuesta [].`,
                 `Only ${orden.length}/${n}: there's a cycle. Answer [].`), 11);
      return steps;
    },
  };
})();
