/* 787. Cheapest Flights Within K Stops — Bellman-Ford limitado a K+1 rondas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["787"] = {
    num: 787, slug: "cheapest-flights-k-stops", title: "Cheapest Flights Within K Stops",
    difficulty: "M", block: "grafos", tags: ["Bellman-Ford", "DP"],
    summary: L(
      "Vuelo más barato de src a dst con máximo K escalas. Bellman-Ford con exactamente K+1 rondas de relajación; usar una copia por ronda garantiza no exceder el número de escalas.",
      "Cheapest flight from src to dst with at most K stops. Bellman-Ford with exactly K+1 relaxation rounds; using a copy per round guarantees we never exceed the stop count."),
    legend: [
      { cls: "current", label: L("origen / destino", "source / destination") },
      { cls: "frontier", label: L("precio actualizado", "price updated") },
    ],
    code: {
      es: [
        "funcion findCheapest(n, flights, src, dst, K):",
        "  dist[i] ← ∞;  dist[src] ← 0",
        "  repetir K+1 veces:",
        "    tmp ← copia de dist",
        "    para cada vuelo (u,v,precio):",
        "      si dist[u] != ∞ y dist[u]+precio < tmp[v]:",
        "        tmp[v] ← dist[u] + precio",
        "    dist ← tmp",
        "  retornar dist[dst] si no es ∞, si no -1",
      ],
      en: [
        "function findCheapest(n, flights, src, dst, K):",
        "  dist[i] ← ∞;  dist[src] ← 0",
        "  repeat K+1 times:",
        "    tmp ← copy of dist",
        "    for each flight (u,v,price):",
        "      if dist[u] != ∞ and dist[u]+price < tmp[v]:",
        "        tmp[v] ← dist[u] + price",
        "    dist ← tmp",
        "  return dist[dst] if not ∞, else -1",
      ],
    },
    cases: [
      { name: L("0→3, K=1", "0→3, K=1"), input: { n: 4, src: 0, dst: 3, K: 1,
        flights: [[0,1,100],[1,2,100],[2,3,100],[0,2,500]] } },
      { name: L("0→2, K=0 (directo)", "0→2, K=0 (direct)"), input: { n: 3, src: 0, dst: 2, K: 0,
        flights: [[0,1,100],[1,2,100],[0,2,500]] } },
    ],

    build(input) {
      const { n, src, dst, K, flights } = input;
      const INF = Infinity;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      let dist = new Array(n).fill(INF);
      dist[src] = 0;
      const steps = [];

      const stateFor = (upd) => {
        const s = {};
        s[src] = "current"; s[dst] = "current";
        if (upd != null) s[upd] = "frontier";
        return s;
      };
      const snap = (note, line, upd) => {
        const state = stateFor(upd);
        steps.push({ line, note,
          graph: { label: L(`Vuelos (src=${src}, dst=${dst})`, `Flights (src=${src}, dst=${dst})`), r: 20,
            nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] || "" })),
            edges: flights.map(([u, v, p]) => ({ from: u, to: v, directed: true, label: p })) },
          list: { label: "dist[]", items: dist.map((d, i) => i + ":" + (d === INF ? "∞" : d)) } });
      };

      snap(L(`dist[${src}]=0. Haremos ${K + 1} rondas (K=${K} escalas).`,
             `dist[${src}]=0. We'll do ${K + 1} rounds (K=${K} stops).`), 1);
      for (let r = 0; r < K + 1; r++) {
        const tmp = dist.slice();
        snap(L(`Ronda ${r + 1}/${K + 1}: copiamos dist y relajamos cada vuelo.`,
               `Round ${r + 1}/${K + 1}: copy dist and relax each flight.`), [3, 4]);
        for (const [u, v, p] of flights) {
          if (dist[u] !== INF && dist[u] + p < tmp[v]) {
            tmp[v] = dist[u] + p;
            dist = tmp;
            snap(L(`Vuelo ${u}→${v} ($${p}): dist[${v}] baja a ${tmp[v]}.`,
                   `Flight ${u}→${v} ($${p}): dist[${v}] drops to ${tmp[v]}.`), [5, 6], v);
          }
        }
        dist = tmp;
      }
      snap(dist[dst] === INF
        ? L(`No se alcanza ${dst} en ${K} escalas. Respuesta <b>-1</b>.`,
            `${dst} is not reachable within ${K} stops. Answer <b>-1</b>.`)
        : L(`Más barato a ${dst}: <b>$${dist[dst]}</b>.`,
            `Cheapest to ${dst}: <b>$${dist[dst]}</b>.`), 8);
      return steps;
    },
  };
})();
