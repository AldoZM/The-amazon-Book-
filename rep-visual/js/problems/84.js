/* 84. Largest Rectangle in Histogram — pila monótona de índices con altura
   creciente, y un centinela de altura 0 al final para vaciarla. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",           "funcion areaMaxima(heights):",                                  "function largestRectangleArea(heights):"],
    ["pilaVacia",    "  pila empieza vacía   // guarda índices, heights[pila] creciente",
                      "  stack starts empty   // holds indices, heights[stack] increasing"],
    ["area0",        "  area empieza en 0",                                           "  area starts at 0"],
    ["porI",         "  para i desde 0 hasta n (con un centinela en i == n):",         "  for i from 0 to n (with a sentinel at i == n):"],
    ["hCalc",        "    h pasa a ser 0 si i == n, si no heights[i]",                 "    h becomes 0 if i == n, otherwise heights[i]"],
    ["mientrasTope", "    mientras pila no vacía Y heights[tope de pila] >= h:",       "    while stack is not empty AND heights[stack top] >= h:"],
    ["popAltura",    "      altura pasa a ser heights[pila.pop()]",                    "      height becomes heights[stack.pop()]"],
    ["calcAncho",    "      ancho pasa a ser i si pila quedó vacía, si no i - pila.tope() - 1",
                      "      width becomes i if the stack is now empty, otherwise i - stack top - 1"],
    ["actualizaArea","      area pasa a ser el mayor de area y (altura × ancho)",       "      area becomes the larger of area and (height × width)"],
    ["pushI",        "    pila.push(i)",                                              "    stack.push(i)"],
    ["retorna",      "  retornar area",                                               "  return area"],
  ]);
  const A = C.L;

  P["84"] = {
    num: 84, slug: "largest-rectangle-histogram", title: "Largest Rectangle in Histogram",
    difficulty: "H", block: "sliding-window-stack", tags: ["pila monótona"],
    summary: L(
      "Pila monótona de índices con alturas crecientes. Cuando una barra nueva es más baja que el tope, ese tope ya no puede crecer más a la derecha: es el momento de calcular su rectángulo, con ancho hasta el elemento anterior en la pila.",
      "Monotonic stack of indices with increasing heights. When a new bar is lower than the top, that top can no longer grow to the right: it's time to compute its rectangle, with width reaching back to the previous element in the stack."),
    legend: [
      { cls: "hot", label: L("barra actual / procesada", "current / processed bar") },
      { cls: "result", label: L("área máxima mejorada", "improved max area") },
    ],
    code: C,
    cases: [
      { name: L("[2,1,5,6,2,3] → 10", "[2,1,5,6,2,3] → 10"), input: [2,1,5,6,2,3] },
      { name: L("[4,4,4,4] → 16", "[4,4,4,4] → 16"), input: [4,4,4,4] },
      { name: L("[2,1,2] → 3", "[2,1,2] → 3"), input: [2,1,2] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "heights", type: "text", label: L("heights:", "heights:"), placeholder: L("ej. [2,1,5,6,2,3]", "ex. [2,1,5,6,2,3]") }
      ],
      initial() { return { heights: "[2,1,5,6,2,3]" }; },
      parse(state) {
        const r = VIS.parse.numberArray(state.heights, 15);
        if (!r.ok) return { ok: false, field: "heights", error: r.error };
        for (const h of r.arr) {
          if (h < 0) return { ok: false, field: "heights", error: L("Las alturas no pueden ser negativas.", "Heights cannot be negative.") };
        }
        return { ok: true, input: r.arr };
      },
      previewSpec(input) {
        return { type: "bars", label: L("Alturas", "Heights"), items: input.map((h) => ({ h })), indices: true };
      },
      hint: L("Ingresa un arreglo de alturas no negativas (máx. 15).", "Enter an array of non-negative heights (max 15).")
    },

    build(input) {
      const heights = (input || []).slice();
      const n = heights.length;
      const steps = [];
      const pila = [];
      let maxArea = 0;

      const snap = (note, line, hotIdx, mejoro) => {
        steps.push({
          note, line,
          bars: {
            label: L("Alturas", "Heights"),
            items: heights.map((h, i) => ({ h, cls: i === hotIdx ? "hot" : "" })),
            indices: true,
          },
          stack: {
            label: L("Pila de índices", "Index stack"),
            items: pila.map((idx) => ({ v: idx })),
          },
          vars: [{ k: L("área máxima", "max area"), v: maxArea, cls: mejoro ? "result" : "" }],
        });
      };

      if (n === 0) {
        snap(L("Histograma vacío: área 0.", "Empty histogram: area 0."), A.retorna, null, false);
        return steps;
      }

      snap(L("Pila vacía, área 0. Recorremos hasta n con un centinela de altura 0 al final para vaciar la pila.",
             "Empty stack, area 0. We iterate up to n with a height-0 sentinel at the end to empty the stack."),
           [A.pilaVacia, A.area0], null, false);

      for (let i = 0; i <= n; i++) {
        const h = i === n ? 0 : heights[i];
        snap(i === n
          ? L(`i=${i} (centinela): h=0.`, `i=${i} (sentinel): h=0.`)
          : L(`i=${i}: h=${h}.`, `i=${i}: h=${h}.`),
          [A.porI, A.hCalc], i === n ? null : i, false);

        while (pila.length && heights[pila[pila.length - 1]] >= h) {
          const topIdx = pila.pop();
          const altura = heights[topIdx];
          const ancho = pila.length ? i - pila[pila.length - 1] - 1 : i;
          const area = altura * ancho;
          const mejoro = area > maxArea;
          if (mejoro) maxArea = area;
          snap(L(`Sacamos ${topIdx} (altura ${altura}). Ancho=${ancho}. Área=${altura}×${ancho}=${area}.`,
                 `Pop ${topIdx} (height ${altura}). Width=${ancho}. Area=${altura}×${ancho}=${area}.`),
               [A.mientrasTope, A.popAltura, A.calcAncho, A.actualizaArea], i === n ? null : i, mejoro);
        }
        pila.push(i);
        if (i < n) {
          snap(L(`Empujamos ${i} a la pila.`, `Push ${i} onto the stack.`), A.pushI, i, false);
        }
      }

      snap(L(`Área máxima: <b>${maxArea}</b>.`, `Max area: <b>${maxArea}</b>.`), A.retorna, null, false);
      return steps;
    },
  };
})();
