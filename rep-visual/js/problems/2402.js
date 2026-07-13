/* 2402. Meeting Rooms III — dos min-heaps: salas libres y salas ocupadas por hora de fin. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",          "funcion mostBooked(n, meetings):",                 "function mostBooked(n, meetings):"],
    ["ordena",      "  ordenar meetings por inicio",                    "  sort meetings by start"],
    ["libresInit",  "  libres = min-heap con todas las salas 0..n-1",   "  free = min-heap with all rooms 0..n-1"],
    ["ocupadasInit","  ocupadas = min-heap de (horaFin, sala), vacío",  "  busy = min-heap of (endTime, room), empty"],
    ["conteoInit",  "  conteo[sala] empieza en 0, para toda sala",      "  count[room] starts at 0, for every room"],
    ["porCada",     "  para cada (inicio, fin) en meetings (ya ordenados):",
                    "  for each (start, end) in meetings (already sorted):"],
    ["libera",      "    mientras ocupadas no esté vacío y su fin más próximo <= inicio:",
                    "    while busy is not empty and its closest end <= start:"],
    ["moverLibre",  "      mover esa sala de ocupadas a libres",        "      move that room from busy to free"],
    ["siLibres",    "    si libres no está vacío:",                     "    if free is not empty:"],
    ["tomaLibre",   "      sala = libres.pop()          // la de menor índice", "      room = free.pop()             // the smallest index"],
    ["ocupaFin",    "      ocupadas.push((fin, sala))",                 "      busy.push((end, room))"],
    ["sinoRetraso", "    si no:",                                       "    else:"],
    ["tomaOcupada", "      (horaLibre, sala) = ocupadas.pop()   // la que se libera antes",
                    "      (freeTime, room) = busy.pop()        // the one that frees first"],
    ["retrasaPush", "      ocupadas.push((horaLibre + (fin - inicio), sala))",
                    "      busy.push((freeTime + (end - start), room))"],
    ["suma",        "    sumar 1 a conteo[sala]",                       "    add 1 to count[room]"],
    ["retorna",     "  retornar la sala con mayor conteo (menor índice en empate)",
                    "  return the room with the largest count (smallest index on tie)"],
  ]);
  const A = C.L;

  P["2402"] = {
    num: 2402, slug: "meeting-rooms-iii", title: "Meeting Rooms III",
    difficulty: "H", block: "intervalos", tags: ["heap", "barrido"],
    summary: L(
      "n salas, reuniones procesadas por orden de inicio. Cada una toma la sala libre de menor índice; si no hay ninguna, se retrasa hasta que se libere la que termine antes (misma duración). Gana la sala con más reuniones.",
      "n rooms, meetings processed in start order. Each one takes the free room with the smallest index; if none is free, it's delayed until whichever room frees first (same duration). The room with the most meetings wins."),
    legend: [
      { cls: "hot", label: L("reunión en proceso", "meeting being processed") },
    ],
    code: C,
    cases: [
      { name: L("n=2, oficial → sala 0", "n=2, official → room 0"), input: { n: 2, meetings: [[0,10],[1,5],[2,7],[3,4]] } },
      { name: L("n=3, oficial → sala 1", "n=3, official → room 1"), input: { n: 3, meetings: [[1,20],[2,10],[3,5],[4,9],[6,8]] } },
      { name: L("n=1, una sola sala", "n=1, a single room"), input: { n: 1, meetings: [[0,5],[5,10]] } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "meetings", type: "text", label: L("Reuniones [inicio,fin]:", "Meetings [start,end]:"), placeholder: L("ej. [[0,10],[1,5],[2,7],[3,4]]", "ex. [[0,10],[1,5],[2,7],[3,4]]") },
        { id: "n", type: "text", label: L("Salas (n):", "Rooms (n):"), placeholder: L("2", "2") },
      ],
      initial() { return { meetings: "[[0,10],[1,5],[2,7],[3,4]]", n: "2" }; },
      parse(state) {
        const n = parseInt(state.n, 10);
        if (Number.isNaN(n) || n < 1 || n > 10) {
          return { ok: false, field: "n", error: L("n debe ser un número entre 1 y 10.", "n must be a number between 1 and 10.") };
        }
        const r = VIS.parse.intervalList(state.meetings, 12);
        if (!r.ok) return { ok: false, field: "meetings", error: r.error };
        for (const iv of r.intervals) {
          if (iv[0] >= iv[1]) return { ok: false, field: "meetings", error: L("El inicio debe ser menor que el fin.", "The start must be less than the end.") };
        }
        return { ok: true, input: { n, meetings: r.intervals } };
      },
      previewSpec(input) {
        return { type: "array", label: L("Reuniones", "Meetings"), items: input.meetings.map((iv) => ({ v: "[" + iv[0] + "," + iv[1] + "]", cls: "" })), indices: true };
      },
      hint: L("Las salas van de 0 a n-1.", "Rooms range from 0 to n-1."),
    },

    build(input) {
      const n = input.n;
      const meetings = (input.meetings || []).map((m) => m.slice())
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      let libres = Array.from({ length: n }, (_, i) => i);
      let ocupadas = []; // [horaFin, sala]
      const conteo = new Array(n).fill(0);
      const steps = [];

      const snap = (note, line, hotIdx) => {
        libres = libres.slice().sort((a, b) => a - b);
        const ocupadasOrd = ocupadas.slice().sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        steps.push({
          line, note,
          stage: [
            { type: "array", label: L("Reuniones (orden de inicio)", "Meetings (start order)"),
              items: meetings.map((m, i) => ({ v: "[" + m[0] + "," + m[1] + "]", cls: i === hotIdx ? "hot" : "" })), indices: true },
            { type: "list", label: L("Salas libres", "Free rooms"), items: libres.map((s) => ({ v: s, cls: "" })) },
            { type: "list", label: L("Salas ocupadas (fin:sala)", "Busy rooms (end:room)"), items: ocupadasOrd.map(([f, s]) => ({ v: f + ":" + s, cls: "" })) },
          ],
          vars: conteo.map((c, i) => ({ k: L("sala " + i, "room " + i), v: c, cls: "" })),
        });
      };

      snap(L("Ordenamos las reuniones por inicio. Todas las salas empiezan libres.",
             "Sort the meetings by start. All rooms begin free."), [A.fn, A.ordena, A.libresInit, A.ocupadasInit, A.conteoInit]);

      meetings.forEach((m, i) => {
        const [inicio, fin] = m;
        snap(L(`Procesamos la reunión [${inicio},${fin}].`, `Process meeting [${inicio},${fin}].`), A.porCada, i);

        while (ocupadas.length && Math.min(...ocupadas.map((o) => o[0])) <= inicio) {
          ocupadas.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
          const [horaFin, sala] = ocupadas.shift();
          libres.push(sala);
          snap(L(`La sala ${sala} ya terminó (fin ${horaFin} ≤ ${inicio}): queda libre.`,
                 `Room ${sala} already finished (end ${horaFin} ≤ ${inicio}): it becomes free.`), [A.libera, A.moverLibre], i);
        }

        if (libres.length) {
          libres.sort((a, b) => a - b);
          const sala = libres.shift();
          ocupadas.push([fin, sala]);
          conteo[sala]++;
          snap(L(`Hay sala libre: asignamos la sala ${sala} (nuevo fin ${fin}).`,
                 `A room is free: assign room ${sala} (new end ${fin}).`), [A.siLibres, A.tomaLibre, A.ocupaFin, A.suma], i);
        } else {
          ocupadas.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
          const [horaLibre, sala] = ocupadas.shift();
          const duracion = fin - inicio;
          ocupadas.push([horaLibre + duracion, sala]);
          conteo[sala]++;
          snap(L(`Ninguna sala libre: retrasamos hasta que se libere la sala ${sala} (nuevo fin ${horaLibre + duracion}).`,
                 `No room is free: delay until room ${sala} frees up (new end ${horaLibre + duracion}).`), [A.sinoRetraso, A.tomaOcupada, A.retrasaPush, A.suma], i);
        }
      });

      let mejor = 0;
      for (let i = 1; i < n; i++) if (conteo[i] > conteo[mejor]) mejor = i;
      const ocupadasOrd = ocupadas.slice().sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      steps.push({
        line: A.retorna,
        note: L(`Sala con más reuniones: <b>${mejor}</b> (conteo ${conteo[mejor]}).`,
                `Room with most meetings: <b>${mejor}</b> (count ${conteo[mejor]}).`),
        stage: [
          { type: "array", label: L("Reuniones (orden de inicio)", "Meetings (start order)"),
            items: meetings.map((m) => ({ v: "[" + m[0] + "," + m[1] + "]", cls: "" })), indices: true },
          { type: "list", label: L("Salas libres", "Free rooms"), items: libres.slice().sort((a, b) => a - b).map((s) => ({ v: s, cls: "" })) },
          { type: "list", label: L("Salas ocupadas (fin:sala)", "Busy rooms (end:room)"), items: ocupadasOrd.map(([f, s]) => ({ v: f + ":" + s, cls: "" })) },
        ],
        vars: conteo.map((c, i) => ({ k: L("sala " + i, "room " + i), v: c, cls: i === mejor ? "result" : "" })),
      });
      return steps;
    },
  };
})();
