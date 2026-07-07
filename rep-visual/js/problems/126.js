/* 126. Word Ladder II — BFS por niveles guardando predecesores + reconstrucción. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["126"] = {
    num: 126, slug: "word-ladder-ii", title: "Word Ladder II",
    difficulty: "H", block: "grafos", tags: ["BFS", "backtracking"],
    summary: L(
      "TODOS los caminos de transformación más cortos, no solo su longitud. BFS por niveles que guarda de qué palabras se llegó a cada una (predecesores); al final se reconstruyen los caminos.",
      "ALL shortest transformation paths, not just their length. Level BFS that records which words reached each one (predecessors); at the end the paths are reconstructed."),
    legend: [
      { cls: "current", label: L("nivel actual", "current level") },
      { cls: "done", label: L("visitada", "visited") },
    ],
    code: {
      es: [
        "funcion findLadders(begin, end, lista):",
        "  dicc ← conjunto(lista); nivel ← {begin}",
        "  padres ← {}; encontrado ← falso",
        "  mientras nivel no vacío y no encontrado:",
        "    siguiente ← {}",
        "    para cada palabra del nivel:",
        "      por cada vecina en dicc no visitada:",
        "        padres[vecina] += palabra",
        "        si vecina == end: encontrado ← verdadero",
        "        añadir vecina a 'siguiente'",
        "    marcar 'siguiente' como visitadas; nivel ← siguiente",
        "  reconstruir caminos desde end usando padres",
      ],
      en: [
        "function findLadders(begin, end, list):",
        "  dict ← set(list); level ← {begin}",
        "  parents ← {}; found ← false",
        "  while level not empty and not found:",
        "    next ← {}",
        "    for each word in level:",
        "      for each neighbor in dict, unvisited:",
        "        parents[neighbor] += word",
        "        if neighbor == end: found ← true",
        "        add neighbor to 'next'",
        "    mark 'next' as visited; level ← next",
        "  reconstruct paths from end using parents",
      ],
    },
    cases: [
      { name: L("hit → cog", "hit → cog"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log","cog"] } },
      { name: L("a → c", "a → c"), input: { begin: "a", end: "c", words: ["a","b","c"] } },
    ],

    build(input) {
      const dicc = new Set(input.words);
      const abc = "abcdefghijklmnopqrstuvwxyz";
      const steps = [];
      const padres = {};
      let nivel = new Set([input.begin]);
      const visto = new Set([input.begin]);
      let encontrado = false;
      const resultados = [];

      const snap = (note, line, extra) => {
        const listItems = Array.from(new Set([input.begin, ...input.words])).map((w) => ({
          v: w, cls: nivel.has(w) ? "current" : (visto.has(w) ? "done" : ""),
        }));
        steps.push(Object.assign({ line, note,
          list: { label: L("Palabras", "Words"), items: listItems },
          queue: { label: L("Nivel actual", "Current level"), arrows: true, items: Array.from(nivel) } }, extra || {}));
      };

      if (!dicc.has(input.end)) { snap(L(`"${input.end}" no está en el diccionario. Respuesta [].`,
                                        `"${input.end}" is not in the dictionary. Answer [].`), 1); return steps; }
      snap(L(`BFS por niveles desde "${input.begin}".`, `Level BFS from "${input.begin}".`), [1, 2]);

      while (nivel.size && !encontrado) {
        const siguiente = new Set();
        snap(L(`Expandimos el nivel: [${Array.from(nivel).join(", ")}].`,
               `Expand the level: [${Array.from(nivel).join(", ")}].`), [5, 6]);
        for (const palabra of nivel) {
          const arr = palabra.split("");
          for (let i = 0; i < arr.length; i++) {
            const orig = arr[i];
            for (const ch of abc) {
              if (ch === orig) continue;
              arr[i] = ch;
              const cand = arr.join("");
              if (dicc.has(cand) && !visto.has(cand)) {
                if (!siguiente.has(cand)) { siguiente.add(cand); padres[cand] = []; }
                padres[cand].push(palabra);
                if (cand === input.end) encontrado = true;
                snap(L(`"${palabra}" → "${cand}". Guardamos predecesor.`,
                       `"${palabra}" → "${cand}". Record predecessor.`), [7, 8, 9]);
              }
            }
            arr[i] = orig;
          }
        }
        siguiente.forEach((w) => visto.add(w));
        nivel = siguiente;
      }

      if (encontrado) {
        const build = (w) => {
          if (w === input.begin) return [[input.begin]];
          const out = [];
          for (const p of padres[w] || []) for (const path of build(p)) out.push([...path, w]);
          return out;
        };
        build(input.end).forEach((p) => resultados.push(p.join(" → ")));
      }
      nivel = new Set();
      snap(encontrado
        ? L(`Caminos más cortos encontrados (${resultados.length}):<br>` + resultados.map((r) => "• " + r).join("<br>"),
            `Shortest paths found (${resultados.length}):<br>` + resultados.map((r) => "• " + r).join("<br>"))
        : L("No hay transformación posible. Respuesta [].", "No transformation possible. Answer []."),
        11, { list: { label: L("Caminos", "Paths"), items: resultados.slice() } });
      return steps;
    },
  };
})();
