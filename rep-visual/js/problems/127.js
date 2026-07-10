/* 127. Word Ladder — BFS sobre palabras que difieren en una letra. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion ladderLength(begin, end, lista):",         "function ladderLength(begin, end, list):"],
    ["dicc",      "  dicc pasa a ser el conjunto de palabras de lista",        "  dict becomes the set of words in list"],
    ["sinFin",    "  si end no está en dicc:",                        "  if end is not in dict:"],
    ["retCero",   "    retornar 0",                                   "    return 0"],
    ["cola",      "  cola empieza con el par (begin, 1 paso) dentro",        "  queue starts with the pair (begin, 1 step) inside"],
    ["visto",     "  visto empieza con begin dentro",     "  seen starts with begin inside"],
    ["mientras",  "  mientras la cola no esté vacía:",                "  while the queue is not empty:"],
    ["saca",      "    sacar (palabra, pasos) del frente de la cola", "    take (word, steps) from the front of the queue"],
    ["esFin",     "    si palabra es end:",                           "    if word is end:"],
    ["retPasos",  "      retornar pasos",                             "      return steps"],
    ["porVecina", "    para cada vecina de palabra:      // vecina: cambia exactamente una letra",
                  "    for each neighbor of word:        // neighbor: exactly one letter differs"],
    ["valida",    "      si vecina está en dicc y no ha sido vista:", "      if neighbor is in dict and has not been seen:"],
    ["marca",     "        marcar vecina como vista",                 "        mark neighbor as seen"],
    ["encola",    "        encolar (vecina, pasos + 1)",              "        enqueue (neighbor, steps + 1)"],
    ["cero",      "  retornar 0                          // la cola se vació sin llegar a end",
                  "  return 0                            // the queue emptied without reaching end"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("hit → cog (5)", "hit → cog (5)"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log","cog"] } },
      { name: L("hit → cog sin puente (0)", "hit → cog no bridge (0)"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log"] } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "begin", type: "text", label: L("beginWord:", "beginWord:"), placeholder: L("ej. hit", "ex. hit") },
        { id: "end", type: "text", label: L("endWord:", "endWord:"), placeholder: L("ej. cog", "ex. cog") },
        { id: "words", type: "text", label: L("wordList:", "wordList:"), placeholder: L("ej. [\"hot\",\"dot\"]", "ex. [\"hot\",\"dot\"]") }
      ],
      initial() {
        return { begin: "hit", end: "cog", words: '["hot","dot","dog","lot","log","cog"]' };
      },
      parse(state) {
        const b = (state.begin || "").trim();
        const e = (state.end || "").trim();
        if (!b) return { ok: false, field: "begin", error: L("Falta beginWord.", "Missing beginWord.") };
        if (!e) return { ok: false, field: "end", error: L("Falta endWord.", "Missing endWord.") };
        if (b.length !== e.length) return { ok: false, field: "end", error: L("endWord debe tener la misma longitud.", "endWord must have the same length.") };
        
        const w = VIS.parse.stringArray(state.words, 15);
        if (!w.ok) return { ok: false, field: "words", error: w.error };
        for (const word of w.arr) {
          if (word.length !== b.length) return { ok: false, field: "words", error: L(`La palabra "${word}" tiene longitud distinta.`, `Word "${word}" has different length.`) };
        }
        
        return { ok: true, input: { begin: b, end: e, words: w.arr } };
      },
      previewSpec(input) {
        const nodes = [];
        const edges = [];
        const allWords = Array.from(new Set([input.begin, ...input.words]));
        const pos = VIS.circleLayout(allWords.length, 160, 150, Math.min(120, 40 + allWords.length * 14));
        allWords.forEach((w, i) => {
          nodes.push({ id: w, label: w, x: pos[i][0], y: pos[i][1], cls: w === input.begin ? "current" : (w === input.end ? "target" : "") });
        });
        for (let i = 0; i < allWords.length; i++) {
          for (let j = i + 1; j < allWords.length; j++) {
            let diff = 0;
            for (let k = 0; k < allWords[i].length; k++) {
              if (allWords[i][k] !== allWords[j][k]) diff++;
            }
            if (diff === 1) edges.push({ from: allWords[i], to: allWords[j], directed: false });
          }
        }
        return { type: "graph", label: L("Grafo implícito (difieren en 1 letra)", "Implicit graph (differ by 1 letter)"), r: 18, nodes, edges };
      },
      hint: L("Las palabras deben tener la misma longitud.", "Words must have the same length.")
    },

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
                                        `"${input.end}" is not in the dictionary. Answer 0.`), [A.sinFin, A.retCero]); return steps; }
      snap(L(`Arrancamos BFS desde "${input.begin}" con 1 paso.`,
             `Start BFS from "${input.begin}" with 1 step.`), [A.cola, A.visto]);

      while (cola.length) {
        const [palabra, pasos] = cola.shift();
        if (palabra === input.end) { snap(L(`Llegamos a "${input.end}" en <b>${pasos}</b> pasos.`,
                                           `Reached "${input.end}" in <b>${pasos}</b> steps.`),
                                         [A.esFin, A.retPasos], palabra, pasos); return steps; }
        snap(L(`Procesamos "${palabra}" (${pasos}). Probamos cambiar cada letra.`,
               `Process "${palabra}" (${pasos}). We try changing each letter.`), [A.saca, A.porVecina], palabra, pasos);
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
                     `"${palabra}" → "${cand}" (change position ${i}). Enqueue with ${pasos + 1}.`),
                   [A.valida, A.marca, A.encola], palabra, pasos);
            }
          }
          arr[i] = orig;
        }
      }
      snap(L("Cola vacía sin llegar al final. Respuesta 0.",
             "Queue empty without reaching the end. Answer 0."), A.cero);
      return steps;
    },
  };
})();
