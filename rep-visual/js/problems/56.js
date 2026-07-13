/* 56. Merge Intervals — ordenar por inicio y fusionar en una sola pasada. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion merge(intervals):",                       "function merge(intervals):"],
    ["ordenar",   "  ordenar intervals por su inicio",                "  sort intervals by their start"],
    ["resultado0","  resultado empieza vacío",                        "  result starts empty"],
    ["porCada",   "  para cada intervalo iv en intervals (ya ordenados):",
                  "  for each interval iv in intervals (already sorted):"],
    ["prueba",    "    si resultado está vacío o el fin del último grupo < iv.inicio:",
                  "    if result is empty or the last group's end < iv.start:"],
    ["abre",      "      agregar iv como grupo nuevo a resultado    // no se solapan",
                  "      add iv as a new group to result            // they don't overlap"],
    ["sino",      "    si no:                                       // se solapan o se tocan",
                  "    else:                                        // they overlap or touch"],
    ["extiende",  "      el fin del último grupo pasa a ser el mayor entre su fin y iv.fin",
                  "      the last group's end becomes the larger of its end and iv.end"],
    ["retorna",   "  retornar resultado",                            "  return result"],
  ]);
  const A = C.L;

  P["56"] = {
    num: 56, slug: "merge-intervals", title: "Merge Intervals",
    difficulty: "M", block: "intervalos", tags: ["ordenamiento", "barrido"],
    summary: L(
      "Fusiona todos los intervalos que se solapan (o se tocan). Ordenar por inicio permite resolverlo en una sola pasada, comparando cada intervalo solo contra el ÚLTIMO grupo abierto.",
      "Merge every interval that overlaps (or touches). Sorting by start lets us solve it in a single pass, comparing each interval only against the LAST open group."),
    legend: [
      { cls: "hot", label: L("actual / grupo abierto", "current / open group") },
      { cls: "done", label: L("ya fusionado / grupo cerrado", "already merged / closed group") },
    ],
    code: C,
    cases: [
      { name: L("[[1,3],[2,6],[8,10],[15,18]] → 3 grupos", "[[1,3],[2,6],[8,10],[15,18]] → 3 groups"), input: [[1,3],[2,6],[8,10],[15,18]] },
      { name: L("[[1,4],[4,5]] → se tocan", "[[1,4],[4,5]] → they touch"), input: [[1,4],[4,5]] },
      { name: L("[[2,3],[1,5]] → desordenado", "[[2,3],[1,5]] → unsorted"), input: [[2,3],[1,5]] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "intervals", type: "text", label: L("Intervalos:", "Intervals:"), placeholder: L("ej. [[1,3],[2,6],[8,10],[15,18]]", "ex. [[1,3],[2,6],[8,10],[15,18]]") }
      ],
      initial() { return { intervals: "[[1,3],[2,6],[8,10],[15,18]]" }; },
      parse(state) {
        const r = VIS.parse.intervalList(state.intervals, 12);
        if (!r.ok) return { ok: false, field: "intervals", error: r.error };
        for (const iv of r.intervals) {
          if (iv[0] > iv[1]) return { ok: false, field: "intervals", error: L("El inicio no puede ser mayor que el fin.", "The start cannot be greater than the end.") };
        }
        return { ok: true, input: r.intervals };
      },
      previewSpec(input) {
        return { type: "array", label: L("Intervalos", "Intervals"), items: input.map((iv) => ({ v: "[" + iv[0] + "," + iv[1] + "]", cls: "" })), indices: true };
      },
      hint: L("Cada fila es [inicio, fin]. No hace falta ordenarlos: el algoritmo lo hace.", "Each row is [start, end]. No need to sort them: the algorithm does it."),
    },

    build(input) {
      const sorted = (input || []).map((iv) => iv.slice()).sort((a, b) => a[0] - b[0]);
      const n = sorted.length;
      const disp = sorted.map((iv) => ({ v: "[" + iv[0] + "," + iv[1] + "]", cls: "" }));
      const steps = [];

      const snap = (note, line) => steps.push({
        line, note,
        array: { label: L("Intervalos (ordenados por inicio)", "Intervals (sorted by start)"),
          items: disp.map((d) => ({ v: d.v, cls: d.cls })), indices: true },
      });

      snap(L("Ordenamos los intervalos por su inicio. El resultado empieza vacío.",
             "Sort the intervals by their start. The result starts empty."), [A.fn, A.ordenar, A.resultado0]);

      if (n === 0) {
        snap(L("No hay intervalos: el resultado empieza (y se queda) vacío.",
               "No intervals: the result starts (and stays) empty."), A.resultado0);
        snap(L("Retornamos <b>[]</b>.", "Return <b>[]</b>."), A.retorna);
        return steps;
      }

      const result = [];
      let openIdx = -1;

      for (let i = 0; i < n; i++) {
        const iv = sorted[i];
        disp[i].cls = "hot";
        snap(L(`Evaluamos ${disp[i].v} contra el grupo abierto.`, `Evaluate ${disp[i].v} against the open group.`),
             [A.porCada, A.prueba]);

        if (result.length === 0 || result[result.length - 1][1] < iv[0]) {
          result.push([iv[0], iv[1]]);
          if (openIdx !== -1) disp[openIdx].cls = "done";
          openIdx = i;
          disp[i].cls = "hot";
          snap(L(`No se solapa con el grupo abierto: abrimos un grupo nuevo ${disp[i].v}.`,
                 `No overlap with the open group: open a new group ${disp[i].v}.`), A.abre);
        } else {
          const last = result[result.length - 1];
          last[1] = Math.max(last[1], iv[1]);
          disp[openIdx].v = "[" + last[0] + "," + last[1] + "]";
          disp[openIdx].cls = "hot";
          disp[i].cls = "done";
          snap(L(`Se solapa (o se toca): extendemos el grupo abierto a ${disp[openIdx].v}.`,
                 `Overlaps (or touches): extend the open group to ${disp[openIdx].v}.`), [A.sino, A.extiende]);
        }
      }
      if (openIdx !== -1) disp[openIdx].cls = "done";

      snap(L(`Resultado fusionado: <b>${result.map((iv) => "[" + iv[0] + "," + iv[1] + "]").join(", ")}</b>.`,
             `Merged result: <b>${result.map((iv) => "[" + iv[0] + "," + iv[1] + "]").join(", ")}</b>.`), A.retorna);
      return steps;
    },
  };
})();
