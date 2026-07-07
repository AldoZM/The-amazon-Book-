/* 127. Word Ladder — BFS sobre palabras que difieren en una letra. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["127"] = {
    num: 127, slug: "word-ladder", title: "Word Ladder",
    difficulty: "H", block: "grafos", tags: ["BFS", "grafo implícito"],
    summary: L(
      "Menor número de pasos para transformar una palabra en otra cambiando una letra a la vez, siempre dentro del diccionario. BFS: el primer camino que llega es el más corto.",
      "Fewest steps to transform one word into another by changing one letter at a time, always staying in the dictionary. BFS: the first path to arrive is the shortest."),
    legend: [
      { cls: "current", label: L("palabra actual", "current word") },
      { cls: "done", label: L("ya visitada", "already visited") },
    ],
    code: {
      es: [
        "funcion ladderLength(begin, end, lista):",
        "  dicc ← conjunto(lista)",
        "  si end no en dicc: retornar 0",
        "  cola ← [(begin, 1)]; visto ← {begin}",
        "  mientras cola no vacía:",
        "    (palabra, pasos) ← sacar de la cola",
        "    si palabra == end: retornar pasos",
        "    para cada vecina (cambia 1 letra) en dicc:",
        "      si no vista: marcar y encolar (vecina, pasos+1)",
        "  retornar 0",
      ],
      en: [
        "function ladderLength(begin, end, list):",
        "  dict ← set(list)",
        "  if end not in dict: return 0",
        "  queue ← [(begin, 1)]; seen ← {begin}",
        "  while queue not empty:",
        "    (word, steps) ← pop from queue",
        "    if word == end: return steps",
        "    for each neighbor (change 1 letter) in dict:",
        "      if not seen: mark and enqueue (neighbor, steps+1)",
        "  return 0",
      ],
    },
    cases: [
      { name: L("hit → cog (5)", "hit → cog (5)"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log","cog"] } },
      { name: L("hit → cog sin puente (0)", "hit → cog no bridge (0)"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log"] } },
    ],

    build(input) {
      const dicc = new Set(input.words);
      const steps = [];
      const visto = new Set([input.begin]);
      const cola = [[input.begin, 1]];
      const abc = "abcdefghijklmnopqrstuvwxyz";

      const snap = (note, line, cur, pasos) => {
        const listItems = Array.from(new Set([input.begin, ...input.words])).map((w) => ({
          v: w, cls: w === cur ? "current" : (visto.has(w) ? "done" : ""),
        }));
        steps.push({ line, note,
          list: { label: L("Palabras", "Words"), items: listItems },
          queue: { label: L("Cola (palabra, pasos)", "Queue (word, steps)"), arrows: true, items: cola.map((x) => x[0] + ":" + x[1]) },
          vars: [{ k: L("pasos", "steps"), v: pasos != null ? pasos : "-" }] });
      };

      if (!dicc.has(input.end)) { snap(L(`"${input.end}" no está en el diccionario. Respuesta 0.`,
                                        `"${input.end}" is not in the dictionary. Answer 0.`), 2); return steps; }
      snap(L(`Arrancamos BFS desde "${input.begin}" con 1 paso.`,
             `Start BFS from "${input.begin}" with 1 step.`), 3);

      while (cola.length) {
        const [palabra, pasos] = cola.shift();
        if (palabra === input.end) { snap(L(`Llegamos a "${input.end}" en <b>${pasos}</b> pasos.`,
                                           `Reached "${input.end}" in <b>${pasos}</b> steps.`), 6, palabra, pasos); return steps; }
        snap(L(`Procesamos "${palabra}" (${pasos}). Probamos cambiar cada letra.`,
               `Process "${palabra}" (${pasos}). We try changing each letter.`), [5, 7], palabra, pasos);
        const arr = palabra.split("");
        for (let i = 0; i < arr.length; i++) {
          const orig = arr[i];
          for (const ch of abc) {
            if (ch === orig) continue;
            arr[i] = ch;
            const cand = arr.join("");
            if (dicc.has(cand) && !visto.has(cand)) {
              visto.add(cand);
              cola.push([cand, pasos + 1]);
              snap(L(`"${palabra}" → "${cand}" (cambia posición ${i}). A la cola con ${pasos + 1}.`,
                     `"${palabra}" → "${cand}" (change position ${i}). Enqueue with ${pasos + 1}.`), 8, palabra, pasos);
            }
          }
          arr[i] = orig;
        }
      }
      snap(L("Cola vacía sin llegar al final. Respuesta 0.",
             "Queue empty without reaching the end. Answer 0."), 9);
      return steps;
    },
  };
})();
