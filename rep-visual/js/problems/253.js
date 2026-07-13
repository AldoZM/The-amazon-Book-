/* 253. Meeting Rooms II — barrido con dos punteros sobre starts[] y ends[] ordenados por separado. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",         "funcion minMeetingRooms(intervals):",             "function minMeetingRooms(intervals):"],
    ["arreglos",   "  starts = inicio de cada reunión; ends = fin de cada reunión",
                   "  starts = each meeting's start; ends = each meeting's end"],
    ["ordena",     "  ordenar starts y ends por separado",             "  sort starts and ends independently"],
    ["contador0",  "  salasEnUso empieza en 0; maxSalas empieza en 0", "  roomsInUse starts at 0; maxRooms starts at 0"],
    ["punteros",   "  si empieza en 0 (puntero de starts); ei empieza en 0 (puntero de ends)",
                   "  si starts at 0 (starts pointer); ei starts at 0 (ends pointer)"],
    ["mientras",   "  mientras si < n:",                               "  while si < n:"],
    ["comparaSI",  "    si starts[si] < ends[ei]:                    // empieza antes de que la más próxima acabe",
                   "    if starts[si] < ends[ei]:                    // starts before the closest one ends"],
    ["incrementa", "      sumar 1 a salasEnUso; sumar 1 a si; maxSalas = mayor(maxSalas, salasEnUso)",
                   "      add 1 to roomsInUse; add 1 to si; maxRooms = larger(maxRooms, roomsInUse)"],
    ["sino",       "    si no:                                       // una sala se libera",
                   "    else:                                        // a room frees up"],
    ["decrementa", "      restar 1 a salasEnUso; sumar 1 a ei",       "      subtract 1 from roomsInUse; add 1 to ei"],
    ["retorna",    "  retornar maxSalas",                             "  return maxRooms"],
  ]);
  const A = C.L;

  P["253"] = {
    num: 253, slug: "meeting-rooms-ii", title: "Meeting Rooms II",
    difficulty: "M", block: "intervalos", tags: ["barrido", "dos punteros"],
    summary: L(
      "Número mínimo de salas para todas las reuniones. Separamos inicios y fines, los ordenamos por separado, y barremos el tiempo: cada inicio antes del fin más próximo pide una sala nueva; cada fin libera una.",
      "Minimum number of rooms for all meetings. We split starts and ends, sort them separately, and sweep through time: every start before the closest end needs a new room; every end frees one."),
    legend: [
      { cls: "hot", label: L("próxima en procesarse", "next to be processed") },
      { cls: "done", label: L("reunión ya terminada", "meeting already finished") },
    ],
    code: C,
    cases: [
      { name: L("[[0,30],[5,10],[15,20]] → 2", "[[0,30],[5,10],[15,20]] → 2"), input: [[0,30],[5,10],[15,20]] },
      { name: L("[[7,10],[2,4]] → 1", "[[7,10],[2,4]] → 1"), input: [[7,10],[2,4]] },
      { name: L("[[9,10],[4,9],[4,17]] → empate justo", "[[9,10],[4,9],[4,17]] → exact tie"), input: [[9,10],[4,9],[4,17]] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "intervals", type: "text", label: L("Reuniones [inicio,fin]:", "Meetings [start,end]:"), placeholder: L("ej. [[0,30],[5,10],[15,20]]", "ex. [[0,30],[5,10],[15,20]]") }
      ],
      initial() { return { intervals: "[[0,30],[5,10],[15,20]]" }; },
      parse(state) {
        const r = VIS.parse.intervalList(state.intervals, 12);
        if (!r.ok) return { ok: false, field: "intervals", error: r.error };
        for (const iv of r.intervals) {
          if (iv[0] > iv[1]) return { ok: false, field: "intervals", error: L("El inicio no puede ser mayor que el fin.", "The start cannot be greater than the end.") };
        }
        return { ok: true, input: r.intervals };
      },
      previewSpec(input) {
        return { type: "array", label: L("Reuniones", "Meetings"), items: input.map((iv) => ({ v: "[" + iv[0] + "," + iv[1] + "]", cls: "" })), indices: true };
      },
      hint: L("Cada fila es [inicio, fin] de una reunión.", "Each row is a meeting's [start, end]."),
    },

    build(input) {
      const meetings = (input || []).map((iv) => iv.slice());
      const n = meetings.length;
      const sortedByStart = meetings.slice().sort((a, b) => a[0] - b[0]);
      const starts = meetings.map((m) => m[0]).sort((a, b) => a - b);
      const ends = meetings.map((m) => m[1]).sort((a, b) => a - b);
      const steps = [];
      let salasEnUso = 0, maxSalas = 0, si = 0, ei = 0;

      const snap = (note, line) => {
        const acabadas = si - salasEnUso;
        const items = sortedByStart.map((m, i) => {
          let cls = "";
          if (i < acabadas) cls = "done";
          else if (i === si) cls = "hot";
          return { v: "[" + m[0] + "," + m[1] + "]", cls };
        });
        steps.push({
          line, note,
          array: { label: L("Reuniones (orden de inicio)", "Meetings (start order)"), items, indices: true },
          list: { label: L("Fin de reuniones activas", "Active meeting ends"), items: ends.slice(ei, ei + salasEnUso).map((v) => ({ v, cls: "" })) },
          vars: [
            { k: L("salas en uso", "rooms in use"), v: salasEnUso, cls: "" },
            { k: L("máximo de salas", "max rooms"), v: maxSalas, cls: "result" },
          ],
        });
      };

      if (n === 0) {
        snap(L("No hay reuniones: 0 salas.", "No meetings: 0 rooms."), A.fn);
        return steps;
      }

      snap(L("Separamos inicios y fines, y los ordenamos por separado.",
             "Split starts and ends, and sort them independently."), [A.fn, A.arreglos, A.ordena, A.contador0, A.punteros]);

      while (si < n) {
        if (starts[si] < ends[ei]) {
          salasEnUso++;
          si++;
          maxSalas = Math.max(maxSalas, salasEnUso);
          snap(L(`Inicio ${starts[si - 1]} < fin más próximo ${ends[ei]}: se ocupa una sala más (${salasEnUso}).`,
                 `Start ${starts[si - 1]} < closest end ${ends[ei]}: one more room in use (${salasEnUso}).`),
               [A.mientras, A.comparaSI, A.incrementa]);
        } else {
          salasEnUso--;
          ei++;
          snap(L(`Fin ${ends[ei - 1]} llega antes (o justo a tiempo): se libera una sala (${salasEnUso} en uso).`,
                 `End ${ends[ei - 1]} comes first (or right on time): a room frees up (${salasEnUso} in use).`),
               [A.mientras, A.sino, A.decrementa]);
        }
      }

      snap(L(`Número mínimo de salas: <b>${maxSalas}</b>.`, `Minimum number of rooms: <b>${maxSalas}</b>.`), A.retorna);
      return steps;
    },
  };
})();
