/* 269. Alien Dictionary — deducir orden de letras + orden topológico. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  // Pseudocódigo con anclas: build() resalta líneas por nombre, no por número.
  const C = VIS.code([
    ["fn",        "funcion alienOrder(words):",                          "function alienOrder(words):"],
    ["nodos",     "  las letras que aparecen en las palabras son los nodos",
                  "  the letters appearing in the words are the nodes"],
    ["grados0",   "  grado[c] empieza en 0, para cada letra c",                   "  degree[c] starts at 0, for each letter c"],
    ["porPar",    "  para cada par de palabras vecinas (a, b):",         "  for each pair of adjacent words (a, b):"],
    ["prefijo",   "    si b es prefijo de a y a es más larga:   // \"abc\" no puede ir antes que \"ab\"",
                  "    if b is a prefix of a and a is longer:   // \"abc\" cannot come before \"ab\""],
    ["invalido",  "      retornar la cadena vacía",                      "      return the empty string"],
    ["difiere",   "    c1 y c2 pasan a ser las primeras letras en que a y b difieren",
                  "    c1 and c2 become the first letters where a and b differ"],
    ["arista",    "    añadir la arista de c1 a c2              // c1 va antes que c2",
                  "    add the edge from c1 to c2               // c1 comes before c2"],
    ["subeGrado", "    sumar 1 a grado[c2]",                       "    add 1 to degree[c2]"],
    ["cola0",     "  cola empieza con las letras de grado 0 dentro",                     "  queue starts with the degree-0 letters inside"],
    ["mientras",  "  mientras la cola no esté vacía:",                   "  while the queue is not empty:"],
    ["saca",      "    sacar la primera letra de la cola y llamarla c",           "    take the first letter out of the queue and call it c"],
    ["anade",     "    añadir c al final del orden",                     "    append c to the end of the order"],
    ["porVecina", "    para cada letra siguiente que deba ir después de c:",
                  "    for each letter next that must come after c:"],
    ["baja",      "      restar 1 a grado[siguiente]",       "      subtract 1 from degree[next]"],
    ["esCero",    "      si grado[siguiente] es 0:",                     "      if degree[next] is 0:"],
    ["mete",      "        meter siguiente en la cola",                  "        put next into the queue"],
    ["todas",     "  si el orden tiene todas las letras:",               "  if the order has all the letters:"],
    ["retOrden",  "    retornar el orden",                               "    return the order"],
    ["siNo",      "  si no:                                    // quedaron letras atrapadas en un ciclo",
                  "  else:                                     // some letters remain trapped in a cycle"],
    ["retVacio",  "    retornar la cadena vacía",                        "    return the empty string"],
  ]);
  const A = C.L;

  P["269"] = {
    num: 269, slug: "alien-dictionary", title: "Alien Dictionary",
    difficulty: "H", block: "grafos", tags: ["orden topológico", "grafo"],
    summary: L(
      "Dado un diccionario ordenado en un idioma alienígena, deducir el orden del alfabeto. Cada par de palabras vecinas revela una relación (primera letra distinta); luego Kahn ordena.",
      "Given a dictionary sorted in an alien language, deduce the alphabet order. Each pair of adjacent words reveals a relation (first differing letter); then Kahn sorts them."),
    legend: [
      { cls: "frontier", label: L("grado 0 (cola)", "degree 0 (queue)") },
      { cls: "current", label: L("procesando", "processing") },
      { cls: "done", label: L("ya en el orden", "in the order") },
    ],
    code: C,
    cases: [
      { name: L("wrt,wrf,er,ett,rftt", "wrt,wrf,er,ett,rftt"), input: ["wrt","wrf","er","ett","rftt"] },
      { name: L("z,x", "z,x"), input: ["z","x"] },
      { name: L("Inválido: abc,ab", "Invalid: abc,ab"), input: ["abc","ab"] },
    ],

    build(input) {
      const words = input;
      const chars = Array.from(new Set(words.join("").split(""))).sort();
      const idx = {}; chars.forEach((c, i) => (idx[c] = i));
      const n = chars.length;
      const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 14));
      const adj = {}; chars.forEach((c) => (adj[c] = new Set()));
      const grado = {}; chars.forEach((c) => (grado[c] = 0));
      const steps = [];
      const state = {};
      const edgesArr = [];
      const orden = [];
      let invalido = false;

      const snap = (note, line) => steps.push({ line, note,
        graph: { label: L("Letras (a→b: a antes que b)", "Letters (a→b: a before b)"), r: 18,
          nodes: chars.map((c) => ({ id: c, label: c, x: pos[idx[c]][0], y: pos[idx[c]][1], cls: state[c] || "" })),
          edges: edgesArr.map((e) => ({ from: e[0], to: e[1], directed: true })) },
        list: { label: L("Orden deducido", "Deduced order"), items: orden.slice() },
        vars: [{ k: L("grados", "degrees"), v: chars.map((c) => c + ":" + grado[c]).join(" ") }] });

      snap(L("Letras del diccionario como nodos. Comparamos palabras vecinas.",
             "Dictionary letters as nodes. We compare adjacent words."), [A.nodos, A.grados0, A.porPar]);
      for (let i = 0; i + 1 < words.length && !invalido; i++) {
        const a = words[i], b = words[i + 1];
        let j = 0;
        while (j < a.length && j < b.length && a[j] === b[j]) j++;
        if (j === b.length && a.length > b.length) {
          invalido = true;
          snap(L(`"${a}" antes que "${b}" pero es su prefijo más largo: inválido. Respuesta "".`,
                 `"${a}" before "${b}" but it's a longer prefix: invalid. Answer "".`), [A.prefijo, A.invalido]);
          return steps;
        }
        if (j < a.length && j < b.length) {
          const c1 = a[j], c2 = b[j];
          if (!adj[c1].has(c2)) { adj[c1].add(c2); grado[c2]++; edgesArr.push([c1, c2]); }
          snap(L(`"${a}" vs "${b}": difieren en '${c1}'≠'${c2}' → ${c1} va antes que ${c2}.`,
                 `"${a}" vs "${b}": differ at '${c1}'≠'${c2}' → ${c1} comes before ${c2}.`),
               [A.difiere, A.arista, A.subeGrado]);
        }
      }

      const cola = [];
      chars.forEach((c) => { if (grado[c] === 0) { cola.push(c); state[c] = "frontier"; } });
      snap(L(`Letras sin predecesor a la cola: [${cola.join(", ")}].`,
             `Letters with no predecessor into the queue: [${cola.join(", ")}].`), A.cola0);
      while (cola.length) {
        const c = cola.shift();
        state[c] = "current";
        orden.push(c);
        snap(L(`Sacamos '${c}' → al orden.`, `Pop '${c}' → into the order.`), [A.saca, A.anade]);
        for (const v of adj[c]) {
          grado[v]--;
          if (grado[v] === 0) { cola.push(v); state[v] = "frontier";
            snap(L(`'${v}' llega a grado 0 → cola.`, `'${v}' reaches degree 0 → queue.`), [A.baja, A.esCero, A.mete]); }
        }
        state[c] = "done";
      }
      if (orden.length === n) snap(L(`Orden del alfabeto: <b>${orden.join("")}</b>.`,
                                    `Alphabet order: <b>${orden.join("")}</b>.`), [A.todas, A.retOrden]);
      else snap(L(`Quedaron letras en ciclo. Respuesta "".`,
                 `Some letters remain in a cycle. Answer "".`), [A.siNo, A.retVacio]);
      return steps;
    },
  };
})();
