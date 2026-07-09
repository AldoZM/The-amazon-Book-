/* 994. Rotting Oranges — BFS multifuente por niveles (minutos). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",          "funcion orangesRotting(grid):",                     "function orangesRotting(grid):"],
    ["cola",        "  cola empieza con todas las naranjas podridas dentro",              "  queue starts with all the rotten oranges inside"],
    ["frescas",     "  frescas pasa a ser cuántas naranjas frescas hay",          "  fresh becomes how many fresh oranges there are"],
    ["sinFrescas",  "  si no hay ninguna naranja fresca:",               "  if there is no fresh orange:"],
    ["cero",        "    retornar 0",                                    "    return 0"],
    ["minutos0",    "  minutos empieza en 0",                                     "  minutes starts at 0"],
    ["mientras",    "  mientras la cola no esté vacía y queden frescas:", "  while the queue is not empty and fresh ones remain:"],
    ["capa",        "    capa pasa a ser cuántas podridas hay ahora en la cola",  "    layer becomes how many rotten are in the queue now"],
    ["repite",      "    repetir capa veces:",                           "    repeat layer times:"],
    ["saca",        "      sacar la primera de la cola y llamarla (r, c)",        "      take the first one out of the queue and call it (r, c)"],
    ["porVecina",   "      para cada vecina (arriba, abajo, izquierda, derecha):",
                    "      for each neighbor (up, down, left, right):"],
    ["esFresca",    "        si la vecina es una naranja fresca:",       "        if the neighbor is a fresh orange:"],
    ["pudre",       "          marcar la vecina como podrida",           "          mark the neighbor as rotten"],
    ["restaFresca", "          restar 1 a frescas",                   "          subtract 1 from fresh"],
    ["encola",      "          meter la vecina en la cola",              "          push the neighbor into the queue"],
    ["avanzaMin",   "    sumar 1 a minutos                   // acaba de pasar un minuto",
                    "    add 1 to minutes                     // one minute has just passed"],
    ["ningunaFresca", "  si no queda ninguna naranja fresca:",           "  if no fresh orange remains:"],
    ["retMinutos",  "    retornar minutos",                              "    return minutes"],
    ["menosUno",    "  retornar -1                          // quedan frescas que nadie alcanza",
                    "  return -1                            // fresh ones nobody can reach remain"],
  ]);
  const A = C.L;

  P["994"] = {
    num: 994, slug: "rotting-oranges", title: "Rotting Oranges",
    difficulty: "M", block: "grafos", tags: ["BFS", "grid", "multifuente"],
    summary: L(
      "Cada minuto, toda naranja fresca (1) vecina de una podrida (2) se pudre. BFS por capas desde TODAS las podridas a la vez; cada capa es un minuto.",
      "Each minute, every fresh orange (1) next to a rotten one (2) rots. Multi-source BFS by layers from ALL rotten oranges at once; each layer is a minute."),
    legend: [
      { cls: "water", label: L("vacío (0)", "empty (0)") },
      { cls: "fresh", label: L("fresca (1)", "fresh (1)") },
      { cls: "rotten", label: L("podrida (2)", "rotten (2)") },
      { cls: "current", label: L("pudriéndose ahora", "rotting now") },
    ],
    code: C,
    cases: [
      { name: L("4 minutos (3×3)", "4 minutes (3×3)"), input: [[2,1,1],[1,1,0],[0,1,1]] },
      { name: L("Imposible (-1)", "Impossible (-1)"), input: [[2,1,1],[0,1,1],[1,0,1]] },
      { name: L("Sin frescas (0)", "No fresh (0)"), input: [[0,2]] },
    ],

    // Modo interactivo: coloca naranjas y mira cuántos minutos tarda en pudrirse
    // todo. Aquí la celda tiene tres estados, así que `cycle` da una vuelta
    // completa: vacío → fresca → podrida → vacío.
    editor: {
      rows: 5, cols: 5,
      initial() {
        const g = Array.from({ length: this.rows }, () => new Array(this.cols).fill(1));
        g[0][0] = 2;   // una podrida para que el BFS tenga de dónde arrancar
        return g;
      },
      cycle(g, r, c) { g[r][c] = (g[r][c] + 1) % 3; return g; },
      cellView(v) {
        // Mismas clases que usa build().
        if (v === 0) return { v: "", cls: "water" };
        if (v === 1) return { v: "1", cls: "fresh" };
        return { v: "2", cls: "rotten" };
      },
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para cambiarla: vacío → fresca (1) → podrida (2). Luego pulsa Ejecutar.",
        en: "Tap a cell to change it: empty → fresh (1) → rotten (2). Then press Run.",
      },
    },

    build(input) {
      const grid = input.map((r) => r.slice());
      const m = grid.length, n = grid[0].length;
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      const steps = [];
      let frescas = 0, minutos = 0;
      const q = [];

      const snap = (note, line, cur) => {
        const set = cur ? new Set(cur.map((x) => x.join(","))) : null;
        const cells = grid.map((row, r) => row.map((v, c) => {
          let cls = v === 0 ? "water" : v === 1 ? "fresh" : "rotten";
          if (set && set.has(r + "," + c)) cls = "current";
          return { v: String(v), cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: "grid", coords: true },
          queue: { label: L("Cola (podridas por procesar)", "Queue (rotten to process)"), arrows: true,
                   items: q.map((p) => p[0] + "," + p[1]) },
          vars: [{ k: L("minutos", "minutes"), v: minutos }, { k: L("frescas", "fresh"), v: frescas }] });
      };

      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          if (grid[r][c] === 2) q.push([r, c]);
          else if (grid[r][c] === 1) frescas++;
        }
      snap(L(`Metemos las ${q.length} podridas a la cola y contamos ${frescas} frescas.`,
             `Push the ${q.length} rotten into the queue and count ${frescas} fresh.`), [A.cola, A.frescas]);

      if (frescas === 0) {
        snap(L("No hay frescas: nada que pudrir. Respuesta <b>0</b>.",
               "No fresh oranges: nothing to rot. Answer <b>0</b>."), [A.sinFrescas, A.cero]);
        return steps;
      }

      while (q.length && frescas > 0) {
        const capa = q.length;
        for (let i = 0; i < capa; i++) {
          const [r, c] = q.shift();
          snap(L(`Procesamos la podrida (${r},${c}) de esta capa.`,
                 `Process the rotten (${r},${c}) in this layer.`), A.saca, [[r, c]]);
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] !== 1) continue;
            grid[nr][nc] = 2;
            frescas--;
            q.push([nr, nc]);
            snap(L(`Se pudre (${nr},${nc}): 1→2. Quedan ${frescas} frescas. Entra a la cola.`,
                   `Rots (${nr},${nc}): 1→2. ${frescas} fresh left. It enters the queue.`),
                 [A.esFresca, A.pudre, A.restaFresca, A.encola], [[nr, nc]]);
          }
        }
        minutos++;
        snap(L(`Terminó el minuto <b>${minutos}</b>. La cola guarda la siguiente onda.`,
               `Minute <b>${minutos}</b> done. The queue holds the next wave.`), A.avanzaMin);
      }

      if (frescas === 0) snap(L(`Todo podrido en <b>${minutos}</b> minutos.`,
                               `All rotten in <b>${minutos}</b> minutes.`), [A.ningunaFresca, A.retMinutos]);
      else snap(L(`Quedaron ${frescas} frescas aisladas: imposible, respuesta <b>-1</b>.`,
                 `${frescas} isolated fresh remain: impossible, answer <b>-1</b>.`), A.menosUno);
      return steps;
    },
  };
})();
