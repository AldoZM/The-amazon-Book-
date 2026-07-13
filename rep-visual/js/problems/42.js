/* 42. Trapping Rain Water — dos punteros desde los extremos, avanzando el
   lado con la altura menor. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",       "funcion agua(height):",                                   "function trap(height):"],
    ["L0",       "  L empieza en 0, R empieza en n-1",                      "  L starts at 0, R starts at n-1"],
    ["maxes0",   "  leftMax empieza en 0, rightMax empieza en 0",           "  leftMax starts at 0, rightMax starts at 0"],
    ["total0",   "  total empieza en 0",                                    "  total starts at 0"],
    ["mientras", "  mientras L < R:",                                       "  while L < R:"],
    ["compara",  "    si height[L] <= height[R]:",                          "    if height[L] <= height[R]:"],
    ["actualizaLeftMax", "      leftMax pasa a ser el mayor de leftMax y height[L]",
                          "      leftMax becomes the larger of leftMax and height[L]"],
    ["sumaIzq",  "      sumar (leftMax - height[L]) a total   // agua sobre la columna L",
                  "      add (leftMax - height[L]) to total   // water over column L"],
    ["avanzaIzq","      L pasa a ser L + 1",                                "      L becomes L + 1"],
    ["siNo",     "    si no:",                                              "    else:"],
    ["actualizaRightMax", "      rightMax pasa a ser el mayor de rightMax y height[R]",
                           "      rightMax becomes the larger of rightMax and height[R]"],
    ["sumaDer",  "      sumar (rightMax - height[R]) a total   // agua sobre la columna R",
                  "      add (rightMax - height[R]) to total   // water over column R"],
    ["avanzaDer","      R pasa a ser R - 1",                                "      R becomes R - 1"],
    ["retorna",  "  retornar total",                                        "  return total"],
  ]);
  const A = C.L;

  P["42"] = {
    num: 42, slug: "trapping-rain-water", title: "Trapping Rain Water",
    difficulty: "H", block: "sliding-window-stack", tags: ["two pointers"],
    summary: L(
      "Dos punteros que avanzan uno hacia el otro: siempre movemos el lado con la altura MENOR, porque su agua atrapada ya está determinada por el máximo visto de ese mismo lado.",
      "Two pointers moving toward each other: we always advance the side with the SMALLER height, because the water trapped there is already determined by the max seen on that same side."),
    legend: [
      { cls: "hot", label: L("puntero en proceso", "pointer in process") },
      { cls: "water", label: L("agua atrapada", "trapped water") },
    ],
    code: C,
    cases: [
      { name: L("[0,1,0,2,1,0,1,3,2,1,2,1] → 6", "[0,1,0,2,1,0,1,3,2,1,2,1] → 6"), input: [0,1,0,2,1,0,1,3,2,1,2,1] },
      { name: L("[4,2,0,3,2,5] → 9", "[4,2,0,3,2,5] → 9"), input: [4,2,0,3,2,5] },
      { name: L("[5,4] → 0", "[5,4] → 0"), input: [5,4] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "height", type: "text", label: L("height:", "height:"), placeholder: L("ej. [0,1,0,2,1,0,1,3,2,1,2,1]", "ex. [0,1,0,2,1,0,1,3,2,1,2,1]") }
      ],
      initial() { return { height: "[0,1,0,2,1,0,1,3,2,1,2,1]" }; },
      parse(state) {
        const r = VIS.parse.numberArray(state.height, 15);
        if (!r.ok) return { ok: false, field: "height", error: r.error };
        for (const h of r.arr) {
          if (h < 0) return { ok: false, field: "height", error: L("Las alturas no pueden ser negativas.", "Heights cannot be negative.") };
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
      const waterLevel = heights.slice();
      let izq = 0, der = n - 1;
      let leftMax = 0, rightMax = 0, total = 0;

      const snap = (note, line, hotIdx) => {
        steps.push({
          note, line,
          bars: {
            label: L("Alturas", "Heights"),
            items: heights.map((h, i) => ({ h, cls: i === hotIdx ? "hot" : "" })),
            indices: true,
            waterLevel: waterLevel.slice(),
          },
          vars: [
            { k: "leftMax", v: leftMax },
            { k: "rightMax", v: rightMax },
            { k: L("agua acumulada", "trapped water"), v: total, cls: "result" },
          ],
        });
      };

      if (n === 0) {
        snap(L("Arreglo vacío: no hay agua que atrapar.", "Empty array: no water to trap."), A.retorna, null);
        return steps;
      }

      snap(L(`L=0, R=${der}. leftMax=0, rightMax=0, total=0.`, `L=0, R=${der}. leftMax=0, rightMax=0, total=0.`),
           [A.L0, A.maxes0, A.total0], null);

      while (izq < der) {
        if (heights[izq] <= heights[der]) {
          leftMax = Math.max(leftMax, heights[izq]);
          const aporte = leftMax - heights[izq];
          total += aporte;
          waterLevel[izq] = leftMax;
          snap(L(`height[${izq}]=${heights[izq]} <= height[${der}]=${heights[der]}: leftMax=${leftMax}, agua sobre ${izq} = ${aporte}. Total=${total}.`,
                 `height[${izq}]=${heights[izq]} <= height[${der}]=${heights[der]}: leftMax=${leftMax}, water over ${izq} = ${aporte}. Total=${total}.`),
               [A.mientras, A.compara, A.actualizaLeftMax, A.sumaIzq, A.avanzaIzq], izq);
          izq++;
        } else {
          rightMax = Math.max(rightMax, heights[der]);
          const aporte = rightMax - heights[der];
          total += aporte;
          waterLevel[der] = rightMax;
          snap(L(`height[${izq}]=${heights[izq]} > height[${der}]=${heights[der]}: rightMax=${rightMax}, agua sobre ${der} = ${aporte}. Total=${total}.`,
                 `height[${izq}]=${heights[izq]} > height[${der}]=${heights[der]}: rightMax=${rightMax}, water over ${der} = ${aporte}. Total=${total}.`),
               [A.mientras, A.siNo, A.actualizaRightMax, A.sumaDer, A.avanzaDer], der);
          der--;
        }
      }

      snap(L(`L y R se encontraron. Agua total atrapada: <b>${total}</b>.`, `L and R met. Total trapped water: <b>${total}</b>.`), A.retorna, null);
      return steps;
    },
  };
})();
