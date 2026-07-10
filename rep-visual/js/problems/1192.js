/* 1192. Critical Connections — puentes con Tarjan (disc / low). */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",        "funcion criticalConnections(n, conexiones):",   "function criticalConnections(n, connections):"],
    ["discInit",  "  disc[u] empieza sin visitar, para todo u   // cuándo descubrimos u",
                  "  disc[u] starts unvisited, for every u      // when we discovered u"],
    ["lowInit",   "  low[u] empieza sin visitar, para todo u    // lo más antiguo que u alcanza",
                  "  low[u] starts unvisited, for every u       // oldest node u can reach"],
    ["tiempo0",   "  tiempo empieza en 0",                        "  time starts at 0"],
    ["puentes0",  "  puentes empieza como lista vacía",           "  bridges starts as an empty list"],
    ["llamaDfs",  "  dfs(0, padre = ninguno)",                     "  dfs(0, parent = none)"],
    ["retorna",   "  retornar puentes",                            "  return bridges"],
    ["",          "",                                              ""],
    ["dfsFn",     "funcion dfs(u, padre):",                        "function dfs(u, parent):"],
    ["discU",     "  disc[u] pasa a ser tiempo",                   "  disc[u] becomes time"],
    ["lowU",      "  low[u] pasa a ser tiempo",                    "  low[u] becomes time"],
    ["avanzaT",   "  sumar 1 a tiempo",                            "  add 1 to time"],
    ["porVecino", "  para cada vecino v de u:",                    "  for each neighbor v of u:"],
    ["esPadre",   "    si v es el padre:",                         "    if v is the parent:"],
    ["salta",     "      continuar",                               "      continue"],
    ["sinVisitar","    si v no ha sido visitado:",                 "    if v has not been visited:"],
    ["baja",      "      dfs(v, u)",                               "      dfs(v, u)"],
    ["subeLow",   "      low[u] pasa a ser el menor de low[u] y low[v]",
                  "      low[u] becomes the smaller of low[u] and low[v]"],
    ["pruebaP",   "      si low[v] > disc[u]:",                    "      if low[v] > disc[u]:"],
    ["esPuente",  "        la arista (u, v) es un puente",         "        edge (u, v) is a bridge"],
    ["siNo",      "    si no:                              // v ya visitado: arista de retorno",
                  "    else:                                // v already visited: back edge"],
    ["retroceso", "      low[u] pasa a ser el menor de low[u] y disc[v]",
                  "      low[u] becomes the smaller of low[u] and disc[v]"],
  ]);
  const A = C.L;

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
    code: C,
    cases: [
      { name: L("Triángulo con rama (1-3)", "Triangle with branch (1-3)"), input: { n: 4, edges: [[0,1],[1,2],[2,0],[1,3]] } },
      { name: L("Dos triángulos unidos", "Two triangles joined"), input: { n: 6, edges: [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]] } },
    ],

    editor: VIS.graphEditor({
      id: 1192,
      maxNodos: 15,
      directed: false,
      defaultInput: "[[0,1],[1,2],[2,0],[1,3]]",
      parser: VIS.parse.edgeList,
      hint: L("Ej: [[0,1]] (conexión 0-1)", "Ex: [[0,1]] (connection 0-1)")
    }),

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
        snap(L(`Visitamos ${u}: disc=low=${disc[u]}.`, `Visit ${u}: disc=low=${disc[u]}.`),
             [A.discU, A.lowU, A.avanzaT]);
        for (const v of adj[u]) {
          if (v === padre) continue;
          if (disc[v] === -1) {
            dfs(v, u);
            low[u] = Math.min(low[u], low[v]);
            state[u] = "current";
            if (low[v] > disc[u]) {
              bridges.add(edgeKey(u, v));
              snap(L(`low[${v}]=${low[v]} > disc[${u}]=${disc[u]}: la arista ${u}–${v} es PUENTE.`,
                     `low[${v}]=${low[v]} > disc[${u}]=${disc[u]}: edge ${u}–${v} is a BRIDGE.`),
                   [A.pruebaP, A.esPuente]);
            } else {
              snap(L(`Al volver de ${v}: low[${u}] = ${low[u]}. No es puente.`,
                     `Back from ${v}: low[${u}] = ${low[u]}. Not a bridge.`), A.subeLow);
            }
          } else {
            low[u] = Math.min(low[u], disc[v]);
            snap(L(`${v} ya visitado (arista de retorno): low[${u}] = ${low[u]}.`,
                   `${v} already visited (back edge): low[${u}] = ${low[u]}.`),
                 [A.siNo, A.retroceso]);
          }
        }
        state[u] = "done";
      }

      snap(L("Iniciamos DFS desde 0 registrando tiempos disc y low.",
             "Start DFS from 0 recording disc and low times."),
           [A.discInit, A.lowInit, A.llamaDfs]);
      dfs(0, -1);
      const list = Array.from(bridges).map((k) => k.replace("-", "–"));
      snap(L(`Conexiones críticas (puentes): ${list.length ? list.join(", ") : "ninguna"}.`,
             `Critical connections (bridges): ${list.length ? list.join(", ") : "none"}.`), A.retorna);
      return steps;
    },
  };
})();
