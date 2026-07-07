/* 128. Longest Consecutive Sequence — conjunto + arrancar solo en inicios de racha. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion longestConsecutive(nums):",
        "  conj ← conjunto(nums)",
        "  mejor ← 0",
        "  para cada n en conj:",
        "    si (n-1) no está en conj:   // n es inicio",
        "      largo ← 1",
        "      mientras (n+largo) en conj: largo += 1",
        "      mejor ← máx(mejor, largo)",
        "  retornar mejor",
      ],
      en: [
        "function longestConsecutive(nums):",
        "  set ← set(nums)",
        "  best ← 0",
        "  for each n in set:",
        "    if (n-1) not in set:   // n is a start",
        "      len ← 1",
        "      while (n+len) in set: len += 1",
        "      best ← max(best, len)",
        "  return best",
      ],
    },
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
             "Put the numbers into a set (O(1) lookup)."), 1);
      for (const n of conj) {
        if (!conj.has(n - 1)) {
          state[n] = "current";
          let largo = 1;
          snap(L(`${n} es inicio de racha (no existe ${n - 1}). Contamos hacia arriba.`,
                 `${n} is a run start (${n - 1} is missing). Count upward.`), [4, 5]);
          state[n] = "path";
          while (conj.has(n + largo)) {
            state[n + largo] = "path";
            largo++;
            snap(L(`${n + largo - 1} continúa la racha. Largo = ${largo}.`,
                   `${n + largo - 1} continues the run. Length = ${largo}.`), 6);
          }
          mejor = Math.max(mejor, largo);
          for (let k = 0; k < largo; k++) state[n + k] = "done";
          snap(L(`Racha desde ${n} mide ${largo}. Mejor = ${mejor}.`,
                 `Run from ${n} has length ${largo}. Best = ${mejor}.`), 7);
        }
      }
      snap(L(`Racha consecutiva más larga: <b>${mejor}</b>.`,
             `Longest consecutive run: <b>${mejor}</b>.`), 8);
      return steps;
    },
  };
})();
