/* 128. Longest Consecutive Sequence — conjunto + arrancar solo en inicios de racha. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion longestConsecutive(nums):",              "function longestConsecutive(nums):"],
    ["conjunto",  "  conj empieza con todos los números dentro",     "  set starts with all the numbers inside"],
    ["mejor0",    "  mejor empieza en 0",                                    "  best starts at 0"],
    ["porCada",   "  para cada número n de conj:",                  "  for each number n in set:"],
    ["esInicio",  "    si el anterior (n - 1) no está en conj:   // entonces n abre una racha",
                  "    if the previous one (n - 1) is not in set:   // then n starts a run"],
    ["largo1",    "      largo empieza en 1",                                "      length starts at 1"],
    ["sigue",     "      mientras (n + largo) está en conj:",       "      while (n + length) is in set:"],
    ["crece",     "        sumar 1 a largo",                      "        add 1 to length"],
    ["actualiza", "      mejor pasa a ser el mayor de mejor y largo",        "      best becomes the larger of best and length"],
    ["retorna",   "  retornar mejor",                               "  return best"],
  ]);
  const A = C.L;

  P["128"] = {
    num: 128, slug: "longest-consecutive", title: "Longest Consecutive Sequence",
    difficulty: "M", block: "grafos", tags: ["conjunto", "O(n)"],
    summary: L(
      "Racha consecutiva más larga en O(n). Metemos todo en un conjunto y solo contamos desde los números que son INICIO de racha (su anterior no está), evitando recontar.",
      "Longest consecutive run in O(n). We put everything in a set and only count from numbers that START a run (their predecessor is absent), avoiding recounting."),
    legend: [
      { cls: "current", label: L("inicio de racha", "run start") },
      { cls: "path", label: L("racha actual", "current run") },
      { cls: "done", label: L("ya contado", "already counted") },
    ],
    code: C,
    cases: [
      { name: L("[100,4,200,1,3,2] → 4", "[100,4,200,1,3,2] → 4"), input: [100,4,200,1,3,2] },
      { name: L("[0,3,7,2,5,8,4,6,0,1] → 9", "[0,3,7,2,5,8,4,6,0,1] → 9"), input: [0,3,7,2,5,8,4,6,0,1] },
    ],

    build(input) {
      const conj = new Set(input);
      const orden = Array.from(conj).sort((a, b) => a - b);
      const steps = [];
      const state = {};
      let mejor = 0;

      const snap = (note, line) => steps.push({ line, note,
        list: { label: L("conjunto (ordenado)", "set (sorted)"), items: orden.map((v) => ({ v, cls: state[v] || "" })) },
        vars: [{ k: L("mejor", "best"), v: mejor, cls: "result" }] });

      snap(L("Metemos los números en un conjunto (búsqueda O(1)).",
             "Put the numbers into a set (O(1) lookup)."), A.conjunto);
      for (const n of conj) {
        if (!conj.has(n - 1)) {
          state[n] = "current";
          let largo = 1;
          snap(L(`${n} es inicio de racha (no existe ${n - 1}). Contamos hacia arriba.`,
                 `${n} is a run start (${n - 1} is missing). Count upward.`), [A.esInicio, A.largo1]);
          state[n] = "path";
          while (conj.has(n + largo)) {
            state[n + largo] = "path";
            largo++;
            snap(L(`${n + largo - 1} continúa la racha. Largo = ${largo}.`,
                   `${n + largo - 1} continues the run. Length = ${largo}.`), [A.sigue, A.crece]);
          }
          mejor = Math.max(mejor, largo);
          for (let k = 0; k < largo; k++) state[n + k] = "done";
          snap(L(`Racha desde ${n} mide ${largo}. Mejor = ${mejor}.`,
                 `Run from ${n} has length ${largo}. Best = ${mejor}.`), A.actualiza);
        }
      }
      snap(L(`Racha consecutiva más larga: <b>${mejor}</b>.`,
             `Longest consecutive run: <b>${mejor}</b>.`), A.retorna);
      return steps;
    },
  };
})();
