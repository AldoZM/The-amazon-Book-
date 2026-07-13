/* 1094. Car Pooling — arreglo de diferencias (sweep line) sobre las posiciones del camino. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion carPooling(trips, capacity):",              "function carPooling(trips, capacity):"],
    ["diffInit", "  diff[posición] empieza en 0, para toda posición",  "  diff[position] starts at 0, for every position"],
    ["porCada",  "  para cada viaje (num, desde, hasta) en trips:",    "  for each trip (num, from, to) in trips:"],
    ["sube",     "    diff[desde] += num          // suben \"num\" personas aquí",
                 "    diff[from] += num           // \"num\" people get on here"],
    ["baja",     "    diff[hasta] -= num          // bajan \"num\" personas aquí",
                 "    diff[to] -= num             // \"num\" people get off here"],
    ["ocup0",    "  ocupación empieza en 0",                          "  occupancy starts at 0"],
    ["barre",    "  para cada posición del camino, de menor a mayor:", "  for each road position, from smallest to largest:"],
    ["suma",     "    ocupación += diff[posición]",                   "    occupancy += diff[position]"],
    ["excede",   "    si ocupación > capacity:",                      "    if occupancy > capacity:"],
    ["falso",    "      retornar falso",                              "      return false"],
    ["verdadero","  retornar verdadero",                              "  return true"],
  ]);
  const A = C.L;

  P["1094"] = {
    num: 1094, slug: "car-pooling", title: "Car Pooling",
    difficulty: "M", block: "intervalos", tags: ["barrido", "arreglo de diferencias"],
    summary: L(
      "En vez de simular pasajero por pasajero, acumulamos el cambio neto en cada punto del camino (suben menos bajan) y barremos de izquierda a derecha: la ocupación nunca debe superar la capacidad.",
      "Instead of simulating passenger by passenger, we accumulate the net change at each road point (get on minus get off) and sweep left to right: occupancy must never exceed capacity."),
    legend: [
      { cls: "hot", label: L("posición actual", "current position") },
      { cls: "done", label: L("posición ya recorrida", "position already swept") },
    ],
    code: C,
    cases: [
      { name: L("cap=4 → excede (false)", "cap=4 → exceeds (false)"), input: { trips: [[2,1,5],[3,3,7]], capacity: 4 } },
      { name: L("cap=5 → justo cabe (true)", "cap=5 → fits exactly (true)"), input: { trips: [[2,1,5],[3,3,7]], capacity: 5 } },
      { name: L("bajan y suben en el mismo punto (true)", "get off and on at the same point (true)"), input: { trips: [[3,0,2],[3,2,5]], capacity: 3 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "trips", type: "text", label: L("Viajes [pasajeros,desde,hasta]:", "Trips [passengers,from,to]:"), placeholder: L("ej. [[2,1,5],[3,3,7]]", "ex. [[2,1,5],[3,3,7]]") },
        { id: "capacity", type: "text", label: L("Capacidad:", "Capacity:"), placeholder: L("4", "4") },
      ],
      initial() { return { trips: "[[2,1,5],[3,3,7]]", capacity: "4" }; },
      parse(state) {
        const capacity = parseInt(state.capacity, 10);
        if (Number.isNaN(capacity) || capacity < 1 || capacity > 100) {
          return { ok: false, field: "capacity", error: L("La capacidad debe ser un número entre 1 y 100.", "Capacity must be a number between 1 and 100.") };
        }
        let s = String(state.trips == null ? "" : state.trips).trim();
        if (!s) return { ok: false, field: "trips", error: L("Escribe viajes, ej: [[2,1,5],[3,3,7]].", "Type trips, ex: [[2,1,5],[3,3,7]].") };
        let arr;
        try { arr = JSON.parse(s); }
        catch (e) { return { ok: false, field: "trips", error: L("Sintaxis inválida. Verifica corchetes.", "Invalid syntax. Check brackets.") }; }
        if (!Array.isArray(arr)) return { ok: false, field: "trips", error: L("Debe ser una lista de listas.", "Must be a list of lists.") };
        if (arr.length > 12) {
          return { ok: false, field: "trips", error: L(`Demasiados viajes: ${arr.length}. Caben 12.`, `Too many trips: ${arr.length}. The limit is 12.`) };
        }
        for (const t of arr) {
          if (!Array.isArray(t) || t.length !== 3 || !t.every((x) => Number.isInteger(x))) {
            return { ok: false, field: "trips", error: L("Cada viaje debe tener 3 enteros: [pasajeros, desde, hasta].", "Each trip must have 3 integers: [passengers, from, to].") };
          }
          const [num, desde, hasta] = t;
          if (num < 1) return { ok: false, field: "trips", error: L("Los pasajeros deben ser al menos 1.", "Passengers must be at least 1.") };
          if (desde < 0 || hasta < 0 || desde >= hasta) {
            return { ok: false, field: "trips", error: L("Debe cumplirse 0 <= desde < hasta.", "It must hold that 0 <= from < to.") };
          }
          if (hasta > 200) return { ok: false, field: "trips", error: L("El camino solo llega hasta 200 en este visualizador.", "The road only reaches 200 in this visualizer.") };
        }
        return { ok: true, input: { trips: arr, capacity } };
      },
      previewSpec(input) {
        return { type: "array", label: L("Viajes [pasajeros,desde,hasta]", "Trips [passengers,from,to]"),
          items: input.trips.map((t) => ({ v: "[" + t[0] + "," + t[1] + "," + t[2] + "]", cls: "" })) };
      },
      hint: L("0 <= desde < hasta. La capacidad es un entero positivo.", "0 <= from < to. Capacity is a positive integer."),
    },

    build(input) {
      const trips = (input.trips || []).map((t) => t.slice());
      const capacity = input.capacity;
      const maxPos = trips.length ? Math.max(...trips.map((t) => t[2])) : 0;
      const diff = new Array(maxPos + 1).fill(0);
      const steps = [];

      const snap = (note, line, pos, ocupacion, excede) => steps.push({
        line, note,
        array: { label: L("diff[] por posición del camino", "diff[] by road position"),
          items: diff.map((v, i) => ({ v, cls: pos != null && i === pos ? "hot" : (pos != null && i < pos ? "done" : "") })), indices: true },
        vars: [
          { k: L("posición", "position"), v: pos == null ? "-" : pos, cls: "" },
          { k: L("ocupación", "occupancy"), v: ocupacion == null ? 0 : ocupacion, cls: excede ? "result" : "" },
          { k: L("capacidad", "capacity"), v: capacity, cls: "result" },
        ],
      });

      snap(L("El arreglo de diferencias empieza en ceros.", "The difference array starts at zero."), [A.fn, A.diffInit], null, 0, false);

      for (const [num, desde, hasta] of trips) {
        diff[desde] += num;
        diff[hasta] -= num;
        snap(L(`Viaje de ${num} pasajero(s) de ${desde} a ${hasta}: diff[${desde}] += ${num}, diff[${hasta}] -= ${num}.`,
               `Trip of ${num} passenger(s) from ${desde} to ${hasta}: diff[${desde}] += ${num}, diff[${hasta}] -= ${num}.`),
             [A.porCada, A.sube, A.baja], null, 0, false);
      }

      let ocupacion = 0;
      snap(L("Barremos el camino: la ocupación empieza en 0.", "Sweep the road: occupancy starts at 0."), A.ocup0, null, 0, false);
      for (let pos = 0; pos <= maxPos; pos++) {
        ocupacion += diff[pos];
        if (ocupacion > capacity) {
          snap(L(`Posición ${pos}: ocupación sube a ${ocupacion}, supera la capacidad ${capacity}.`,
                 `Position ${pos}: occupancy rises to ${ocupacion}, exceeds capacity ${capacity}.`),
               [A.barre, A.suma, A.excede], pos, ocupacion, true);
          snap(L("La capacidad se excede en algún punto: retornamos <b>falso</b>.",
                 "Capacity is exceeded at some point: return <b>false</b>."), A.falso, pos, ocupacion, true);
          return steps;
        }
        snap(L(`Posición ${pos}: ocupación = ${ocupacion} (cabe en la capacidad ${capacity}).`,
               `Position ${pos}: occupancy = ${ocupacion} (fits within capacity ${capacity}).`),
             [A.barre, A.suma], pos, ocupacion, false);
      }

      snap(L("Nunca se excede la capacidad: retornamos <b>verdadero</b>.",
             "Capacity is never exceeded: return <b>true</b>."), A.verdadero, maxPos, ocupacion, false);
      return steps;
    },
  };
})();
