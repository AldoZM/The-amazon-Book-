/* 295. Find Median from Data Stream — dos heaps balanceados (mitad menor / mitad mayor). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion addNum(x):",                                          "function addNum(x):"],
    ["decide",    "  si izquierda está vacía o x <= cima(izquierda): izquierda.push(x)",
                  "  if izquierda is empty or x <= top(izquierda): izquierda.push(x)"],
    ["sino",      "  si no: derecha.push(x)",                                    "  else: derecha.push(x)"],
    ["balIzq",    "  si izquierda.size() > derecha.size() + 1:                // desbalance a la izquierda",
                  "  if izquierda.size() > derecha.size() + 1:                 // left is unbalanced"],
    ["moverDer",  "    derecha.push(izquierda.pop())",                          "    derecha.push(izquierda.pop())"],
    ["balDer",    "  si no si derecha.size() > izquierda.size() + 1:           // desbalance a la derecha",
                  "  else if derecha.size() > izquierda.size() + 1:            // right is unbalanced"],
    ["moverIzq",  "    izquierda.push(derecha.pop())",                          "    izquierda.push(derecha.pop())"],
    ["fn2",       "funcion findMedian():",                                       "function findMedian():"],
    ["igual",     "  si izquierda.size() == derecha.size(): retornar (cima(izquierda)+cima(derecha))/2",
                  "  if izquierda.size() == derecha.size(): return (top(izquierda)+top(derecha))/2"],
    ["mayorIzq",  "  si izquierda.size() > derecha.size(): retornar cima(izquierda)",
                  "  if izquierda.size() > derecha.size(): return top(izquierda)"],
    ["mayorDer",  "  si no: retornar cima(derecha)",                             "  else: return top(derecha)"],
  ]);
  const A = C.L;

  P["295"] = {
    num: 295, slug: "find-median-data-stream", title: "Find Median from Data Stream",
    difficulty: "H", block: "heaps-topk", tags: ["heap", "dos heaps", "diseño"],
    summary: L(
      "Mediana de un stream de números en O(log n) por inserción: la mitad menor vive en un max-heap y la mitad mayor en un min-heap, siempre balanceados a lo más en 1.",
      "Median of a number stream in O(log n) per insertion: the smaller half lives in a max-heap and the larger half in a min-heap, always balanced within 1."),
    legend: [
      { cls: "hot", label: L("recién insertado", "just inserted") },
      { cls: "result", label: L("mediana actual", "current median") },
    ],
    code: C,
    cases: [
      { name: L("1, 2, 3 → mediana final 2", "1, 2, 3 → final median 2"), input: [1, 2, 3] },
      { name: L("5, 15, 1, 3, 8 → mediana final 5", "5, 15, 1, 3, 8 → final median 5"), input: [5, 15, 1, 3, 8] },
      { name: L("2, 2, 2 → mediana final 2", "2, 2, 2 → final median 2"), input: [2, 2, 2] },
      { name: L("1, 2, 3, 4 → mediana final 2.5", "1, 2, 3, 4 → final median 2.5"), input: [1, 2, 3, 4] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "nums", type: "text", label: L("secuencia:", "sequence:"), placeholder: L("ej. [5,15,1,3,8]", "ex. [5,15,1,3,8]") },
      ],
      initial() { return { nums: "[5,15,1,3,8]" }; },
      parse(state) {
        const n = VIS.parse.numberArray(state.nums, 12);
        if (!n.ok) return { ok: false, field: "nums", error: n.error };
        if (!n.arr.length) return { ok: false, field: "nums", error: L("La secuencia no puede estar vacía.", "The sequence cannot be empty.") };
        return { ok: true, input: n.arr };
      },
      previewSpec(input) {
        return { type: "list", label: L("secuencia addNum(x)", "addNum(x) sequence"), items: input.map((v) => ({ v, cls: "" })) };
      },
      hint: L("Ingresa la secuencia de números que llegan uno a uno.", "Enter the sequence of numbers arriving one by one."),
    },

    build(input) {
      const izquierda = []; // max-heap, mitad menor (ordenado desc, [0] = cima)
      const derecha = [];   // min-heap, mitad mayor (ordenado asc, [0] = cima)
      const steps = [];

      const topIzq = () => izquierda.length ? izquierda[0] : null;
      const topDer = () => derecha.length ? derecha[0] : null;

      const stageOf = (note, line, hotSide, hotVal) => ({
        note, line,
        stage: [
          { type: "list", label: L("Mitad menor (max-heap)", "Smaller half (max-heap)"),
            items: izquierda.map((v) => ({ v, cls: hotSide === "izq" && v === hotVal ? "hot" : "" })) },
          { type: "list", label: L("Mitad mayor (min-heap)", "Larger half (min-heap)"),
            items: derecha.map((v) => ({ v, cls: hotSide === "der" && v === hotVal ? "hot" : "" })) },
        ],
      });

      for (const x of input) {
        let side;
        if (izquierda.length === 0 || x <= topIzq()) {
          izquierda.push(x); izquierda.sort((a, b) => b - a);
          side = "izq";
          steps.push(Object.assign(stageOf(
            L(`addNum(${x}): izquierda vacía o ${x} <= cima(izquierda), va a izquierda.`,
              `addNum(${x}): izquierda empty or ${x} <= top(izquierda), goes to izquierda.`),
            [A.decide], "izq", x)));
        } else {
          derecha.push(x); derecha.sort((a, b) => a - b);
          side = "der";
          steps.push(Object.assign(stageOf(
            L(`addNum(${x}): ${x} > cima(izquierda), va a derecha.`,
              `addNum(${x}): ${x} > top(izquierda), goes to derecha.`),
            [A.sino], "der", x)));
        }

        if (izquierda.length > derecha.length + 1) {
          const mov = izquierda.shift();
          derecha.push(mov); derecha.sort((a, b) => a - b);
          steps.push(Object.assign(stageOf(
            L(`Desbalance: izquierda tenía más de 1 de sobra. Movemos ${mov} de izquierda a derecha.`,
              `Unbalanced: izquierda had more than 1 extra. Move ${mov} from izquierda to derecha.`),
            [A.balIzq, A.moverDer])));
        } else if (derecha.length > izquierda.length + 1) {
          const mov = derecha.shift();
          izquierda.push(mov); izquierda.sort((a, b) => b - a);
          steps.push(Object.assign(stageOf(
            L(`Desbalance: derecha tenía más de 1 de sobra. Movemos ${mov} de derecha a izquierda.`,
              `Unbalanced: derecha had more than 1 extra. Move ${mov} from derecha to izquierda.`),
            [A.balDer, A.moverIzq])));
        }

        let mediana, line;
        if (izquierda.length === derecha.length) {
          mediana = (topIzq() + topDer()) / 2; line = A.igual;
        } else if (izquierda.length > derecha.length) {
          mediana = topIzq(); line = A.mayorIzq;
        } else {
          mediana = topDer(); line = A.mayorDer;
        }
        const step = stageOf(
          L(`findMedian() tras insertar ${x}: <b>${mediana}</b>.`, `findMedian() after inserting ${x}: <b>${mediana}</b>.`),
          [A.fn2, line]);
        step.vars = [{ k: L("mediana", "median"), v: mediana, cls: "result" }];
        steps.push(step);
      }

      return steps;
    },
  };
})();
