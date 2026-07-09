/* 79. Word Search — DFS con backtracking sobre la cuadrícula. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",         "funcion exist(board, palabra):",                 "function exist(board, word):"],
    ["porCelda",   "  para cada celda (r, c) del tablero:",          "  for each cell (r, c) of the board:"],
    ["siDfs",      "    si dfs(r, c, 0):",                           "    if dfs(r, c, 0):"],
    ["hallada",    "      retornar verdadero",                       "      return true"],
    ["noHallada",  "  retornar falso",                               "  return false"],
    ["",           "",                                               ""],
    ["dfsFn",      "funcion dfs(r, c, i):        // ¿encaja palabra[i..] empezando en (r, c)?",
                   "function dfs(r, c, i):       // does word[i..] fit starting at (r, c)?"],
    ["finPalabra", "  si i llegó al final de palabra:",              "  if i reached the end of word:"],
    ["retFin",     "    retornar verdadero",                         "    return true"],
    ["fuera",      "  si (r, c) cae fuera del tablero:",             "  if (r, c) falls outside the board:"],
    ["retFuera",   "    retornar falso",                             "    return false"],
    ["otraLetra",  "  si board[r][c] no es palabra[i]:",             "  if board[r][c] is not word[i]:"],
    ["retOtra",    "    retornar falso",                             "    return false"],
    ["guarda",     "  guardar la letra de (r, c)",                   "  save the letter at (r, c)"],
    ["ocupa",      "  marcar (r, c) como ocupada",                   "  mark (r, c) as taken"],
    ["porVecina",  "  para cada vecina de (r, c):",                  "  for each neighbor of (r, c):"],
    ["bajaVecina", "    si dfs(vecina, i + 1):",                     "    if dfs(neighbor, i + 1):"],
    ["retVecina",  "      retornar verdadero",                       "      return true"],
    ["devuelve",   "  devolver su letra a (r, c)   // deshacer: backtracking",
                   "  give (r, c) its letter back  // undo: backtracking"],
    ["retFalso",   "  retornar falso",                               "  return false"],
  ]);
  const A = C.L;

  P["79"] = {
    num: 79, slug: "word-search", title: "Word Search",
    difficulty: "M", block: "grafos", tags: ["backtracking", "DFS", "grid"],
    summary: L(
      "¿Existe la palabra formada por letras adyacentes sin reutilizar celdas? DFS que avanza letra por letra y deshace (backtrack) cuando no encaja.",
      "Does the word exist, formed by adjacent letters without reusing cells? DFS that advances letter by letter and backtracks when it doesn't fit."),
    legend: [
      { cls: "path", label: L("letras ya emparejadas", "letters matched so far") },
      { cls: "current", label: L("probando esta celda", "testing this cell") },
    ],
    code: C,
    cases: [
      { name: L("ABCCED (existe)", "ABCCED (exists)"), input: { board: [
        ["A","B","C","E"],
        ["S","F","C","S"],
        ["A","D","E","E"]], word: "ABCCED" } },
      { name: L("SEE (existe)", "SEE (exists)"), input: { board: [
        ["A","B","C","E"],
        ["S","F","C","S"],
        ["A","D","E","E"]], word: "SEE" } },
      { name: L("ABCB (no existe)", "ABCB (does not exist)"), input: { board: [
        ["A","B","C","E"],
        ["S","F","C","S"],
        ["A","D","E","E"]], word: "ABCB" } },
    ],

    build(input) {
      const board = input.board.map((r) => r.slice());
      const word = input.word;
      const m = board.length, n = board[0].length;
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      const steps = [];
      const path = new Set();
      let cur = null, matched = 0, found = false;
      const MAX = 260;

      const snap = (note, line) => {
        if (steps.length > MAX) return;
        const cells = board.map((row, r) => row.map((v, c) => {
          let cls = "";
          if (cur && cur[0] === r && cur[1] === c) cls = "current";
          else if (path.has(r + "," + c)) cls = "path";
          return { v: input.board[r][c], cls };
        }));
        steps.push({ line, note,
          grid: { cells, label: "board", coords: false },
          vars: [{ k: L("palabra", "word"), v: word }, { k: L("emparejadas", "matched"), v: matched + "/" + word.length }] });
      };

      function dfs(r, c, i) {
        if (found) return true;
        if (i === word.length) return true;
        // Los dos motivos de fallo van por separado: enseñan cosas distintas.
        if (r < 0 || r >= m || c < 0 || c >= n) {
          cur = null;
          snap(L(`(${r},${c}) se sale del tablero. Retrocedemos.`,
                 `(${r},${c}) falls off the board. Backtrack.`), [A.fuera, A.retFuera]);
          return false;
        }
        cur = [r, c];
        if (board[r][c] !== word[i]) {
          snap(L(`(${r},${c}) no coincide con '${word[i]}'. Retrocedemos.`,
                 `(${r},${c}) doesn't match '${word[i]}'. Backtrack.`), [A.otraLetra, A.retOtra]);
          return false;
        }
        path.add(r + "," + c);
        matched = i + 1;
        snap(L(`'${word[i]}' encaja en (${r},${c}). Buscamos '${word[i+1] || "(fin)"}' en las vecinas.`,
               `'${word[i]}' fits at (${r},${c}). We look for '${word[i+1] || "(end)"}' in the neighbors.`),
             [A.guarda, A.ocupa, A.porVecina]);
        const save = board[r][c];
        board[r][c] = "#";
        for (const [dr, dc] of dirs) {
          if (dfs(r + dr, c + dc, i + 1)) { found = true; return true; }
        }
        board[r][c] = save;
        path.delete(r + "," + c);
        matched = i;
        cur = [r, c];
        snap(L(`Ninguna vecina continúa la palabra. Deshacemos (${r},${c}).`,
               `No neighbor continues the word. Undo (${r},${c}).`), [A.devuelve, A.retFalso]);
        return false;
      }

      snap(L(`Buscamos "${word}". Probamos como inicio cada celda.`,
             `We search "${word}". We try each cell as a start.`), [A.fn, A.porCelda]);
      outer:
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          if (board[r][c] === word[0]) {
            if (dfs(r, c, 0)) break outer;
          }
        }
      cur = null;
      if (found) snap(L(`¡Palabra "${word}" encontrada! Respuesta <b>verdadero</b>.`,
                       `Word "${word}" found! Answer <b>true</b>.`), [A.siDfs, A.hallada]);
      else snap(L(`Agotamos todos los inicios sin formar "${word}". Respuesta <b>falso</b>.`,
                 `We exhausted every start without forming "${word}". Answer <b>false</b>.`), A.noHallada);
      return steps;
    },
  };
})();
