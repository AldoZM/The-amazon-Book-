/* 5. Longest Palindromic Substring — expansión desde el centro (2n-1 centros posibles). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion longestPalindrome(s):",                                  "function longestPalindrome(s):"],
    ["n0",       "  si s está vacía: retornar \"\"",                               "  if s is empty: return \"\""],
    ["initBest", "  mejorInicio = 0, mejorLongitud = 1",                           "  bestStart = 0, bestLength = 1"],
    ["forC",     "  para cada centro c desde 0 hasta 2n - 2:",                     "  for each center c from 0 to 2n - 2:"],
    ["centro",   "    L, R = límites del centro c (impar = entre dos letras)",     "    L, R = bounds of center c (odd = between two letters)"],
    ["expande",  "    mientras L >= 0 y R < n y s[L] == s[R]:",                    "    while L >= 0 and R < n and s[L] == s[R]:"],
    ["mueve",    "      L pasa a L - 1; R pasa a R + 1",                           "      L becomes L - 1; R becomes R + 1"],
    ["compara",  "    si (R-1) - (L+1) + 1 > mejorLongitud:",                      "    if (R-1) - (L+1) + 1 > bestLength:"],
    ["actualiza","      mejorInicio pasa a L + 1; mejorLongitud pasa a (R-1)-(L+1)+1",
                  "      bestStart becomes L + 1; bestLength becomes (R-1)-(L+1)+1"],
    ["retorna",  "  retornar s.substr(mejorInicio, mejorLongitud)",                "  return s.substr(bestStart, bestLength)"],
  ]);
  const A = C.L;

  P["5"] = {
    num: 5, slug: "longest-palindromic-substring", title: "Longest Palindromic Substring",
    difficulty: "M", block: "dp", tags: ["two pointers", "expansión desde el centro"],
    summary: L(
      "Substring palíndromo más largo, expandiendo desde cada uno de los 2n-1 centros posibles (n de un carácter, n-1 entre pares).",
      "Longest palindromic substring, expanding from each of the 2n-1 possible centers (n single-character, n-1 between-pairs)."),
    legend: [
      { label: L("L / R: punteros de expansión", "L / R: expansion pointers") },
    ],
    code: C,
    cases: [
      { name: L('"babad" → "bab"', '"babad" → "bab"'), input: "babad" },
      { name: L('"" → ""', '"" → ""'), input: "" },
      { name: L('"a" → "a"', '"a" → "a"'), input: "a" },
      { name: L('"cbbd" → "bb"', '"cbbd" → "bb"'), input: "cbbd" },
      { name: L('"racecar" → "racecar"', '"racecar" → "racecar"'), input: "racecar" },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "s", type: "text", label: L("Cadena (s):", "String (s):"), placeholder: L("ej. babad", "ex. babad"),
          maxlength: 10, sanitize: (v) => v.slice(0, 10) },
      ],
      initial() { return { s: "babad" }; },
      parse(state) {
        const s = String(state.s == null ? "" : state.s);
        if (s.length > 10) return { ok: false, field: "s", error: L("Máximo 10 caracteres (para no generar demasiados pasos).", "Max 10 characters (to avoid too many steps).") };
        return { ok: true, input: s };
      },
      previewSpec(input) {
        return { type: "array", label: L("s", "s"), items: [...input].map((ch) => ({ v: ch, cls: "" })), indices: true };
      },
      hint: L("Escribe una cadena corta (máximo 10 caracteres).", "Enter a short string (max 10 characters)."),
    },

    build(input) {
      const s = input;
      const n = s.length;
      const steps = [];

      if (n === 0) {
        steps.push({
          note: L('Cadena vacía: no hay nada que expandir. Retornamos "".', 'Empty string: nothing to expand. Return "".'),
          line: A.n0,
          array: { label: L("s", "s"), items: [], indices: true },
        });
        return steps;
      }

      let mejorInicio = 0, mejorLongitud = 1;

      const snap = (note, line, Lp, Rp) => {
        const items = [...s].map((ch) => ({ v: ch, cls: "" }));
        const markers = [];
        if (Lp != null) markers.push({ index: Lp, label: "L", cls: "" });
        if (Rp != null) markers.push({ index: Rp, label: "R", cls: "" });
        let windowRange = null;
        if (Lp != null && Rp != null && Lp >= 0 && Rp < n && Lp <= Rp) windowRange = [Lp, Rp];
        steps.push({ note, line,
          array: { label: L("s", "s"), items, indices: true, windowRange, markers },
          vars: [{ k: L("mejor", "best"), v: s.substr(mejorInicio, mejorLongitud) }] });
      };

      snap(L("mejorInicio = 0, mejorLongitud = 1: todo carácter solo ya es un palíndromo.",
             "bestStart = 0, bestLength = 1: every single character is already a palindrome."), A.initBest, null, null);

      for (let c = 0; c < 2 * n - 1; c++) {
        let Lp = Math.floor(c / 2);
        let Rp = (c % 2 === 0) ? Math.floor(c / 2) : Math.floor(c / 2) + 1;
        snap(L(`Centro c=${c}: L=${Lp}, R=${Rp}${c % 2 === 0 ? " (un carácter)" : " (entre dos caracteres)"}.`,
               `Center c=${c}: L=${Lp}, R=${Rp}${c % 2 === 0 ? " (single char)" : " (between two chars)"}.`),
             [A.forC, A.centro], Lp, Rp);

        while (Lp >= 0 && Rp < n && s[Lp] === s[Rp]) {
          snap(L(`s[${Lp}]='${s[Lp]}' == s[${Rp}]='${s[Rp]}': expandimos hacia afuera.`,
                 `s[${Lp}]='${s[Lp]}' == s[${Rp}]='${s[Rp]}': expand outward.`), [A.expande, A.mueve], Lp, Rp);
          Lp--; Rp++;
        }

        const longitud = (Rp - 1) - (Lp + 1) + 1;
        const LMostrar = Lp + 1 <= Rp - 1 ? Lp + 1 : null;
        const RMostrar = Lp + 1 <= Rp - 1 ? Rp - 1 : null;
        if (longitud > mejorLongitud) {
          mejorLongitud = longitud;
          mejorInicio = Lp + 1;
          snap(L(`Palíndromo "${s.substr(mejorInicio, mejorLongitud)}" (longitud ${longitud}) supera al mejor anterior. Actualizamos.`,
                 `Palindrome "${s.substr(mejorInicio, mejorLongitud)}" (length ${longitud}) beats the previous best. Update.`),
               [A.compara, A.actualiza], LMostrar, RMostrar);
        } else {
          snap(L(`Palíndromo de longitud ${longitud} no supera al mejor actual (${mejorLongitud}).`,
                 `Palindrome of length ${longitud} does not beat the current best (${mejorLongitud}).`),
               A.compara, LMostrar, RMostrar);
        }
      }

      snap(L(`Respuesta: "${s.substr(mejorInicio, mejorLongitud)}" (longitud ${mejorLongitud}).`,
             `Answer: "${s.substr(mejorInicio, mejorLongitud)}" (length ${mejorLongitud}).`),
           A.retorna, mejorInicio, mejorInicio + mejorLongitud - 1);

      return steps;
    },
  };
})();
