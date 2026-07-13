/* 322. Coin Change — DP 1D: dp[m] = mínimo de monedas para llegar exacto a m. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",         "funcion coinChange(coins, amount):",                         "function coinChange(coins, amount):"],
    ["dpInit",     "  dp[0] = 0; el resto de dp empieza en ∞ (infinito)",         "  dp[0] = 0; the rest of dp start at ∞ (infinity)"],
    ["forM",       "  para m desde 1 hasta amount:",                             "  for m from 1 to amount:"],
    ["forC",       "    para cada moneda c en coins:",                           "    for each coin c in coins:"],
    ["puedeUsar",  "      si c <= m y dp[m - c] no es ∞:",                       "      if c <= m and dp[m - c] is not ∞:"],
    ["actualizaDp","        dp[m] pasa a ser el menor entre dp[m] y dp[m-c] + 1", "        dp[m] becomes the smaller of dp[m] and dp[m-c] + 1"],
    ["retorna",    "  retornar dp[amount], o -1 si sigue siendo ∞",              "  return dp[amount], or -1 if it is still ∞"],
  ]);
  const A = C.L;

  P["322"] = {
    num: 322, slug: "coin-change", title: "Coin Change",
    difficulty: "M", block: "dp", tags: ["DP", "arreglo 1D"],
    summary: L(
      "Mínimo número de monedas para llegar exacto a amount. DP 1D: dp[m] se construye a partir de montos menores ya resueltos, probando cada moneda como la última usada.",
      "Minimum number of coins to reach amount exactly. 1D DP: dp[m] is built from smaller, already-solved amounts, trying each coin as the last one used."),
    legend: [
      { cls: "hot", label: L("monto m actual", "current amount m") },
      { cls: "match", label: L("dp[m] mejorado", "dp[m] improved") },
    ],
    code: C,
    cases: [
      { name: L("[1,2,5], 11 → 3", "[1,2,5], 11 → 3"), input: { coins: [1, 2, 5], amount: 11 } },
      { name: L("[1,2,5], 0 → 0", "[1,2,5], 0 → 0"), input: { coins: [1, 2, 5], amount: 0 } },
      { name: L("[2], 3 → -1", "[2], 3 → -1"), input: { coins: [2], amount: 3 } },
      { name: L("[3,7], 5 → -1", "[3,7], 5 → -1"), input: { coins: [3, 7], amount: 5 } },
      { name: L("[1,3,4], 6 → 2 (greedy falla)", "[1,3,4], 6 → 2 (greedy fails)"), input: { coins: [1, 3, 4], amount: 6 } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "coins", type: "text", label: L("Monedas (coins):", "Coins:"), placeholder: L("ej. [1,2,5]", "ex. [1,2,5]") },
        { id: "amount", type: "text", label: L("Monto (amount):", "Amount:"), placeholder: L("ej. 11", "ex. 11"),
          maxlength: 3, sanitize: (v) => v.replace(/[^0-9]/g, "").slice(0, 3) },
      ],
      initial() { return { coins: "[1,2,5]", amount: "11" }; },
      parse(state) {
        const c = VIS.parse.numberArray(state.coins, 6);
        if (!c.ok) return { ok: false, field: "coins", error: c.error };
        if (!c.arr.length) return { ok: false, field: "coins", error: L("Escribe al menos una moneda.", "Enter at least one coin.") };
        if (c.arr.some((v) => v <= 0)) return { ok: false, field: "coins", error: L("Las monedas deben ser positivas.", "Coins must be positive.") };
        const s = String(state.amount == null ? "" : state.amount).trim();
        if (!s) return { ok: false, field: "amount", error: L("Escribe el monto.", "Enter the amount.") };
        const amt = Number(s);
        if (!Number.isInteger(amt) || amt < 0) return { ok: false, field: "amount", error: L("El monto debe ser un entero ≥ 0.", "Amount must be an integer ≥ 0.") };
        if (amt > 30) return { ok: false, field: "amount", error: L("Máximo 30, para que la animación no sea eterna.", "Max 30, so the animation doesn't run forever.") };
        return { ok: true, input: { coins: c.arr, amount: amt } };
      },
      previewSpec(input) {
        return { type: "array", label: L("Monedas", "Coins"), items: input.coins.map((v) => ({ v, cls: "" })) };
      },
      hint: L("Ingresa las monedas disponibles y el monto objetivo.", "Enter the available coins and the target amount."),
    },

    build(input) {
      const coins = input.coins, amount = input.amount;
      const INF = Infinity;
      const dp = new Array(amount + 1).fill(INF);
      dp[0] = 0;
      const steps = [];

      const snap = (note, line, i, cls, vars) => {
        const items = dp.map((v, idx) => ({
          v: v === INF ? "∞" : v,
          cls: idx === i ? (cls || "hot") : "",
        }));
        steps.push({ note, line,
          array: { label: L("dp (mínimo de monedas)", "dp (min coins)"), items, indices: true },
          vars });
      };

      snap(L("dp[0] = 0 (caso base): con cero monedas llegamos exacto a 0. El resto empieza en ∞ (todavía no sabemos cómo llegar).",
             "dp[0] = 0 (base case): with zero coins we reach 0 exactly. The rest start at ∞ (we don't know how to reach them yet)."),
           A.dpInit, 0, "match");

      for (let m = 1; m <= amount; m++) {
        snap(L(`Calculamos dp[${m}]: probamos cada moneda como la última usada.`,
               `Compute dp[${m}]: try each coin as the last one used.`), A.forM, m);
        for (const c of coins) {
          if (c <= m && dp[m - c] !== INF) {
            const candidato = dp[m - c] + 1;
            if (candidato < dp[m]) {
              dp[m] = candidato;
              snap(L(`Moneda ${c}: dp[${m - c}] + 1 = ${candidato} mejora dp[${m}]. dp[${m}] = ${candidato}.`,
                     `Coin ${c}: dp[${m - c}] + 1 = ${candidato} improves dp[${m}]. dp[${m}] = ${candidato}.`),
                   [A.forC, A.puedeUsar, A.actualizaDp], m, "match", [{ k: L("moneda", "coin"), v: c }]);
            } else {
              snap(L(`Moneda ${c}: dp[${m - c}] + 1 = ${candidato} no mejora dp[${m}] = ${dp[m]}.`,
                     `Coin ${c}: dp[${m - c}] + 1 = ${candidato} does not improve dp[${m}] = ${dp[m]}.`),
                   [A.forC, A.puedeUsar], m, "hot", [{ k: L("moneda", "coin"), v: c }]);
            }
          } else {
            snap(L(`Moneda ${c}: no se puede usar (c > m, o dp[${m - c}] sigue siendo ∞).`,
                   `Coin ${c}: cannot be used (c > m, or dp[${m - c}] is still ∞).`),
                 [A.forC, A.puedeUsar], m, "hot", [{ k: L("moneda", "coin"), v: c }]);
          }
        }
      }

      const resultado = dp[amount] === INF ? -1 : dp[amount];
      snap(L(`dp[${amount}] = ${dp[amount] === INF ? "∞" : dp[amount]} → respuesta: <b>${resultado}</b>.`,
             `dp[${amount}] = ${dp[amount] === INF ? "∞" : dp[amount]} → answer: <b>${resultado}</b>.`),
           A.retorna, amount, "match");

      return steps;
    },
  };
})();
