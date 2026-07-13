/* 215. Kth Largest Element in an Array — min-heap de tamaño k. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion findKthLargest(nums, k):",                     "function findKthLargest(nums, k):"],
    ["heap",     "  heap empieza vacío   // min-heap: la cima es el MENOR del heap",
                 "  heap starts empty    // min-heap: the top is the SMALLEST in the heap"],
    ["porCada",  "  para cada x de nums:",                                "  for each x in nums:"],
    ["push",     "    heap.push(x)",                                     "    heap.push(x)"],
    ["siMayor",  "    si heap.size() > k:                        // sobra el menor de los k+1",
                 "    if heap.size() > k:                         // the smallest of the k+1 is extra"],
    ["pop",      "      heap.pop()          // sacamos el menor: no puede ser top-k",
                 "      heap.pop()          // remove the smallest: it can't be top-k"],
    ["retorna",  "  retornar heap.top()     // la cima es el k-ésimo más grande",
                 "  return heap.top()       // the top is the kth largest"],
  ]);
  const A = C.L;

  P["215"] = {
    num: 215, slug: "kth-largest-element", title: "Kth Largest Element in an Array",
    difficulty: "M", block: "heaps-topk", tags: ["heap", "min-heap", "top-k"],
    summary: L(
      "El k-ésimo elemento más grande de un arreglo, mantenido con un min-heap de tamaño k: cada vez que el heap crece más de k, se saca el menor, porque ya no puede ser top-k.",
      "The kth largest element of an array, kept with a size-k min-heap: whenever the heap grows past k, the smallest is popped, since it can no longer be top-k."),
    legend: [
      { cls: "hot", label: L("recién insertado / sacado", "just inserted / popped") },
      { cls: "result", label: L("respuesta (cima del heap)", "answer (heap top)") },
    ],
    code: C,
    cases: [
      { name: L("[3,2,1,5,6,4], k=2 → 5", "[3,2,1,5,6,4], k=2 → 5"), input: { nums: [3,2,1,5,6,4], k: 2 } },
      { name: L("[3,2,3,1,2,4,5,5,6], k=4 → 4", "[3,2,3,1,2,4,5,5,6], k=4 → 4"), input: { nums: [3,2,3,1,2,4,5,5,6], k: 4 } },
      { name: L("[2,2,2,1], k=3 → 2", "[2,2,2,1], k=3 → 2"), input: { nums: [2,2,2,1], k: 3 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "nums", type: "text", label: L("nums:", "nums:"), placeholder: L("ej. [3,2,1,5,6,4]", "ex. [3,2,1,5,6,4]") },
        { id: "k", type: "text", label: L("k:", "k:"), placeholder: L("2", "2") },
      ],
      initial() { return { nums: "[3,2,1,5,6,4]", k: "2" }; },
      parse(state) {
        const n = VIS.parse.numberArray(state.nums, 15);
        if (!n.ok) return { ok: false, field: "nums", error: n.error };
        if (!n.arr.length) return { ok: false, field: "nums", error: L("nums no puede estar vacío.", "nums cannot be empty.") };
        const k = parseInt(state.k, 10);
        if (Number.isNaN(k) || k < 1 || k > n.arr.length) {
          return { ok: false, field: "k", error: L(`k debe ser un número entre 1 y ${n.arr.length}.`, `k must be a number between 1 and ${n.arr.length}.`) };
        }
        return { ok: true, input: { nums: n.arr, k } };
      },
      previewSpec(input) {
        return { type: "list", label: L("nums", "nums"), items: input.nums.map((v) => ({ v, cls: "" })) };
      },
      hint: L("Ingresa nums y k. k no puede superar el tamaño del arreglo.", "Enter nums and k. k cannot exceed the array size."),
    },

    build(input) {
      const nums = input.nums, k = input.k;
      const heap = [];
      const steps = [];

      const snap = (note, line, extra) => steps.push(Object.assign({ note, line,
        list: { label: L(`Heap de tamaño k (k=${k})`, `Size-k heap (k=${k})`),
          items: heap.slice().sort((a, b) => a - b).map((v) => ({ v, cls: extra && extra.hot === v ? "hot" : "" })) } }, extra));

      snap(L(`Min-heap vacío. Recorremos nums insertando y recortando a tamaño k=${k}.`,
             `Empty min-heap. We walk nums, inserting and trimming down to size k=${k}.`),
           A.heap, { vars: [{ k: L("actual", "current"), v: "-" }] });

      for (const x of nums) {
        heap.push(x);
        snap(L(`Insertamos ${x} en el heap.`, `Insert ${x} into the heap.`),
             [A.porCada, A.push], { vars: [{ k: L("actual", "current"), v: x }], hot: x });
        if (heap.length > k) {
          heap.sort((a, b) => a - b);
          const sacado = heap.shift();
          snap(L(`Tamaño ${heap.length + 1} > k: sacamos el menor (${sacado}), no puede ser top-k.`,
                 `Size ${heap.length + 1} > k: pop the smallest (${sacado}), it can't be top-k.`),
               [A.siMayor, A.pop], { vars: [{ k: L("sacado", "popped"), v: sacado }] });
        }
      }

      heap.sort((a, b) => a - b);
      const ans = heap[0];
      steps.push({ note: L(`El heap tiene los k=${k} mayores; su cima es la respuesta: <b>${ans}</b>.`,
                            `The heap holds the k=${k} largest; its top is the answer: <b>${ans}</b>.`),
        line: A.retorna,
        list: { label: L(`Heap de tamaño k (k=${k})`, `Size-k heap (k=${k})`),
          items: heap.map((v, i) => ({ v, cls: i === 0 ? "result" : "" })) },
        vars: [{ k: L("respuesta", "answer"), v: ans, cls: "result" }] });

      return steps;
    },
  };
})();
