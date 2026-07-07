/* 994. Rotting Oranges — BFS multifuente por niveles (minutos). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion orangesRotting(grid):",
        "  cola ← todas las podridas (2)",
        "  frescas ← número de frescas (1)",
        "  si frescas == 0: retornar 0",
        "  minutos ← 0",
        "  mientras cola no vacía y frescas > 0:",
        "    capa ← tamaño de la cola",
        "    repetir capa veces:",
        "      (r,c) ← sacar de la cola",
        "      para cada vecina (arriba/abajo/izq/der):",
        "        si vecina es fresca (1):",
        "          pudrir (1→2); frescas ← frescas - 1",
        "          meter vecina en la cola",
        "    minutos ← minutos + 1",
        "  retornar (frescas==0) ? minutos : -1",
      ],
      en: [
        "function orangesRotting(grid):",
        "  queue ← all rotten (2)",
        "  fresh ← number of fresh (1)",
        "  if fresh == 0: return 0",
        "  minutes ← 0",
        "  while queue not empty and fresh > 0:",
        "    layer ← queue size",
        "    repeat layer times:",
        "      (r,c) ← pop from queue",
        "      for each neighbor (up/down/left/right):",
        "        if neighbor is fresh (1):",
        "          rot it (1→2); fresh ← fresh - 1",
        "          push neighbor into queue",
        "    minutes ← minutes + 1",
        "  return (fresh==0) ? minutes : -1",
      ],
    },
    cases: [
      { name: L("4 minutos (3×3)", "4 minutes (3×3)"), input: [[2,1,1],[1,1,0],[0,1,1]] },
      { name: L("Imposible (-1)", "Impossible (-1)"), input: [[2,1,1],[0,1,1],[1,0,1]] },
      { name: L("Sin frescas (0)", "No fresh (0)"), input: [[0,2]] },
    ],

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
             `Push the ${q.length} rotten into the queue and count ${frescas} fresh.`), [1, 2]);

      if (frescas === 0) {
        snap(L("No hay frescas: nada que pudrir. Respuesta <b>0</b>.",
               "No fresh oranges: nothing to rot. Answer <b>0</b>."), 3);
        return steps;
      }

      while (q.length && frescas > 0) {
        const capa = q.length;
        for (let i = 0; i < capa; i++) {
          const [r, c] = q.shift();
          snap(L(`Procesamos la podrida (${r},${c}) de esta capa.`,
                 `Process the rotten (${r},${c}) in this layer.`), 8, [[r, c]]);
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (grid[nr][nc] !== 1) continue;
            grid[nr][nc] = 2;
            frescas--;
            q.push([nr, nc]);
            snap(L(`Se pudre (${nr},${nc}): 1→2. Quedan ${frescas} frescas. Entra a la cola.`,
                   `Rots (${nr},${nc}): 1→2. ${frescas} fresh left. It enters the queue.`), [10, 11, 12], [[nr, nc]]);
          }
        }
        minutos++;
        snap(L(`Terminó el minuto <b>${minutos}</b>. La cola guarda la siguiente onda.`,
               `Minute <b>${minutos}</b> done. The queue holds the next wave.`), 13);
      }

      if (frescas === 0) snap(L(`Todo podrido en <b>${minutos}</b> minutos.`,
                               `All rotten in <b>${minutos}</b> minutes.`), 14);
      else snap(L(`Quedaron ${frescas} frescas aisladas: imposible, respuesta <b>-1</b>.`,
                 `${frescas} isolated fresh remain: impossible, answer <b>-1</b>.`), 14);
      return steps;
    },
  };
})();
