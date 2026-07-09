/* 787. Cheapest Flights Within K Stops — Bellman-Ford limitado a K+1 rondas. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion findCheapestPrice(n, vuelos, src, dst, K):",
                  "function findCheapestPrice(n, flights, src, dst, K):"],
    ["infinito",  "  dist[i] empieza en infinito, para todo nodo i",   "  dist[i] starts at infinity, for every node i"],
    ["origen",    "  dist[src] empieza en 0              // llegar al origen no cuesta nada",
                  "  dist[src] starts at 0               // reaching the source costs nothing"],
    ["repite",    "  repetir K + 1 veces:                // con K escalas se toman K + 1 vuelos",
                  "  repeat K + 1 times:                 // with K stops you take K + 1 flights"],
    ["copia",     "    tmp empieza como una copia de dist",         "    tmp starts as a copy of dist"],
    ["porVuelo",  "    para cada vuelo de u a v con precio p:",
                  "    for each flight from u to v with price p:"],
    ["mejora",    "      si dist[u] no es infinito y dist[u] + p < tmp[v]:",
                  "      if dist[u] is not infinity and dist[u] + p < tmp[v]:"],
    ["relaja",    "        tmp[v] pasa a ser dist[u] + p",        "        tmp[v] becomes dist[u] + p"],
    ["vuelca",    "    dist pasa a ser tmp",                      "    dist becomes tmp"],
    ["esInfinito", "  si dist[dst] es infinito:           // no se llega con tan pocas escalas",
                  "  if dist[dst] is infinity:           // it is not reachable with so few stops"],
    ["menosUno",  "    retornar -1",                     "    return -1"],
    ["retorna",   "  retornar dist[dst]",                "  return dist[dst]"],
  ]);
  const A = C.L;

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
    code: C,
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
      // `dist` son las distancias de la ronda ANTERIOR: hay que leerlas sin
      // tocarlas o una relajación de esta ronda alimentaría a la siguiente y
      // el camino usaría más escalas de las permitidas. `view` es solo lo que
      // pinta el panel: durante la ronda, la copia que se está construyendo.
      let view = dist;

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
          list: { label: "dist[]", items: view.map((d, i) => i + ":" + (d === INF ? "∞" : d)) } });
      };

      snap(L(`dist[${src}]=0. Haremos ${K + 1} rondas (K=${K} escalas).`,
             `dist[${src}]=0. We'll do ${K + 1} rounds (K=${K} stops).`), [A.infinito, A.origen]);
      for (let r = 0; r < K + 1; r++) {
        const tmp = dist.slice();
        view = tmp;                 // el panel muestra la copia en construcción
        snap(L(`Ronda ${r + 1}/${K + 1}: copiamos dist y relajamos cada vuelo.`,
               `Round ${r + 1}/${K + 1}: copy dist and relax each flight.`), [A.repite, A.copia, A.porVuelo]);
        for (const [u, v, p] of flights) {
          if (dist[u] !== INF && dist[u] + p < tmp[v]) {
            tmp[v] = dist[u] + p;   // se escribe en tmp; `dist` sigue intacto
            snap(L(`Vuelo ${u}→${v} ($${p}): dist[${v}] baja a ${tmp[v]}.`,
                   `Flight ${u}→${v} ($${p}): dist[${v}] drops to ${tmp[v]}.`), [A.mejora, A.relaja], v);
          }
        }
        dist = tmp;                 // al cerrar la ronda, tmp pasa a ser dist
        view = dist;
      }
      snap(dist[dst] === INF
        ? L(`No se alcanza ${dst} en ${K} escalas. Respuesta <b>-1</b>.`,
            `${dst} is not reachable within ${K} stops. Answer <b>-1</b>.`)
        : L(`Más barato a ${dst}: <b>$${dist[dst]}</b>.`,
            `Cheapest to ${dst}: <b>$${dist[dst]}</b>.`),
        dist[dst] === INF ? [A.esInfinito, A.menosUno] : A.retorna);
      return steps;
    },
  };
})();
