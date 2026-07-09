/* 207. Course Schedule — orden topológico (Kahn / BFS) y detección de ciclo. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion canFinish(n, prereqs):",              "function canFinish(n, prereqs):"],
    ["construye", "  construir el grafo de dependencias",        "  build the dependency graph"],
    ["grados",    "  grado[c] pasa a ser cuántos prerrequisitos tiene el curso c",
                  "  degree[c] becomes how many prerequisites course c has"],
    ["cola0",     "  cola empieza con los cursos de grado 0 dentro",             "  queue starts with the degree-0 courses inside"],
    ["cuenta0",   "  procesados empieza en 0",                            "  processed starts at 0"],
    ["mientras",  "  mientras la cola no esté vacía:",           "  while the queue is not empty:"],
    ["saca",      "    sacar el primero de la cola y llamarlo curso",     "    take the first one out of the queue and call it course"],
    ["cuenta",    "    sumar 1 a procesados",             "    add 1 to processed"],
    ["porSig",    "    para cada curso siguiente que dependa de curso:",
                  "    for each course next that depends on course:"],
    ["baja",      "      restar 1 a grado[siguiente]",
                  "      subtract 1 from degree[next]"],
    ["esCero",    "      si grado[siguiente] es 0:",             "      if degree[next] is 0:"],
    ["mete",      "        meter siguiente en la cola",          "        put next into the queue"],
    ["retorna",   "  retornar procesados = n   // si faltan cursos, había un ciclo",
                  "  return processed = n      // if courses are missing, there was a cycle"],
  ]);
  const A = C.L;

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
    code: C,
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
             "Count each course's in-degree (prerequisites)."), [A.construye, A.grados]);
      for (let i = 0; i < n; i++) if (grado[i] === 0) { q.push(i); state[i] = "frontier"; }
      snap(L(`Cursos sin prerrequisitos entran a la cola: [${q.join(", ")}].`,
             `Courses with no prerequisites enter the queue: [${q.join(", ")}].`), A.cola0);

      while (q.length) {
        const curso = q.shift();
        state[curso] = "current";
        procesados++;
        snap(L(`Tomamos el curso ${curso}. procesados = ${procesados}.`,
               `Take course ${curso}. processed = ${procesados}.`), [A.saca, A.cuenta]);
        for (const sig of adj[curso]) {
          grado[sig]--;
          if (grado[sig] === 0) { q.push(sig); state[sig] = "frontier";
            snap(L(`El curso ${sig} se queda sin prerrequisitos → a la cola.`,
                   `Course ${sig} has no prerequisites left → into the queue.`), [A.baja, A.esCero, A.mete]);
          } else {
            snap(L(`Bajamos el grado del curso ${sig} a ${grado[sig]}.`,
                   `Lower course ${sig}'s degree to ${grado[sig]}.`), A.baja);
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
        A.retorna);
      return steps;
    },
  };
})();
