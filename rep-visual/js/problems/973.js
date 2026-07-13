/* 973. K Closest Points to Origin — max-heap de tamaño k por distancia al cuadrado. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion kClosest(points, k):",                          "function kClosest(points, k):"],
    ["heap",     "  heap empieza vacío   // max-heap: la cima es el MÁS LEJANO",
                 "  heap starts empty    // max-heap: the top is the FARTHEST"],
    ["porCada",  "  para cada punto p de points:",                        "  for each point p in points:"],
    ["d2",       "    d2 pasa a ser x*x + y*y      // distancia al cuadrado, sin sqrt",
                 "    d2 becomes x*x + y*y         // squared distance, no sqrt"],
    ["push",     "    heap.push((d2, p))",                                "    heap.push((d2, p))"],
    ["siMayor",  "    si heap.size() > k:                        // sobra el más lejano de los k+1",
                 "    if heap.size() > k:                         // the farthest of the k+1 is extra"],
    ["pop",      "      heap.pop()          // sacamos el más lejano: no puede ser top-k cercano",
                 "      heap.pop()          // remove the farthest: it can't be top-k closest"],
    ["retorna",  "  retornar los puntos que quedan en heap",               "  return the points left in heap"],
  ]);
  const A = C.L;

  const d2 = (p) => p[0] * p[0] + p[1] * p[1];
  const fmt = (p) => `(${p[0]},${p[1]})`;

  P["973"] = {
    num: 973, slug: "k-closest-points", title: "K Closest Points to Origin",
    difficulty: "M", block: "heaps-topk", tags: ["heap", "max-heap", "top-k", "distancia"],
    summary: L(
      "Los k puntos más cercanos al origen, con un max-heap de tamaño k por distancia al cuadrado: cada vez que el heap crece más de k, se saca el más lejano.",
      "The k points closest to the origin, using a size-k max-heap by squared distance: whenever the heap grows past k, the farthest is popped."),
    legend: [
      { cls: "hot", label: L("recién insertado / sacado", "just inserted / popped") },
      { cls: "result", label: L("en el resultado final", "in the final result") },
    ],
    code: C,
    cases: [
      { name: L("[[1,3],[-2,2]], k=1", "[[1,3],[-2,2]], k=1"), input: { points: [[1,3],[-2,2]], k: 1 } },
      { name: L("[[3,3],[5,-1],[-2,4]], k=3", "[[3,3],[5,-1],[-2,4]], k=3"), input: { points: [[3,3],[5,-1],[-2,4]], k: 3 } },
      { name: L("[[10,0],[1,0],[0,2]], k=2", "[[10,0],[1,0],[0,2]], k=2"), input: { points: [[10,0],[1,0],[0,2]], k: 2 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "points", type: "text", label: L("points:", "points:"), placeholder: L("ej. [[1,3],[-2,2]]", "ex. [[1,3],[-2,2]]") },
        { id: "k", type: "text", label: L("k:", "k:"), placeholder: L("1", "1") },
      ],
      initial() { return { points: "[[1,3],[-2,2]]", k: "1" }; },
      parse(state) {
        let s = String(state.points || "").trim();
        let arr;
        try { arr = JSON.parse(s); }
        catch (e) { return { ok: false, field: "points", error: L("Sintaxis inválida. Verifica corchetes.", "Invalid syntax. Check brackets.") }; }
        if (!Array.isArray(arr) || !arr.length) return { ok: false, field: "points", error: L("Debe ser una lista de puntos no vacía.", "Must be a non-empty list of points.") };
        if (arr.length > 12) return { ok: false, field: "points", error: L("Demasiados puntos. Caben 12.", "Too many points. The limit is 12.") };
        for (const p of arr) {
          if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || !Number.isInteger(p[1])) {
            return { ok: false, field: "points", error: L("Cada punto debe ser [x,y] con enteros.", "Each point must be [x,y] with integers.") };
          }
        }
        const k = parseInt(state.k, 10);
        if (Number.isNaN(k) || k < 1 || k > arr.length) {
          return { ok: false, field: "k", error: L(`k debe ser un número entre 1 y ${arr.length}.`, `k must be a number between 1 and ${arr.length}.`) };
        }
        return { ok: true, input: { points: arr, k } };
      },
      previewSpec(input) {
        return { type: "list", label: L("points", "points"), items: input.points.map((p) => ({ v: fmt(p), cls: "" })) };
      },
      hint: L("Ingresa points como [[x,y],...] y k. k no puede superar la cantidad de puntos.", "Enter points as [[x,y],...] and k. k cannot exceed the number of points."),
    },

    build(input) {
      const points = input.points, k = input.k;
      const heap = []; // { p, d }
      const steps = [];

      const snap = (note, line, extra) => steps.push(Object.assign({ note, line,
        list: { label: L(`Heap de tamaño k (k=${k})`, `Size-k heap (k=${k})`),
          items: heap.slice().sort((a, b) => a.d - b.d).reverse()
            .map((it) => ({ v: fmt(it.p), cls: extra && extra.hotP === it.p ? "hot" : "" })) } }, extra));

      snap(L(`Max-heap vacío. Recorremos points insertando y recortando a tamaño k=${k}.`,
             `Empty max-heap. We walk points, inserting and trimming down to size k=${k}.`),
           A.heap, { vars: [{ k: L("d²", "d²"), v: "-" }] });

      for (const p of points) {
        const d = d2(p);
        snap(L(`Punto ${fmt(p)}: d² = ${p[0]}² + ${p[1]}² = ${d}.`, `Point ${fmt(p)}: d² = ${p[0]}² + ${p[1]}² = ${d}.`),
             [A.porCada, A.d2], { vars: [{ k: "d²", v: d }] });
        const item = { p, d };
        heap.push(item);
        snap(L(`Insertamos ${fmt(p)} (d²=${d}) en el heap.`, `Insert ${fmt(p)} (d²=${d}) into the heap.`),
             A.push, { vars: [{ k: "d²", v: d }], hotP: p });
        if (heap.length > k) {
          heap.sort((a, b) => b.d - a.d);
          const sacado = heap.shift();
          snap(L(`Tamaño ${heap.length + 1} > k: sacamos el más lejano ${fmt(sacado.p)} (d²=${sacado.d}).`,
                 `Size ${heap.length + 1} > k: pop the farthest ${fmt(sacado.p)} (d²=${sacado.d}).`),
               [A.siMayor, A.pop], { vars: [{ k: L("sacado", "popped"), v: fmt(sacado.p) }] });
        }
      }

      heap.sort((a, b) => a.d - b.d);
      steps.push({ note: L(`El heap tiene los k=${k} más cercanos: <b>${heap.map((it) => fmt(it.p)).join(", ")}</b>.`,
                            `The heap holds the k=${k} closest: <b>${heap.map((it) => fmt(it.p)).join(", ")}</b>.`),
        line: A.retorna,
        list: { label: L(`Heap de tamaño k (k=${k})`, `Size-k heap (k=${k})`),
          items: heap.map((it) => ({ v: fmt(it.p), cls: "result" })) } });

      return steps;
    },
  };
})();
