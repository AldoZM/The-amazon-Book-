/* 79. Word Search — DFS con backtracking sobre la cuadrícula. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
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
    code: {
      es: [
        "funcion exist(board, palabra):",
        "  para cada celda (r,c):",
        "    si dfs(r,c,0): retornar verdadero",
        "  retornar falso",
        "",
        "funcion dfs(r,c,i):",
        "  si i == longitud(palabra): retornar verdadero",
        "  si fuera de límites o board[r][c] != palabra[i]:",
        "    retornar falso",
        "  guardar letra; board[r][c] ← '#'   // ocupar",
        "  para cada vecina: si dfs(vecina, i+1): return true",
        "  board[r][c] ← letra    // deshacer (backtrack)",
        "  retornar falso",
      ],
      en: [
        "function exist(board, word):",
        "  for each cell (r,c):",
        "    if dfs(r,c,0): return true",
        "  return false",
        "",
        "function dfs(r,c,i):",
        "  if i == length(word): return true",
        "  if out of bounds or board[r][c] != word[i]:",
        "    return false",
        "  save letter; board[r][c] ← '#'   // occupy",
        "  for each neighbor: if dfs(neighbor, i+1): return true",
        "  board[r][c] ← letter   // undo (backtrack)",
        "  return false",
      ],
    },
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
        cur = [r, c];
        if (i === word.length) return true;
        if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[i]) {
          snap(L(`(${r},${c}) no coincide con '${word[i]}'. Retrocedemos.`,
                 `(${r},${c}) doesn't match '${word[i]}'. Backtrack.`), [7, 8]);
          return false;
        }
        path.add(r + "," + c);
        matched = i + 1;
        snap(L(`'${word[i]}' encaja en (${r},${c}). Buscamos '${word[i+1] || "(fin)"}' en las vecinas.`,
               `'${word[i]}' fits at (${r},${c}). We look for '${word[i+1] || "(end)"}' in the neighbors.`), [6, 9]);
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
               `No neighbor continues the word. Undo (${r},${c}).`), 12);
        return false;
      }

      snap(L(`Buscamos "${word}". Probamos como inicio cada celda.`,
             `We search "${word}". We try each cell as a start.`), [0, 1]);
      outer:
      for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
          if (board[r][c] === word[0]) {
            if (dfs(r, c, 0)) break outer;
          }
        }
      cur = null;
      if (found) snap(L(`¡Palabra "${word}" encontrada! Respuesta <b>verdadero</b>.`,
                       `Word "${word}" found! Answer <b>true</b>.`), 2);
      else snap(L(`Agotamos todos los inicios sin formar "${word}". Respuesta <b>falso</b>.`,
                 `We exhausted every start without forming "${word}". Answer <b>false</b>.`), 3);
      return steps;
    },
  };
})();
