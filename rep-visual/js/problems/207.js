/* 207. Course Schedule — orden topológico (Kahn / BFS) y detección de ciclo. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["207"] = {
    num: 207, slug: "course-schedule", title: "Course Schedule",
    difficulty: "M", block: "grafos", tags: ["orden topológico", "BFS", "ciclo"],
    summary: L(
      "¿Se pueden tomar todos los cursos respetando los prerrequisitos? Equivale a: ¿el grafo dirigido no tiene ciclos? Se resuelve con Kahn (grados de entrada).",
      "Can you take all courses respecting prerequisites? Equivalent to: does the directed graph have no cycles? Solved with Kahn (in-degrees)."),
    legend: [
      { cls: "frontier", label: L("grado 0 (en la cola)", "in-degree 0 (in queue)") },
      { cls: "current", label: L("procesando", "processing") },
      { cls: "done", label: L("ya ordenado", "ordered") },
    ],
    code: {
      es: [
        "funcion canFinish(n, prereqs):",
        "  construir grafo; grado[i] = # prerrequisitos",
        "  cola ← cursos con grado 0",
        "  procesados ← 0",
        "  mientras cola no vacía:",
        "    curso ← sacar de la cola",
        "    procesados ← procesados + 1",
        "    para cada 'siguiente' que depende de curso:",
        "      grado[siguiente] -= 1",
        "      si grado[siguiente] == 0: meter en la cola",
        "  retornar procesados == n   // sin ciclo",
      ],
      en: [
        "function canFinish(n, prereqs):",
        "  build graph; degree[i] = # prerequisites",
        "  queue ← courses with degree 0",
        "  processed ← 0",
        "  while queue not empty:",
        "    course ← pop from queue",
        "    processed ← processed + 1",
        "    for each 'next' that depends on course:",
        "      degree[next] -= 1",
        "      if degree[next] == 0: push into queue",
        "  return processed == n   // no cycle",
      ],
    },
    cases: [
      { name: L("Sin ciclo (4 cursos)", "No cycle (4 courses)"), input: { n: 4, prereqs: [[1,0],[2,0],[3,1],[3,2]] } },
      { name: L("Con ciclo (falso)", "With cycle (false)"), input: { n: 3, prereqs: [[0,1],[1,2],[2,0]] } },
      { name: L("Cadena simple", "Simple chain"), input: { n: 3, prereqs: [[1,0],[2,1]] } },
    ],

    build(input) {
      const n = input.n, prereqs = input.prereqs;
      const adj = Array.from({ length: n }, () => []);
      const grado = new Array(n).fill(0);
      for (const [a, b] of prereqs) { adj[b].push(a); grado[a]++; }

      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const steps = [];
      const q = [];
      const state = new Array(n).fill("base");
      let procesados = 0;

      const graphSpec = () => ({
        label: L("Cursos (arista b→a: b antes que a)", "Courses (edge b→a: b before a)"), r: 20,
        nodes: Array.from({ length: n }, (_, i) => ({
          id: i, label: i, x: pos[i][0], y: pos[i][1],
          cls: state[i] === "base" ? "" : state[i],
        })),
        edges: prereqs.map(([a, b]) => ({ from: b, to: a, directed: true })),
      });
      const snap = (note, line) => {
        steps.push({ line, note, graph: graphSpec(),
          queue: { label: L("Cola (grado 0)", "Queue (degree 0)"), arrows: true, items: q.slice() },
          vars: [{ k: L("grados", "degrees"), v: "[" + grado.join(",") + "]" },
                 { k: L("procesados", "processed"), v: procesados + "/" + n, cls: "result" }] });
      };

      snap(L("Contamos el grado de entrada (prerrequisitos) de cada curso.",
             "Count each course's in-degree (prerequisites)."), [1]);
      for (let i = 0; i < n; i++) if (grado[i] === 0) { q.push(i); state[i] = "frontier"; }
      snap(L(`Cursos sin prerrequisitos entran a la cola: [${q.join(", ")}].`,
             `Courses with no prerequisites enter the queue: [${q.join(", ")}].`), 2);

      while (q.length) {
        const curso = q.shift();
        state[curso] = "current";
        procesados++;
        snap(L(`Tomamos el curso ${curso}. procesados = ${procesados}.`,
               `Take course ${curso}. processed = ${procesados}.`), [5, 6]);
        for (const sig of adj[curso]) {
          grado[sig]--;
          if (grado[sig] === 0) { q.push(sig); state[sig] = "frontier";
            snap(L(`El curso ${sig} se queda sin prerrequisitos → a la cola.`,
                   `Course ${sig} has no prerequisites left → into the queue.`), [8, 9]);
          } else {
            snap(L(`Bajamos el grado del curso ${sig} a ${grado[sig]}.`,
                   `Lower course ${sig}'s degree to ${grado[sig]}.`), 8);
          }
        }
        state[curso] = "done";
      }

      const ok = procesados === n;
      snap(ok
        ? L(`Procesamos los ${n} cursos: no hay ciclo. Respuesta <b>verdadero</b>.`,
            `We processed all ${n} courses: no cycle. Answer <b>true</b>.`)
        : L(`Solo ${procesados}/${n}: quedó un ciclo (nadie llegó a grado 0). Respuesta <b>falso</b>.`,
            `Only ${procesados}/${n}: a cycle remains (nobody reached degree 0). Answer <b>false</b>.`),
        10);
      return steps;
    },
  };
})();
