/* 126. Word Ladder II — BFS por niveles guardando predecesores + reconstrucción. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",          "funcion findLadders(begin, end, lista):",              "function findLadders(begin, end, list):"],
    ["dicc",        "  dicc pasa a ser el conjunto de palabras de lista",            "  dict becomes the set of words in list"],
    ["sinFin",      "  si end no está en dicc:",                            "  if end is not in dict:"],
    ["retVacio",    "    retornar la lista vacía",                          "    return the empty list"],
    ["nivel",       "  nivel empieza con begin dentro",         "  level starts with begin inside"],
    ["visto",       "  visto empieza con begin dentro",         "  seen starts with begin inside"],
    ["padres",      "  padres guarda, para cada palabra, la lista de palabras desde las que se llegó a ella",
                    "  parents holds, for each word, the list of words it was reached from"],
    ["encontrado",  "  encontrado pasa a ser falso",                                 "  found becomes false"],
    ["mientras",    "  mientras nivel no esté vacío y encontrado sea falso:",
                    "  while level is not empty and found is false:"],
    ["siguiente",   "    siguiente empieza vacío",                       "    next starts empty"],
    ["porPalabra",  "    para cada palabra del nivel:",                     "    for each word of the level:"],
    ["porVecina",   "      para cada vecina de palabra:      // vecina: cambia exactamente una letra",
                    "      for each neighbor of word:        // neighbor: exactly one letter differs"],
    ["valida",      "        si vecina está en dicc y no ha sido vista:",
                    "        if neighbor is in dict and has not been seen:"],
    ["guardaPadre", "          añadir palabra a padres[vecina]",            "          add word to parents[neighbor]"],
    ["esFin",       "          si vecina es end:",                          "          if neighbor is end:"],
    ["marcaFin",    "            encontrado pasa a ser verdadero",                   "            found becomes true"],
    ["sumaSig",     "          añadir vecina a siguiente",                  "          add neighbor to next"],
    ["marcaVistas", "    marcar como vistas todas las palabras de siguiente",
                    "    mark every word of next as seen"],
    ["avanza",      "    nivel pasa a ser siguiente",                                "    level becomes next"],
    ["reconstruye", "  caminos pasa a ser recorrer padres hacia atrás desde end hasta begin, anotando cada ruta",
                    "  paths becomes walk parents backwards from end to begin, noting every route"],
    ["retorna",     "  retornar caminos",                                   "  return paths"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("hit → cog", "hit → cog"), input: { begin: "hit", end: "cog", words: ["hot","dot","dog","lot","log","cog"] } },
      { name: L("a → c", "a → c"), input: { begin: "a", end: "c", words: ["a","b","c"] } },
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
                                        `"${input.end}" is not in the dictionary. Answer [].`),
                                      [A.sinFin, A.retVacio]); return steps; }
      snap(L(`BFS por niveles desde "${input.begin}".`, `Level BFS from "${input.begin}".`),
           [A.dicc, A.nivel, A.padres]);

      while (nivel.size && !encontrado) {
        const siguiente = new Set();
        snap(L(`Expandimos el nivel: [${Array.from(nivel).join(", ")}].`,
               `Expand the level: [${Array.from(nivel).join(", ")}].`), [A.siguiente, A.porPalabra]);
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
                       `"${palabra}" → "${cand}". Record predecessor.`),
                     [A.valida, A.guardaPadre, A.esFin, A.sumaSig]);
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
        [A.reconstruye, A.retorna], { list: { label: L("Caminos", "Paths"), items: resultados.slice() } });
      return steps;
    },
  };
})();
