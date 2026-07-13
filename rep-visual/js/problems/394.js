/* 394. Decode String — pila explícita de (cadena anterior, repeticiones)
   para manejar corchetes k[cadena] anidados de forma iterativa. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",             "funcion decodificar(s):",                                     "function decodeString(s):"],
    ["pilaVacia",      "  pila empieza vacía   // pares (cadena anterior, repeticiones)",
                        "  stack starts empty   // pairs (previous string, repeat count)"],
    ["actualVacia",    "  actual empieza en \"\"",                                      "  current starts at \"\""],
    ["numero0",        "  número empieza en 0",                                        "  number starts at 0"],
    ["porC",           "  para cada carácter c en s:",                                 "  for each character c in s:"],
    ["esDigito",       "    si c es dígito:",                                          "    if c is a digit:"],
    ["actualizaNumero","      número pasa a ser número × 10 + valor(c)",               "      number becomes number × 10 + value(c)"],
    ["esAbre",         "    si c == '[':",                                             "    if c == '[':"],
    ["pushPila",       "      pila.push( (actual, número) )",                          "      stack.push( (current, number) )"],
    ["actualLimpia",   "      actual pasa a ser \"\"",                                   "      current becomes \"\""],
    ["numeroLimpia",   "      número pasa a ser 0",                                    "      number becomes 0"],
    ["esCierra",       "    si c == ']':",                                             "    if c == ']':"],
    ["popPila",        "      (cadenaAnterior, repeticiones) = pila.pop()",            "      (previousString, repeatCount) = stack.pop()"],
    ["bloque",         "      bloque pasa a ser actual",                               "      block becomes current"],
    ["repite",         "      actual pasa a ser cadenaAnterior + (bloque repetido repeticiones veces)",
                        "      current becomes previousString + (block repeated repeatCount times)"],
    ["esLetra",        "    si no (letra normal):",                                    "    otherwise (regular letter):"],
    ["agregaLetra",    "      actual pasa a ser actual + c",                           "      current becomes current + c"],
    ["retorna",        "  retornar actual",                                            "  return current"],
  ]);
  const A = C.L;

  P["394"] = {
    num: 394, slug: "decode-string", title: "Decode String",
    difficulty: "M", block: "sliding-window-stack", tags: ["pila"],
    summary: L(
      "Pila explícita de (cadena congelada, repeticiones pendientes). Cada '[' abre un nivel nuevo y congela lo que llevábamos; cada ']' repite lo construido en ese nivel y lo pega de vuelta, como una recursión pero iterativa.",
      "Explicit stack of (frozen string, pending repeat count). Each '[' opens a new level and freezes what we had; each ']' repeats what was built at that level and glues it back, like recursion but iterative."),
    legend: [
      { cls: "hot", label: L("elemento tope de la pila", "top-of-stack item") },
      { cls: "result", label: L("cadena construida", "built string") },
    ],
    code: C,
    cases: [
      { name: L('"3[a]2[bc]" → "aaabcbc"', '"3[a]2[bc]" → "aaabcbc"'), input: "3[a]2[bc]" },
      { name: L('"3[a2[c]]" → "accaccacc"', '"3[a2[c]]" → "accaccacc"'), input: "3[a2[c]]" },
      { name: L('"10[a]" → "aaaaaaaaaa"', '"10[a]" → "aaaaaaaaaa"'), input: "10[a]" },
      { name: L('"abc" → "abc"', '"abc" → "abc"'), input: "abc" },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "s", type: "text", label: L("s:", "s:"), placeholder: L("ej. 3[a2[c]]", "ex. 3[a2[c]]"),
          sanitize: (v) => v.replace(/[^a-z0-9\[\]]/g, "").slice(0, 30) },
      ],
      initial() { return { s: "3[a2[c]]" }; },
      parse(state) {
        const raw = String(state.s || "");
        if (!raw.length) return { ok: false, field: "s", error: L("Escribe una cadena codificada, ej. 3[a2[c]].", "Type an encoded string, ex. 3[a2[c]].") };
        if (!/^[a-z0-9\[\]]+$/.test(raw)) {
          return { ok: false, field: "s", error: L("Solo letras minúsculas, dígitos y corchetes [ ].", "Only lowercase letters, digits, and brackets [ ] are allowed.") };
        }
        let profundidad = 0;
        for (const ch of raw) {
          if (ch === "[") profundidad++;
          else if (ch === "]") {
            profundidad--;
            if (profundidad < 0) return { ok: false, field: "s", error: L("Hay un ']' sin su '[' correspondiente.", "There is a ']' without a matching '['.") };
          }
        }
        if (profundidad !== 0) return { ok: false, field: "s", error: L("Falta cerrar algún '['.", "Some '[' is not closed.") };
        return { ok: true, input: raw };
      },
      previewSpec(input) {
        return { type: "array", label: L("Cadena codificada", "Encoded string"),
          items: input.split("").map((ch) => ({ v: ch })), indices: true };
      },
      hint: L("Solo minúsculas, dígitos y corchetes [ ] balanceados (máx. 30 caracteres).", "Only lowercase letters, digits, and balanced brackets [ ] (max 30 characters).")
    },

    build(input) {
      const s = String(input || "");
      const steps = [];
      const pila = [];
      let actual = "";
      let numero = 0;

      const snap = (note, line) => {
        steps.push({
          note, line,
          stack: {
            label: L("Pila (cadena previa × repeticiones)", "Stack (previous string × repeats)"),
            items: pila.map((f, i) => ({ v: `"${f.prev || "ε"}" × ${f.reps}`, cls: i === pila.length - 1 ? "hot" : "" })),
          },
          vars: [
            { k: L("actual", "current"), v: actual === "" ? "ε" : actual, cls: "result" },
            { k: L("número pendiente", "pending number"), v: numero },
          ],
        });
      };

      if (!s.length) {
        snap(L("Cadena vacía: no hay nada que decodificar.", "Empty string: nothing to decode."), A.retorna);
        return steps;
      }

      snap(L('Pila vacía, actual = "", número = 0.', 'Empty stack, current = "", number = 0.'),
           [A.pilaVacia, A.actualVacia, A.numero0]);

      for (const c of s) {
        if (/[0-9]/.test(c)) {
          numero = numero * 10 + Number(c);
          snap(L(`"${c}" es dígito: número = ${numero}.`, `"${c}" is a digit: number = ${numero}.`),
               [A.porC, A.esDigito, A.actualizaNumero]);
        } else if (c === "[") {
          pila.push({ prev: actual, reps: numero });
          actual = "";
          numero = 0;
          const marco = pila[pila.length - 1];
          snap(L(`"[": empujamos ("${marco.prev || "ε"}", ×${marco.reps}) y abrimos un nivel nuevo.`,
                 `"[": push ("${marco.prev || "ε"}", ×${marco.reps}) and open a new level.`),
               [A.porC, A.esAbre, A.pushPila, A.actualLimpia, A.numeroLimpia]);
        } else if (c === "]") {
          const marco = pila.pop();
          const bloque = actual;
          actual = marco.prev + bloque.repeat(marco.reps);
          snap(L(`"]": repetimos "${bloque}" ×${marco.reps} y lo pegamos a "${marco.prev || "ε"}" → "${actual}".`,
                 `"]": repeat "${bloque}" ×${marco.reps} and attach it to "${marco.prev || "ε"}" → "${actual}".`),
               [A.porC, A.esCierra, A.popPila, A.bloque, A.repite]);
        } else {
          actual += c;
          snap(L(`"${c}" es letra normal: actual = "${actual}".`, `"${c}" is a regular letter: current = "${actual}".`),
               [A.porC, A.esLetra, A.agregaLetra]);
        }
      }

      snap(L(`Cadena decodificada: <b>"${actual}"</b>.`, `Decoded string: <b>"${actual}"</b>.`), A.retorna);
      return steps;
    },
  };
})();
