/* 1192. Critical Connections — puentes con Tarjan (disc / low). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  P["1192"] = {
    num: 1192, slug: "critical-connections", title: "Critical Connections in a Network",
    difficulty: "H", block: "grafos", tags: ["Tarjan", "puentes", "DFS"],
    summary: L(
      "Aristas puente: si se quitan, el grafo se desconecta. Tarjan asigna a cada nodo un tiempo de descubrimiento (disc) y el menor alcanzable (low); la arista u–v es puente si low[v] > disc[u].",
      "Bridge edges: removing them disconnects the graph. Tarjan gives each node a discovery time (disc) and the lowest reachable (low); edge u–v is a bridge if low[v] > disc[u]."),
    legend: [
      { cls: "current", label: L("nodo en DFS", "node in DFS") },
      { cls: "done", label: L("visitado", "visited") },
    ],
    code: {
      es: [
        "funcion criticalConnections(n, conexiones):",
        "  disc[i]←-1; low[i]←-1; tiempo←0; puentes←[]",
        "  dfs(0, padre=-1)",
        "  retornar puentes",
        "",
        "funcion dfs(u, padre):",
        "  disc[u] ← low[u] ← tiempo;  tiempo += 1",
        "  para cada vecino v de u:",
        "    si v == padre: continuar",
        "    si disc[v] == -1:",
        "      dfs(v, u)",
        "      low[u] ← min(low[u], low[v])",
        "      si low[v] > disc[u]: puente (u,v)",
        "    si no: low[u] ← min(low[u], disc[v])",
      ],
      en: [
        "function criticalConnections(n, connections):",
        "  disc[i]←-1; low[i]←-1; time←0; bridges←[]",
        "  dfs(0, parent=-1)",
        "  return bridges",
        "",
        "function dfs(u, parent):",
        "  disc[u] ← low[u] ← time;  time += 1",
        "  for each neighbor v of u:",
        "    if v == parent: continue",
        "    if disc[v] == -1:",
        "      dfs(v, u)",
        "      low[u] ← min(low[u], low[v])",
        "      if low[v] > disc[u]: bridge (u,v)",
        "    else: low[u] ← min(low[u], disc[v])",
      ],
    },
    cases: [
      { name: L("4 nodos, 1 puente", "4 nodes, 1 bridge"), input: { n: 4, edges: [[0,1],[1,2],[2,0],[1,3]] } },
      { name: L("Cadena (todos puentes)", "Chain (all bridges)"), input: { n: 4, edges: [[0,1],[1,2],[2,3]] } },
    ],

    build(input) {
      const n = input.n, edges = input.edges;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
      const adj = Array.from({ length: n }, () => []);
      edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
      const disc = new Array(n).fill(-1), low = new Array(n).fill(-1);
      const state = new Array(n).fill("base");
      const bridges = new Set();
      const steps = [];
      let tiempo = 0;

      const edgeKey = (a, b) => Math.min(a, b) + "-" + Math.max(a, b);
      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Red", "Network"), r: 20,
          nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: i, x: pos[i][0], y: pos[i][1], cls: state[i] === "base" ? "" : state[i] })),
          edges: edges.map(([a, b]) => ({ from: a, to: b, cls: bridges.has(edgeKey(a, b)) ? "done" : "" })) },
        list: { label: "disc / low", items: Array.from({ length: n }, (_, i) => i + ":" + (disc[i] < 0 ? "-" : disc[i]) + "/" + (low[i] < 0 ? "-" : low[i])) } });

      function dfs(u, padre) {
        disc[u] = low[u] = tiempo++;
        state[u] = "current";
        snap(L(`Visitamos ${u}: disc=low=${disc[u]}.`, `Visit ${u}: disc=low=${disc[u]}.`), 6);
        for (const v of adj[u]) {
          if (v === padre) continue;
          if (disc[v] === -1) {
            dfs(v, u);
            low[u] = Math.min(low[u], low[v]);
            state[u] = "current";
            if (low[v] > disc[u]) {
              bridges.add(edgeKey(u, v));
              snap(L(`low[${v}]=${low[v]} > disc[${u}]=${disc[u]}: la arista ${u}–${v} es PUENTE.`,
                     `low[${v}]=${low[v]} > disc[${u}]=${disc[u]}: edge ${u}–${v} is a BRIDGE.`), [12, 13]);
            } else {
              snap(L(`Al volver de ${v}: low[${u}] = ${low[u]}. No es puente.`,
                     `Back from ${v}: low[${u}] = ${low[u]}. Not a bridge.`), 11);
            }
          } else {
            low[u] = Math.min(low[u], disc[v]);
            snap(L(`${v} ya visitado (arista de retorno): low[${u}] = ${low[u]}.`,
                   `${v} already visited (back edge): low[${u}] = ${low[u]}.`), 14);
          }
        }
        state[u] = "done";
      }

      snap(L("Iniciamos DFS desde 0 registrando tiempos disc y low.",
             "Start DFS from 0 recording disc and low times."), [1, 2]);
      dfs(0, -1);
      const list = Array.from(bridges).map((k) => k.replace("-", "–"));
      snap(L(`Conexiones críticas (puentes): ${list.length ? list.join(", ") : "ninguna"}.`,
             `Critical connections (bridges): ${list.length ? list.join(", ") : "none"}.`), 3);
      return steps;
    },
  };
})();
