/* 621. Task Scheduler — max-heap de conteos + cola de enfriamiento. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion leastInterval(tasks, n):",                            "function leastInterval(tasks, n):"],
    ["freq",      "  freq empieza vacío   // mapa tarea -> cuántas veces aparece", "  freq starts empty    // map task -> how many times it appears"],
    ["heap",      "  heap empieza con los conteos de freq   // max-heap",          "  heap starts with the counts from freq   // max-heap"],
    ["cooldown",  "  enfriamiento empieza vacío   // cola FIFO (conteo, momento en que vuelve)",
                  "  cooldown starts empty   // FIFO queue (count, time it returns)"],
    ["tiempo0",   "  tiempo empieza en 0",                                        "  tiempo starts at 0"],
    ["mientras",  "  mientras heap o enfriamiento no estén vacíos:",              "  while heap or cooldown are not empty:"],
    ["avanza",    "    sumar 1 a tiempo",                                         "    add 1 to tiempo"],
    ["vuelve",    "    si el frente de enfriamiento puede volver ahora: devolverlo al heap",
                  "    if the front of cooldown can return now: push it back into heap"],
    ["ejecuta",   "    si heap no está vacío:",                                   "    if heap is not empty:"],
    ["resta",     "      sacar el conteo más alto y restarle 1",                  "      pop the highest count and subtract 1"],
    ["reencola",  "      si aún queda conteo > 0: mandarlo a enfriamiento (tiempo + n + 1)",
                  "      if count > 0 remains: send it to cooldown (tiempo + n + 1)"],
    ["idle",      "    // si heap estaba vacío aquí, esta unidad de tiempo fue idle",
                  "    // if heap was empty here, this time unit was idle"],
    ["retorna",   "  retornar tiempo",                                            "  return tiempo"],
  ]);
  const A = C.L;

  P["621"] = {
    num: 621, slug: "task-scheduler", title: "Task Scheduler",
    difficulty: "M", block: "heaps-topk", tags: ["heap", "max-heap", "cola", "greedy"],
    summary: L(
      "Unidades de tiempo mínimas para ejecutar todas las tareas respetando el enfriamiento: en cada instante se ejecuta la tarea con más conteo restante (max-heap) y las ya ejecutadas esperan en una cola de enfriamiento.",
      "Minimum time units to run all tasks respecting the cooldown: at each instant we run the task with the highest remaining count (max-heap), and just-run tasks wait in a cooldown queue."),
    legend: [
      { cls: "hot", label: L("tarea ejecutada este instante", "task run this instant") },
    ],
    code: C,
    cases: [
      { name: L("AAABBB, n=2 → 8", "AAABBB, n=2 → 8"), input: { tasks: ["A","A","A","B","B","B"], n: 2 } },
      { name: L("AAAA, n=2 → 10", "AAAA, n=2 → 10"), input: { tasks: ["A","A","A","A"], n: 2 } },
      { name: L("ABCD, n=10 → 4", "ABCD, n=10 → 4"), input: { tasks: ["A","B","C","D"], n: 10 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "tasks", type: "text", label: L("tareas (letras separadas por coma):", "tasks (comma-separated letters):"), placeholder: L("ej. A,A,A,B,B,B", "ex. A,A,A,B,B,B") },
        { id: "n", type: "text", label: L("n (enfriamiento):", "n (cooldown):"), placeholder: L("2", "2") },
      ],
      initial() { return { tasks: "A,A,A,B,B,B", n: "2" }; },
      parse(state) {
        const s = String(state.tasks || "").trim();
        if (!s) return { ok: false, field: "tasks", error: L("Escribe letras separadas por coma, ej: A,A,B.", "Type comma-separated letters, ex: A,A,B.") };
        const partes = s.split(",").map((t) => t.trim());
        if (partes.length > 20) return { ok: false, field: "tasks", error: L("Demasiadas tareas. Caben 20.", "Too many tasks. The limit is 20.") };
        for (const t of partes) {
          if (!/^[A-Za-z]$/.test(t)) return { ok: false, field: "tasks", error: L(`"${t}" no es una sola letra.`, `"${t}" is not a single letter.`) };
        }
        const n = parseInt(state.n, 10);
        if (Number.isNaN(n) || n < 0 || n > 20) return { ok: false, field: "n", error: L("n debe ser un número entre 0 y 20.", "n must be a number between 0 and 20.") };
        return { ok: true, input: { tasks: partes.map((t) => t.toUpperCase()), n } };
      },
      previewSpec(input) {
        return { type: "list", label: L("tareas", "tasks"), items: input.tasks.map((v) => ({ v, cls: "" })) };
      },
      hint: L("Ingresa tareas como letras separadas por coma, y n.", "Enter tasks as comma-separated letters, and n."),
    },

    build(input) {
      const tareas = input.tasks, n = input.n;
      const freq = new Map();
      for (const t of tareas) freq.set(t, (freq.get(t) || 0) + 1);

      const steps = [];
      steps.push({ note: L("Contamos cuántas veces aparece cada tarea.", "Count how many times each task appears."),
        line: A.freq,
        vars: Array.from(freq.entries()).map(([t, f]) => ({ k: t, v: f })) });

      // heap: [{ tarea, cuenta }], max-heap por cuenta.
      let heap = Array.from(freq.entries()).map(([tarea, cuenta]) => ({ tarea, cuenta }));
      heap.sort((a, b) => b.cuenta - a.cuenta);
      // cooldown: [{ tarea, cuenta, vuelve }]
      let cooldown = [];

      steps.push({ note: L("heap = conteos de freq (max-heap). enfriamiento vacío. tiempo = 0.",
                            "heap = freq counts (max-heap). cooldown empty. tiempo = 0."),
        line: [A.heap, A.cooldown, A.tiempo0],
        list: { label: L("Heap de tareas pendientes", "Pending tasks heap"),
          items: heap.map((h) => ({ v: `${h.tarea}:${h.cuenta}`, cls: "" })) },
        queue: { label: L("Enfriamiento", "Cooldown"), arrows: true, items: [] },
        vars: [{ k: L("tiempo", "time"), v: 0 }] });

      let tiempo = 0;
      while (heap.length || cooldown.length) {
        tiempo++;
        const emit = (note, line, hotTarea) => steps.push({ note, line,
          list: { label: L("Heap de tareas pendientes", "Pending tasks heap"),
            items: heap.map((h) => ({ v: `${h.tarea}:${h.cuenta}`, cls: h.tarea === hotTarea ? "hot" : "" })) },
          queue: { label: L("Enfriamiento", "Cooldown"), arrows: true,
            items: cooldown.map((c) => ({ v: `${c.tarea}:${c.cuenta}@${c.vuelve}` })) },
          vars: [{ k: L("tiempo", "time"), v: tiempo }] });

        emit(L(`tiempo = ${tiempo}.`, `tiempo = ${tiempo}.`), A.avanza);

        if (cooldown.length && cooldown[0].vuelve === tiempo) {
          const c = cooldown.shift();
          heap.push({ tarea: c.tarea, cuenta: c.cuenta });
          heap.sort((a, b) => b.cuenta - a.cuenta);
          emit(L(`${c.tarea} termina su enfriamiento y vuelve al heap.`, `${c.tarea} finishes cooldown and returns to the heap.`),
               A.vuelve, c.tarea);
        }

        if (heap.length) {
          heap.sort((a, b) => b.cuenta - a.cuenta);
          const top = heap.shift();
          top.cuenta--;
          emit(L(`Ejecutamos ${top.tarea} (quedan ${top.cuenta}).`, `Run ${top.tarea} (${top.cuenta} left).`),
               [A.ejecuta, A.resta], top.tarea);
          if (top.cuenta > 0) {
            cooldown.push({ tarea: top.tarea, cuenta: top.cuenta, vuelve: tiempo + n + 1 });
            emit(L(`${top.tarea} aún tiene ${top.cuenta}: va a enfriamiento hasta tiempo ${tiempo + n + 1}.`,
                   `${top.tarea} still has ${top.cuenta}: goes to cooldown until time ${tiempo + n + 1}.`),
                 A.reencola, top.tarea);
          }
        } else {
          emit(L(`Heap vacío en este instante: unidad de tiempo idle.`, `Heap empty at this instant: idle time unit.`),
               A.idle);
        }
      }

      steps.push({ note: L(`Todas las tareas ejecutadas. Tiempo total: <b>${tiempo}</b>.`,
                            `All tasks executed. Total time: <b>${tiempo}</b>.`),
        line: A.retorna,
        list: { label: L("Heap de tareas pendientes", "Pending tasks heap"), items: [] },
        queue: { label: L("Enfriamiento", "Cooldown"), arrows: true, items: [] },
        vars: [{ k: L("tiempo", "time"), v: tiempo }] });

      return steps;
    },
  };
})();
