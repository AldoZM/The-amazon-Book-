/* 347. Top K Frequent Elements — bucket sort por frecuencia, O(n). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion topKFrequent(nums, k):",                        "function topKFrequent(nums, k):"],
    ["freq",      "  freq empieza vacío   // mapa valor -> cuántas veces aparece",
                  "  freq starts empty    // map value -> how many times it appears"],
    ["cuenta",    "  para cada x de nums: freq[x] pasa a ser freq[x] + 1",   "  for each x in nums: freq[x] becomes freq[x] + 1"],
    ["buckets",   "  buckets empieza con n+1 listas vacías (índice = frecuencia)",
                  "  buckets starts with n+1 empty lists (index = frequency)"],
    ["llena",     "  para cada (valor, f) de freq: buckets[f].push(valor)",  "  for each (value, f) in freq: buckets[f].push(value)"],
    ["recorre",   "  para f desde n hasta 0:",                              "  for f from n down to 0:"],
    ["porValor",  "    para cada valor de buckets[f]:",                     "    for each value in buckets[f]:"],
    ["agrega",    "      agregar valor a resultado",                       "      add value to result"],
    ["paraCuando","      si resultado tiene k elementos: terminar",        "      if result has k elements: stop"],
    ["retorna",   "  retornar resultado",                                  "  return result"],
  ]);
  const A = C.L;

  P["347"] = {
    num: 347, slug: "top-k-frequent-elements", title: "Top K Frequent Elements",
    difficulty: "M", block: "heaps-topk", tags: ["bucket sort", "mapa de frecuencias", "top-k"],
    summary: L(
      "Los k valores más frecuentes, en O(n): contamos frecuencias y usamos la frecuencia misma como índice de un casillero (bucket sort), evitando ordenar.",
      "The k most frequent values, in O(n): count frequencies and use the frequency itself as a bucket index (bucket sort), avoiding a sort."),
    legend: [
      { cls: "hot", label: L("valor agregado al resultado", "value added to result") },
      { cls: "result", label: L("en el resultado final", "in the final result") },
    ],
    code: C,
    cases: [
      { name: L("[1,1,1,2,2,3], k=2 → {1,2}", "[1,1,1,2,2,3], k=2 → {1,2}"), input: { nums: [1,1,1,2,2,3], k: 2 } },
      { name: L("[4,4,5,5,6], k=3 → todos", "[4,4,5,5,6], k=3 → all"), input: { nums: [4,4,5,5,6], k: 3 } },
      { name: L("[7,7,7,7,8,9,9], k=1 → {7}", "[7,7,7,7,8,9,9], k=1 → {7}"), input: { nums: [7,7,7,7,8,9,9], k: 1 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "nums", type: "text", label: L("nums:", "nums:"), placeholder: L("ej. [1,1,1,2,2,3]", "ex. [1,1,1,2,2,3]") },
        { id: "k", type: "text", label: L("k:", "k:"), placeholder: L("2", "2") },
      ],
      initial() { return { nums: "[1,1,1,2,2,3]", k: "2" }; },
      parse(state) {
        const n = VIS.parse.numberArray(state.nums, 15);
        if (!n.ok) return { ok: false, field: "nums", error: n.error };
        if (!n.arr.length) return { ok: false, field: "nums", error: L("nums no puede estar vacío.", "nums cannot be empty.") };
        const distintos = new Set(n.arr).size;
        const k = parseInt(state.k, 10);
        if (Number.isNaN(k) || k < 1 || k > distintos) {
          return { ok: false, field: "k", error: L(`k debe ser un número entre 1 y ${distintos} (valores distintos).`, `k must be a number between 1 and ${distintos} (distinct values).`) };
        }
        return { ok: true, input: { nums: n.arr, k } };
      },
      previewSpec(input) {
        return { type: "list", label: L("nums", "nums"), items: input.nums.map((v) => ({ v, cls: "" })) };
      },
      hint: L("Ingresa nums y k. k no puede superar la cantidad de valores distintos.", "Enter nums and k. k cannot exceed the count of distinct values."),
    },

    build(input) {
      const nums = input.nums, k = input.k;
      const n = nums.length;
      const steps = [];
      const freq = new Map();

      const snapFreq = (note, line) => steps.push({ note, line,
        vars: freq.size === 0
          ? [{ k: L("freq", "freq"), v: "{}" }]
          : Array.from(freq.entries()).map(([v, f]) => ({ k: String(v), v: f })) });

      snapFreq(L("Contamos cuántas veces aparece cada valor.", "Count how many times each value appears."), A.freq);
      for (const x of nums) {
        freq.set(x, (freq.get(x) || 0) + 1);
        snapFreq(L(`freq[${x}] = ${freq.get(x)}.`, `freq[${x}] = ${freq.get(x)}.`), A.cuenta);
      }

      const buckets = Array.from({ length: n + 1 }, () => []);
      for (const [valor, f] of freq.entries()) buckets[f].push(valor);
      steps.push({ note: L(`Colocamos cada valor en buckets[frecuencia]. buckets tiene ${n + 1} casillas (0..${n}).`,
                            `Place each value in buckets[frequency]. buckets has ${n + 1} slots (0..${n}).`),
        line: [A.buckets, A.llena],
        vars: Array.from(freq.entries()).map(([v, f]) => ({ k: String(v), v: `bucket[${f}]` })) });

      const resultado = [];
      for (let f = n; f >= 0 && resultado.length < k; f--) {
        if (!buckets[f].length) continue;
        steps.push({ note: L(`Revisamos buckets[${f}] = [${buckets[f].join(", ")}].`,
                              `Check buckets[${f}] = [${buckets[f].join(", ")}].`),
          line: [A.recorre, A.porValor],
          list: { label: L("Resultado", "Result"), items: resultado.map((v) => ({ v, cls: "result" })) } });
        for (const valor of buckets[f]) {
          if (resultado.length >= k) break;
          resultado.push(valor);
          steps.push({ note: L(`Agregamos ${valor} (frecuencia ${f}) al resultado.`,
                                `Add ${valor} (frequency ${f}) to the result.`),
            line: A.agrega,
            list: { label: L("Resultado", "Result"), items: resultado.map((v) => ({ v, cls: v === valor ? "hot" : "result" })) } });
          if (resultado.length === k) {
            steps.push({ note: L(`Resultado ya tiene k=${k} elementos: terminamos.`,
                                  `Result already has k=${k} elements: stop.`),
              line: A.paraCuando,
              list: { label: L("Resultado", "Result"), items: resultado.map((v) => ({ v, cls: "result" })) } });
            break;
          }
        }
      }

      steps.push({ note: L(`Los k=${k} valores más frecuentes: <b>{${resultado.join(", ")}}</b>.`,
                            `The k=${k} most frequent values: <b>{${resultado.join(", ")}}</b>.`),
        line: A.retorna,
        list: { label: L("Resultado", "Result"), items: resultado.map((v) => ({ v, cls: "result" })) } });

      return steps;
    },
  };
})();
