/* 139. Word Break — DP 1D booleana: dp[i] = ¿el prefijo de longitud i se parte con el diccionario? */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion wordBreak(s, wordDict):",                             "function wordBreak(s, wordDict):"],
    ["dictSet",  "  dict pasa a ser un conjunto de palabras (búsqueda O(1))",     "  dict becomes a set of words (O(1) lookup)"],
    ["dp0",      "  dp[0] = verdadero (la cadena vacía siempre se puede partir)", "  dp[0] = true (the empty string can always be split)"],
    ["forI",     "  para i desde 1 hasta n:",                                    "  for i from 1 to n:"],
    ["forJ",     "    para cada j desde 0 hasta i - 1:",                         "    for each j from 0 to i - 1:"],
    ["revisa",   "      si dp[j] es verdadero y s[j..i) está en dict:",          "      if dp[j] is true and s[j..i) is in dict:"],
    ["marca",    "        dp[i] pasa a ser verdadero; dejamos de probar más j",  "        dp[i] becomes true; stop trying more j"],
    ["retorna",  "  retornar dp[n]",                                            "  return dp[n]"],
  ]);
  const A = C.L;

  P["139"] = {
    num: 139, slug: "word-break", title: "Word Break",
    difficulty: "M", block: "dp", tags: ["DP", "arreglo 1D"],
    summary: L(
      "¿Se puede partir s en palabras del diccionario? DP 1D booleana: dp[i] es verdadero si existe un corte j tal que dp[j] es verdadero y s[j..i) es una palabra del diccionario.",
      "Can s be split into dictionary words? 1D boolean DP: dp[i] is true if there is a cut j such that dp[j] is true and s[j..i) is a dictionary word."),
    legend: [
      { cls: "hot", label: L("prefijo i actual", "current prefix i") },
      { cls: "match", label: L("dp[i] se vuelve verdadero", "dp[i] becomes true") },
    ],
    code: C,
    cases: [
      { name: L('"leetcode", [leet,code] → true', '"leetcode", [leet,code] → true'), input: { s: "leetcode", dict: ["leet", "code"] } },
      { name: L('"", [a,b] → true', '"", [a,b] → true'), input: { s: "", dict: ["a", "b"] } },
      { name: L('"hola", [hola] → true', '"hola", [hola] → true'), input: { s: "hola", dict: ["hola"] } },
      { name: L('"catsandog" → false', '"catsandog" → false'), input: { s: "catsandog", dict: ["cats", "dog", "sand", "and", "cat"] } },
      { name: L('"catsanddog" → true', '"catsanddog" → true'), input: { s: "catsanddog", dict: ["cats", "dog", "sand", "and", "cat"] } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "s", type: "text", label: L("Cadena (s):", "String (s):"), placeholder: L("ej. leetcode", "ex. leetcode"),
          maxlength: 15, sanitize: (v) => v.slice(0, 15) },
        { id: "dict", type: "text", label: L("Diccionario (separado por comas):", "Dictionary (comma-separated):"), placeholder: L("ej. leet, code", "ex. leet, code") },
      ],
      initial() { return { s: "leetcode", dict: "leet, code" }; },
      parse(state) {
        const s = String(state.s == null ? "" : state.s).trim();
        if (s.length > 15) return { ok: false, field: "s", error: L("Máximo 15 caracteres.", "Max 15 characters.") };
        const dict = String(state.dict == null ? "" : state.dict)
          .split(",").map((w) => w.trim()).filter(Boolean);
        if (!dict.length) return { ok: false, field: "dict", error: L("Escribe al menos una palabra en el diccionario.", "Enter at least one word in the dictionary.") };
        if (dict.length > 8) return { ok: false, field: "dict", error: L("Máximo 8 palabras.", "Max 8 words.") };
        return { ok: true, input: { s, dict } };
      },
      previewSpec(input) {
        return { type: "array", label: L("s", "s"), items: [...input.s].map((ch) => ({ v: ch, cls: "" })), indices: true };
      },
      hint: L("Escribe la cadena y el diccionario de palabras (separadas por comas).", "Enter the string and the word dictionary (comma-separated)."),
    },

    build(input) {
      const s = input.s, dict = input.dict;
      const n = s.length;
      const dictSet = new Set(dict);
      const dp = new Array(n + 1).fill(false);
      const steps = [];

      const snap = (note, line, opt) => {
        opt = opt || {};
        const i = opt.i, j = opt.j;
        const markers = [];
        if (i != null) markers.push({ index: i, label: "i", cls: "" });
        if (j != null) markers.push({ index: j, label: "j", cls: "" });
        const items = dp.map((v, idx) => ({
          v: v ? "V" : "F",
          cls: idx === i ? (opt.matched ? "match" : "hot") : "",
        }));
        steps.push({ note, line,
          array: { label: L("dp (prefijo se puede partir)", "dp (prefix is breakable)"), items, indices: true, markers },
          vars: opt.vars });
      };

      snap(L("Metemos las palabras del diccionario en un conjunto (búsqueda O(1)).",
             "Put the dictionary words into a set (O(1) lookup)."), A.dictSet,
           { vars: [{ k: L("diccionario", "dictionary"), v: dict.join(", ") }] });

      dp[0] = true;
      snap(L("dp[0] = verdadero: la cadena vacía siempre se puede partir (caso base).",
             "dp[0] = true: the empty string can always be split (base case)."), A.dp0, { i: 0, matched: true });

      for (let i = 1; i <= n; i++) {
        snap(L(`Buscamos un corte j para el prefijo de longitud ${i} ("${s.slice(0, i)}").`,
               `Look for a cut j for the prefix of length ${i} ("${s.slice(0, i)}").`), A.forI, { i });
        for (let j = 0; j < i; j++) {
          const palabra = s.slice(j, i);
          const enDicc = dictSet.has(palabra);
          snap(L(`j=${j}: ¿dp[${j}] es verdadero y "${palabra}" está en dict?`,
                 `j=${j}: is dp[${j}] true and "${palabra}" in dict?`), A.forJ,
               { i, j, vars: [{ k: L("palabra", "word"), v: palabra }] });
          if (dp[j] && enDicc) {
            dp[i] = true;
            snap(L(`dp[${j}] es verdadero y "${palabra}" está en dict → dp[${i}] = verdadero.`,
                   `dp[${j}] is true and "${palabra}" is in dict → dp[${i}] = true.`), [A.revisa, A.marca],
                 { i, j, matched: true, vars: [{ k: L("palabra", "word"), v: palabra }] });
            break;
          }
        }
        if (!dp[i]) {
          snap(L(`Ningún corte funcionó para el prefijo de longitud ${i}: dp[${i}] queda en falso.`,
                 `No cut worked for the prefix of length ${i}: dp[${i}] stays false.`), A.revisa, { i });
        }
      }

      snap(L(`dp[${n}] = ${dp[n] ? "verdadero" : "falso"} → respuesta: <b>${dp[n]}</b>.`,
             `dp[${n}] = ${dp[n] ? "true" : "false"} → answer: <b>${dp[n]}</b>.`), A.retorna, { i: n, matched: dp[n] });

      return steps;
    },
  };
})();
