/* 55. Jump Game — greedy: solo llevamos el alcance máximo visto hasta el momento. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",              "funcion canJump(nums):",                                    "function canJump(nums):"],
    ["alcance0",        "  alcanceMaximo = 0",                                        "  maxReach = 0"],
    ["forI",            "  para i desde 0 hasta el último índice:",                   "  for i from 0 to the last index:"],
    ["siExcede",        "    si i > alcanceMaximo:",                                  "    if i > maxReach:"],
    ["retFalse",        "      retornar falso   // i es inalcanzable",                "      return false   // i is unreachable"],
    ["actualizaAlcance","    alcanceMaximo pasa a ser el mayor entre alcanceMaximo y (i + nums[i])",
                         "    maxReach becomes the larger of maxReach and (i + nums[i])"],
    ["retTrue",         "  retornar verdadero",                                       "  return true"],
  ]);
  const A = C.L;

  P["55"] = {
    num: 55, slug: "jump-game", title: "Jump Game",
    difficulty: "M", block: "dp", tags: ["greedy", "arreglo 1D"],
    summary: L(
      "¿Se puede llegar del índice 0 al último con los saltos de nums? Greedy: llevamos el alcance máximo visto hasta el momento; si algún índice lo supera, es inalcanzable.",
      "Can we reach the last index from index 0 using the jumps in nums? Greedy: we track the max reach seen so far; if any index exceeds it, it is unreachable."),
    legend: [
      { cls: "window", label: L("rango alcanzable", "reachable range") },
    ],
    code: C,
    cases: [
      { name: L("[2,3,1,1,4] → true", "[2,3,1,1,4] → true"), input: [2, 3, 1, 1, 4] },
      { name: L("[0] → true", "[0] → true"), input: [0] },
      { name: L("[3,2,1,0,4] → false", "[3,2,1,0,4] → false"), input: [3, 2, 1, 0, 4] },
      { name: L("[2,3,0,1,4] → true", "[2,3,0,1,4] → true"), input: [2, 3, 0, 1, 4] },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "nums", type: "text", label: L("nums:", "nums:"), placeholder: L("ej. [2,3,1,1,4]", "ex. [2,3,1,1,4]") },
      ],
      initial() { return { nums: "[2,3,1,1,4]" }; },
      parse(state) {
        const n = VIS.parse.numberArray(state.nums, 10);
        if (!n.ok) return { ok: false, field: "nums", error: n.error };
        if (!n.arr.length) return { ok: false, field: "nums", error: L("Escribe al menos un número.", "Enter at least one number.") };
        if (n.arr.some((v) => v < 0)) return { ok: false, field: "nums", error: L("Los saltos no pueden ser negativos.", "Jumps cannot be negative.") };
        return { ok: true, input: n.arr };
      },
      previewSpec(input) {
        return { type: "array", label: L("nums", "nums"), items: input.map((v) => ({ v, cls: "" })), indices: true };
      },
      hint: L("Ingresa un arreglo de saltos máximos por posición.", "Enter an array of max jumps per position."),
    },

    build(input) {
      const nums = input;
      const n = nums.length;
      const steps = [];
      let alcanceMaximo = 0;

      const snap = (note, line, i) => {
        const items = nums.map((v, idx) => ({ v, cls: "" }));
        const windowRange = n ? [0, Math.min(alcanceMaximo, n - 1)] : null;
        const markers = i != null ? [{ index: i, label: "i", cls: "" }] : [];
        steps.push({ note, line,
          array: { label: L("nums", "nums"), items, indices: true, windowRange, markers },
          vars: [{ k: L("alcanceMaximo", "maxReach"), v: alcanceMaximo }] });
      };

      snap(L("alcanceMaximo empieza en 0: todavía solo sabemos que el índice 0 es alcanzable.",
             "maxReach starts at 0: we only know index 0 is reachable so far."), A.alcance0, null);

      for (let i = 0; i < n; i++) {
        if (i > alcanceMaximo) {
          snap(L(`i=${i} supera el alcance máximo (${alcanceMaximo}): ningún índice alcanzable llega hasta aquí. Retornamos falso.`,
                 `i=${i} exceeds the max reach (${alcanceMaximo}): no reachable index gets here. Return false.`),
               [A.siExcede, A.retFalse], i);
          return steps;
        }
        snap(L(`i=${i} está dentro del alcance máximo (${alcanceMaximo}): es alcanzable.`,
               `i=${i} is within the max reach (${alcanceMaximo}): it is reachable.`), [A.forI, A.siExcede], i);

        const previo = alcanceMaximo;
        alcanceMaximo = Math.max(alcanceMaximo, i + nums[i]);
        snap(L(`alcanceMaximo pasa a max(${previo}, ${i} + ${nums[i]}) = ${alcanceMaximo}.`,
               `maxReach becomes max(${previo}, ${i} + ${nums[i]}) = ${alcanceMaximo}.`), A.actualizaAlcance, i);
      }

      snap(L("El ciclo terminó sin que ningún índice superara el alcance máximo. Retornamos verdadero.",
             "The loop finished without any index exceeding the max reach. Return true."), A.retTrue, n - 1);

      return steps;
    },
  };
})();
