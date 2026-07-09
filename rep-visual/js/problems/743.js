/* 743. Network Delay Time — Dijkstra desde un nodo origen. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion networkDelayTime(times, n, k):",         "function networkDelayTime(times, n, k):"],
    ["infinito",  "  dist[i] empieza en infinito, para todo nodo i",         "  dist[i] starts at infinity, for every node i"],
    ["origen",    "  dist[k] empieza en 0           // el origen está a distancia 0",
                  "  dist[k] starts at 0            // the source is at distance 0"],
    ["repetir",   "  repetir n veces:",                             "  repeat n times:"],
    ["elige",     "    u pasa a ser el nodo no visitado con la dist más pequeña",
                  "    u becomes the unvisited node with the smallest dist"],
    ["noQueda",   "    si ya no queda ninguno alcanzable:",         "    if none is reachable anymore:"],
    ["termina",   "      terminar el bucle",                        "      end the loop"],
    ["marca",     "    marcar u como visitado",                     "    mark u as visited"],
    ["porArista", "    para cada arista de u a v con peso w:",      "    for each edge from u to v with weight w:"],
    ["mejora",    "      si dist[u] + w < dist[v]:                // llegamos más rápido por u",
                  "      if dist[u] + w < dist[v]:                // we get there faster through u"],
    ["relaja",    "        dist[v] pasa a ser dist[u] + w",                  "        dist[v] becomes dist[u] + w"],
    ["mayor",     "  respuesta pasa a ser la mayor de todas las dist",       "  answer becomes the largest of all dist"],
    ["algunaInf", "  si alguna dist se quedó en infinito:          // hay un nodo inalcanzable",
                  "  if some dist stayed at infinity:              // there is an unreachable node"],
    ["menosUno",  "    retornar -1",                                "    return -1"],
    ["retorna",   "  retornar respuesta",                           "  return answer"],
  ]);
  const A = C.L;

  P["743"] = {
    num: 743, slug: "network-delay-time", title: "Network Delay Time",
    difficulty: "M", block: "grafos", tags: ["Dijkstra", "camino mínimo"],
    summary: L(
      "Tiempo para que una señal llegue a todos los nodos desde el origen. Es el camino más corto máximo: Dijkstra calcula la menor distancia a cada nodo; la respuesta es la mayor de ellas.",
      "Time for a signal to reach every node from the source. It's the maximum shortest path: Dijkstra computes the least distance to each node; the answer is the largest of them."),
    legend: [
      { cls: "current", label: L("nodo elegido (dist mín)", "chosen node (min dist)") },
      { cls: "done", label: L("finalizado", "finalized") },
      { cls: "frontier", label: L("alcanzado", "reached") },
    ],
    code: C,
    cases: [
      { name: L("4 nodos, k=2", "4 nodes, k=2"), input: { n: 4, k: 2, times: [[2,1,1],[2,3,1],[3,4,1]] } },
      { name: L("Inalcanzable (-1)", "Unreachable (-1)"), input: { n: 3, k: 1, times: [[1,2,1]] } },
    ],

    build(input) {
      const n = input.n, k = input.k, times = input.times;
      const INF = Infinity;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const adj = Array.from({ length: n + 1 }, () => []);
      for (const [u, v, w] of times) adj[u].push([v, w]);
      const dist = new Array(n + 1).fill(INF);
      dist[k] = 0;
      const visto = new Array(n + 1).fill(false);
      const steps = [];
      const state = {};

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Red (arista con peso)", "Network (weighted edge)"), r: 20,
          nodes: Array.from({ length: n }, (_, idx) => { const i = idx + 1;
            return { id: i, label: i, x: pos[idx][0], y: pos[idx][1], cls: state[i] || "" }; }),
          edges: times.map(([u, v, w]) => ({ from: u, to: v, w, directed: true, label: w })) },
        list: { label: "dist[]", items: Array.from({ length: n }, (_, i) => (i + 1) + ":" + (dist[i + 1] === INF ? "∞" : dist[i + 1])) } });

      snap(L(`dist[${k}]=0, el resto ∞. Origen: ${k}.`, `dist[${k}]=0, the rest ∞. Source: ${k}.`),
           [A.infinito, A.origen]);
      for (let iter = 0; iter < n; iter++) {
        let u = -1, best = INF;
        for (let i = 1; i <= n; i++) if (!visto[i] && dist[i] < best) { best = dist[i]; u = i; }
        if (u === -1) break;
        visto[u] = true;
        state[u] = "current";
        snap(L(`Elegimos ${u} (dist mínima ${dist[u]}) y lo fijamos.`,
               `Choose ${u} (min dist ${dist[u]}) and finalize it.`), [A.elige, A.marca]);
        for (const [v, w] of adj[u]) {
          if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            state[v] = "frontier";
            snap(L(`Relajamos ${u}→${v}: dist[${v}] = ${dist[v]}.`,
                   `Relax ${u}→${v}: dist[${v}] = ${dist[v]}.`), [A.mejora, A.relaja]);
          }
        }
        state[u] = "done";
      }
      let ans = 0;
      for (let i = 1; i <= n; i++) ans = Math.max(ans, dist[i]);
      snap(ans === INF
        ? L("Algún nodo quedó en ∞: inalcanzable, respuesta <b>-1</b>.",
            "Some node stayed at ∞: unreachable, answer <b>-1</b>.")
        : L(`Tiempo total = mayor distancia = <b>${ans}</b>.`,
            `Total time = largest distance = <b>${ans}</b>.`),
        ans === INF ? [A.algunaInf, A.menosUno] : [A.mayor, A.retorna]);
      return steps;
    },
  };
})();
