/* 3. Longest Substring Without Repeating Characters — ventana deslizante con
   mapa del último índice visto de cada carácter. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",            "funcion longitudSubcadenaMasLarga(s):",                      "function lengthOfLongestSubstring(s):"],
    ["mapa",          "  ultimoIndice empieza vacío   // último índice donde vimos cada carácter",
                       "  lastIndex starts empty   // last index where we saw each character"],
    ["L0",            "  L empieza en 0",                                           "  L starts at 0"],
    ["mejor0",        "  mejor empieza en 0",                                       "  best starts at 0"],
    ["porR",          "  para R desde 0 hasta el final de s:",                      "  for R from 0 to the end of s:"],
    ["c",             "    c pasa a ser s[R]",                                      "    c becomes s[R]"],
    ["siRepetido",    "    si c ya está en ultimoIndice Y ese índice es >= L:",      "    if c is already in lastIndex AND that index is >= L:"],
    ["moverL",        "      L pasa a ser ultimoIndice[c] + 1",                     "      L becomes lastIndex[c] + 1"],
    ["actualizaMapa", "    ultimoIndice[c] pasa a ser R",                           "    lastIndex[c] becomes R"],
    ["actualizaMejor","    mejor pasa a ser el mayor de mejor y (R - L + 1)",        "    best becomes the larger of best and (R - L + 1)"],
    ["retorna",       "  retornar mejor",                                           "  return best"],
  ]);
  const A = C.L;

  P["3"] = {
    num: 3, slug: "longest-substring-without-repeating", title: "Longest Substring Without Repeating Characters",
    difficulty: "M", block: "sliding-window-stack", tags: ["sliding window"],
    summary: L(
      "Ventana deslizante [L,R]: guardamos el último índice donde vimos cada carácter y, si aparece repetido DENTRO de la ventana, saltamos L justo después de esa aparición en vez de moverlo de uno en uno.",
      "Sliding window [L,R]: we keep the last index where we saw each character, and if it repeats INSIDE the window, we jump L right after that occurrence instead of moving it one step at a time."),
    legend: [
      { cls: "window", label: L("ventana actual [L,R]", "current window [L,R]") },
      { cls: "hot", label: L("carácter en R", "character at R") },
    ],
    code: C,
    cases: [
      { name: L('"abcabcbb" → 3', '"abcabcbb" → 3'), input: "abcabcbb" },
      { name: L('"pwwkew" → 3', '"pwwkew" → 3'), input: "pwwkew" },
      { name: L('"abba" → 2', '"abba" → 2'), input: "abba" },
      { name: L('"bbbbb" → 1', '"bbbbb" → 1'), input: "bbbbb" },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "s", type: "text", label: L("s:", "s:"), placeholder: L("ej. abcabcbb", "ex. abcabcbb"),
          sanitize: (v) => v.replace(/[\r\n]/g, "").slice(0, 40) },
      ],
      initial() { return { s: "abcabcbb" }; },
      parse(state) {
        const s = String(state.s || "");
        if (!s.length) return { ok: false, field: "s", error: L("Escribe una cadena, no puede estar vacía.", "Type a string, it cannot be empty.") };
        return { ok: true, input: s };
      },
      previewSpec(input) {
        return { type: "array", label: L("Cadena s", "String s"),
          items: input.split("").map((ch) => ({ v: ch })), indices: true };
      },
      hint: L("Ingresa una cadena de hasta 40 caracteres.", "Enter a string of up to 40 characters.")
    },

    build(input) {
      const s = String(input || "");
      const chars = s.split("");
      const steps = [];
      const ultimoIndice = {};
      let izq = 0;
      let mejor = 0;

      const snap = (note, line, R) => {
        const win = R != null && R >= izq ? [izq, R] : [null, null];
        const markers = [];
        if (R != null) {
          markers.push({ index: izq, label: "L", cls: "" });
          if (R !== izq) markers.push({ index: R, label: "R", cls: "" });
        }
        steps.push({
          note, line,
          array: {
            label: L("Cadena s", "String s"),
            items: chars.map((ch, i) => ({ v: ch, cls: i === R ? "hot" : "" })),
            indices: true,
            windowRange: win,
            markers,
          },
          vars: [{ k: L("mejor", "best"), v: mejor, cls: "result" }],
        });
      };

      snap(L("Metemos el último índice visto de cada carácter en un mapa; L empieza en 0 y la ventana está vacía.",
             "We keep the last seen index of each character in a map; L starts at 0 and the window is empty."),
           [A.mapa, A.L0, A.mejor0], null);

      if (!chars.length) {
        snap(L("La cadena está vacía: la respuesta es 0.", "The string is empty: the answer is 0."), A.retorna, null);
        return steps;
      }

      for (let R = 0; R < chars.length; R++) {
        const c = chars[R];
        snap(L(`R avanza a ${R}: c = "${c}".`, `R moves to ${R}: c = "${c}".`), [A.porR, A.c], R);
        if (ultimoIndice[c] != null && ultimoIndice[c] >= izq) {
          const anterior = ultimoIndice[c];
          izq = anterior + 1;
          snap(L(`"${c}" ya está en la ventana (visto en ${anterior}). L salta a ${izq}.`,
                 `"${c}" is already in the window (seen at ${anterior}). L jumps to ${izq}.`),
               [A.siRepetido, A.moverL], R);
        }
        ultimoIndice[c] = R;
        mejor = Math.max(mejor, R - izq + 1);
        snap(L(`ultimoIndice["${c}"] = ${R}. Ventana [${izq},${R}], largo ${R - izq + 1}. Mejor = ${mejor}.`,
               `lastIndex["${c}"] = ${R}. Window [${izq},${R}], length ${R - izq + 1}. Best = ${mejor}.`),
             [A.actualizaMapa, A.actualizaMejor], R);
      }

      snap(L(`Subcadena más larga sin repetidos: longitud <b>${mejor}</b>.`,
             `Longest substring without repeats: length <b>${mejor}</b>.`), A.retorna, chars.length - 1);
      return steps;
    },
  };
})();
