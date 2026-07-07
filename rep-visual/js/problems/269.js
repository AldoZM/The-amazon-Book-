/* 269. Alien Dictionary — deducir orden de letras + orden topológico. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion alienOrder(words):",
        "  nodos ← todas las letras; grado[c]←0",
        "  para cada par vecino (a,b):",
        "    hallar 1ª letra distinta c1≠c2 → arista c1→c2",
        "    (si a es prefijo y más largo que b: inválido)",
        "  cola ← letras con grado 0",
        "  mientras cola no vacía:",
        "    c ← sacar; orden += c",
        "    bajar grado de vecinas; grado 0 → encolar",
        "  si orden cubre todas: retornar orden, si no \"\"",
      ],
      en: [
        "function alienOrder(words):",
        "  nodes ← all letters; degree[c]←0",
        "  for each adjacent pair (a,b):",
        "    find 1st differing letter c1≠c2 → edge c1→c2",
        "    (if a is a longer prefix of b: invalid)",
        "  queue ← letters with degree 0",
        "  while queue not empty:",
        "    c ← pop; order += c",
        "    lower neighbors' degree; degree 0 → enqueue",
        "  if order covers all: return order, else \"\"",
      ],
    },
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
             "Dictionary letters as nodes. We compare adjacent words."), [1, 2]);
      for (let i = 0; i + 1 < words.length && !invalido; i++) {
        const a = words[i], b = words[i + 1];
        let j = 0;
        while (j < a.length && j < b.length && a[j] === b[j]) j++;
        if (j === b.length && a.length > b.length) {
          invalido = true;
          snap(L(`"${a}" antes que "${b}" pero es su prefijo más largo: inválido. Respuesta "".`,
                 `"${a}" before "${b}" but it's a longer prefix: invalid. Answer "".`), 4);
          return steps;
        }
        if (j < a.length && j < b.length) {
          const c1 = a[j], c2 = b[j];
          if (!adj[c1].has(c2)) { adj[c1].add(c2); grado[c2]++; edgesArr.push([c1, c2]); }
          snap(L(`"${a}" vs "${b}": difieren en '${c1}'≠'${c2}' → ${c1} va antes que ${c2}.`,
                 `"${a}" vs "${b}": differ at '${c1}'≠'${c2}' → ${c1} comes before ${c2}.`), 3);
        }
      }

      const cola = [];
      chars.forEach((c) => { if (grado[c] === 0) { cola.push(c); state[c] = "frontier"; } });
      snap(L(`Letras sin predecesor a la cola: [${cola.join(", ")}].`,
             `Letters with no predecessor into the queue: [${cola.join(", ")}].`), 5);
      while (cola.length) {
        const c = cola.shift();
        state[c] = "current";
        orden.push(c);
        snap(L(`Sacamos '${c}' → al orden.`, `Pop '${c}' → into the order.`), [7, 8]);
        for (const v of adj[c]) {
          grado[v]--;
          if (grado[v] === 0) { cola.push(v); state[v] = "frontier";
            snap(L(`'${v}' llega a grado 0 → cola.`, `'${v}' reaches degree 0 → queue.`), 8); }
        }
        state[c] = "done";
      }
      if (orden.length === n) snap(L(`Orden del alfabeto: <b>${orden.join("")}</b>.`,
                                    `Alphabet order: <b>${orden.join("")}</b>.`), 9);
      else snap(L(`Quedaron letras en ciclo. Respuesta "".`,
                 `Some letters remain in a cycle. Answer "".`), 9);
      return steps;
    },
  };
})();
