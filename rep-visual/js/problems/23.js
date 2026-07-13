/* 23. Merge k Sorted Lists — min-heap con la cabeza actual de cada lista. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion mergeKLists(lists):",                              "function mergeKLists(lists):"],
    ["heap",      "  heap empieza vacío   // min-heap por valor de nodo",       "  heap starts empty    // min-heap by node value"],
    ["init",      "  para cada lista no vacía: heap.push(su primer nodo)",      "  for each non-empty list: heap.push(its first node)"],
    ["resultado", "  resultado empieza vacío",                                 "  resultado starts empty"],
    ["mientras",  "  mientras heap no esté vacío:",                            "  while heap is not empty:"],
    ["saca",      "    menor pasa a ser heap.pop()      // el nodo de menor valor",
                  "    menor becomes heap.pop()         // the node with the smallest value"],
    ["agrega",    "    agregar menor a resultado",                            "    add menor to resultado"],
    ["siguiente", "    si menor tiene un siguiente: heap.push(ese siguiente)",  "    if menor has a next node: heap.push(that next node)"],
    ["retorna",   "  retornar resultado",                                     "  return resultado"],
  ]);
  const A = C.L;

  P["23"] = {
    num: 23, slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists",
    difficulty: "H", block: "heaps-topk", tags: ["heap", "listas enlazadas", "k vías"],
    summary: L(
      "Fusiona k listas ya ordenadas en una sola, usando un min-heap con la cabeza actual de cada lista: sacar el menor de k candidatos cuesta O(log k) en vez de O(k).",
      "Merges k already-sorted lists into one, using a min-heap with the current head of each list: popping the smallest of k candidates costs O(log k) instead of O(k)."),
    legend: [
      { cls: "hot", label: L("valor recién elegido del heap", "value just chosen from the heap") },
    ],
    code: C,
    cases: [
      { name: L("[[1,4,5],[1,3,4],[2,6]]", "[[1,4,5],[1,3,4],[2,6]]"), input: [[1,4,5],[1,3,4],[2,6]] },
      { name: L("[[10,20],[1,15,30]]", "[[10,20],[1,15,30]]"), input: [[10,20],[1,15,30]] },
      { name: L("[[],[5],[]] (listas vacías)", "[[],[5],[]] (empty lists)"), input: [[],[5],[]] },
    ],

    build(input) {
      // Copia mutable: cada lista es una cola de valores (equivalente a los
      // nodos restantes de la lista enlazada original).
      const listas = input.map((l) => l.slice());
      const kLen = listas.length;
      const resultado = [];
      const steps = [];

      // El heap guarda { valor, lista } — de qué lista viene cada candidato.
      let heap = [];

      const stageOf = (note, line, hotIdx) => ({
        note, line,
        stage: [
          ...listas.map((l, i) => ({ type: "list", label: L(`Lista ${i}`, `List ${i}`),
            items: l.map((v) => ({ v, cls: "" })) })),
          { type: "list", label: L("Resultado fusionado", "Merged result"),
            items: resultado.map((v, i) => ({ v, cls: i === hotIdx ? "hot" : "" })) },
        ],
      });

      steps.push(stageOf(
        L("Metemos la cabeza de cada lista no vacía al heap.", "Push the head of each non-empty list into the heap."),
        [A.heap, A.init]));

      for (let i = 0; i < kLen; i++) {
        if (listas[i].length) heap.push({ valor: listas[i][0], lista: i });
      }

      steps.push(Object.assign(stageOf(
        L(`Heap inicial: {${heap.map((h) => h.valor).join(", ")}}. resultado empieza vacío.`,
          `Initial heap: {${heap.map((h) => h.valor).join(", ")}}. resultado starts empty.`),
        [A.resultado]), { vars: [{ k: L("heap", "heap"), v: `{${heap.map((h) => h.valor).join(", ")}}` }] }));

      while (heap.length) {
        heap.sort((a, b) => a.valor - b.valor);
        const menor = heap.shift();
        // Consumimos el valor de esa lista (equivalente a avanzar el puntero).
        listas[menor.lista].shift();
        resultado.push(menor.valor);

        steps.push(Object.assign(stageOf(
          L(`Sacamos el menor del heap: ${menor.valor} (de la lista ${menor.lista}). Lo agregamos al resultado.`,
            `Pop the smallest from the heap: ${menor.valor} (from list ${menor.lista}). Add it to the result.`),
          [A.mientras, A.saca, A.agrega], resultado.length - 1),
          { vars: [{ k: L("heap", "heap"), v: `{${heap.map((h) => h.valor).join(", ")}}` }] }));

        if (listas[menor.lista].length) {
          const sig = listas[menor.lista][0];
          heap.push({ valor: sig, lista: menor.lista });
          steps.push(Object.assign(stageOf(
            L(`La lista ${menor.lista} tiene siguiente (${sig}): lo metemos al heap.`,
              `List ${menor.lista} has a next value (${sig}): push it into the heap.`),
            [A.siguiente]),
            { vars: [{ k: L("heap", "heap"), v: `{${heap.map((h) => h.valor).join(", ")}}` }] }));
        }
      }

      steps.push(stageOf(
        L(`Heap vacío: la lista fusionada es <b>[${resultado.join(", ")}]</b>.`,
          `Empty heap: the merged list is <b>[${resultado.join(", ")}]</b>.`),
        [A.retorna]));

      return steps;
    },
  };
})();
