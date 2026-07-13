/* 76. Minimum Window Substring — ventana deslizante de tamaño variable con
   conteo de caracteres necesarios vs. cubiertos. */
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });

  const C = VIS.code([
    ["fn",           "funcion ventanaMinima(s, t):",                                  "function minWindow(s, t):"],
    ["necesita",     "  necesita[c] = veces que aparece c en t, para cada carácter c", "  need[c] = times c appears in t, for each character c"],
    ["requeridos",   "  requeridos = cantidad de caracteres DISTINTOS de t",           "  required = number of DISTINCT characters in t"],
    ["ventanaVacia", "  ventana empieza vacía, cubiertos empieza en 0",                "  window starts empty, covered starts at 0"],
    ["L0",           "  L empieza en 0",                                              "  L starts at 0"],
    ["porR",         "  para R desde 0 hasta el final de s:",                         "  for R from 0 to the end of s:"],
    ["meteR",        "    meter s[R] a la ventana",                                   "    add s[R] to the window"],
    ["siCubreC",     "    si s[R] es necesario Y ventana[s[R]] llegó justo a necesita[s[R]]:",
                      "    if s[R] is needed AND window[s[R]] just reached need[s[R]]:"],
    ["sumaCubiertos","      sumar 1 a cubiertos",                                      "      add 1 to covered"],
    ["mientrasCubre","    mientras cubiertos == requeridos:   // la ventana YA cubre todo t",
                      "    while covered == required:   // the window ALREADY covers all of t"],
    ["guardaMejor",  "      si esta ventana es más chica que la mejor guardada, guardarla",
                      "      if this window is smaller than the best saved one, save it"],
    ["sacaL",        "      sacar s[L] de la ventana",                                "      remove s[L] from the window"],
    ["siDescubre",   "      si s[L] es necesario Y ventana[s[L]] cayó debajo de necesita[s[L]]:",
                      "      if s[L] is needed AND window[s[L]] fell below need[s[L]]:"],
    ["restaCubiertos","        restar 1 a cubiertos",                                  "        subtract 1 from covered"],
    ["avanzaL",      "      L pasa a ser L + 1",                                       "      L becomes L + 1"],
    ["retorna",      "  retornar la mejor ventana guardada (o \"\" si nunca cubrió)",   "  return the best window saved (or \"\" if it never covered)"],
  ]);
  const A = C.L;

  P["76"] = {
    num: 76, slug: "minimum-window-substring", title: "Minimum Window Substring",
    difficulty: "H", block: "sliding-window-stack", tags: ["sliding window"],
    summary: L(
      "Expandimos R hasta que la ventana cubra todo t, y entonces la encogemos desde L todo lo posible sin perder la cobertura, guardando la más chica vista.",
      "We expand R until the window covers all of t, then shrink it from L as much as possible without losing coverage, saving the smallest one seen."),
    legend: [
      { cls: "window", label: L("ventana actual [L,R]", "current window [L,R]") },
      { cls: "hot", label: L("carácter en proceso", "character in process") },
    ],
    code: C,
    cases: [
      { name: L('s="ADOBECODEBANC", t="ABC" → "BANC"', 's="ADOBECODEBANC", t="ABC" → "BANC"'), input: { s: "ADOBECODEBANC", t: "ABC" } },
      { name: L('s="a", t="aa" → ""', 's="a", t="aa" → ""'), input: { s: "a", t: "aa" } },
      { name: L('s="ab", t="b" → "b"', 's="ab", t="b" → "b"'), input: { s: "ab", t: "b" } },
    ],

    editor: {
      kind: "text",
      fields: [
        { id: "s", type: "text", label: L("s:", "s:"), placeholder: L("ej. ADOBECODEBANC", "ex. ADOBECODEBANC"),
          sanitize: (v) => v.replace(/[\r\n]/g, "").slice(0, 40) },
        { id: "t", type: "text", label: L("t:", "t:"), placeholder: L("ej. ABC", "ex. ABC"),
          sanitize: (v) => v.replace(/[\r\n]/g, "").slice(0, 20) },
      ],
      initial() { return { s: "ADOBECODEBANC", t: "ABC" }; },
      parse(state) {
        const s = String(state.s || "");
        const t = String(state.t || "");
        if (!s.length) return { ok: false, field: "s", error: L("s no puede estar vacía.", "s cannot be empty.") };
        if (!t.length) return { ok: false, field: "t", error: L("t no puede estar vacía.", "t cannot be empty.") };
        return { ok: true, input: { s, t } };
      },
      previewSpec(input) {
        return { type: "array", label: L("Cadena s", "String s"),
          items: input.s.split("").map((ch) => ({ v: ch })), indices: true };
      },
      hint: L("Ingresa s y t (hasta 40 y 20 caracteres).", "Enter s and t (up to 40 and 20 characters).")
    },

    build(input) {
      const s = String(input.s || "");
      const t = String(input.t || "");
      const chars = s.split("");
      const steps = [];
      const necesita = {};
      for (const c of t) necesita[c] = (necesita[c] || 0) + 1;
      const requeridos = Object.keys(necesita).length;
      const ventana = {};
      let cubiertos = 0;
      let izq = 0;
      let mejorLen = Infinity, mejorL = 0;

      const snap = (note, line, R) => {
        const win = R != null && R >= izq ? [izq, R] : [null, null];
        const markers = [];
        if (R != null) {
          markers.push({ index: izq, label: "L", cls: "" });
          if (R !== izq) markers.push({ index: R, label: "R", cls: "" });
        }
        steps.push({
          note, line,
          array: {
            label: L("Cadena s", "String s"),
            items: chars.map((ch, i) => ({ v: ch, cls: i === R ? "hot" : "" })),
            indices: true,
            windowRange: win,
            markers,
          },
          vars: [
            { k: L("faltan por cubrir", "still needed"), v: requeridos - cubiertos, cls: (requeridos - cubiertos) === 0 ? "result" : "" },
            { k: L("mejor ventana", "best window"), v: mejorLen === Infinity ? "—" : mejorLen },
          ],
        });
      };

      snap(L(`necesita: t tiene ${requeridos} carácter(es) distinto(s). Ventana vacía, cubiertos = 0, L = 0.`,
             `need: t has ${requeridos} distinct character(s). Empty window, covered = 0, L = 0.`),
           [A.necesita, A.requeridos, A.ventanaVacia, A.L0], null);

      for (let R = 0; R < chars.length; R++) {
        const c = chars[R];
        ventana[c] = (ventana[c] || 0) + 1;
        let cubrioNuevo = false;
        if (necesita[c] != null && ventana[c] === necesita[c]) { cubiertos++; cubrioNuevo = true; }
        snap(cubrioNuevo
          ? L(`R=${R}: metemos "${c}" a la ventana. Ahora cubre exactamente lo que t necesita de "${c}". Cubiertos = ${cubiertos}.`,
              `R=${R}: add "${c}" to the window. It now covers exactly what t needs of "${c}". Covered = ${cubiertos}.`)
          : L(`R=${R}: metemos "${c}" a la ventana.`, `R=${R}: add "${c}" to the window.`),
          [A.porR, A.meteR, A.siCubreC, A.sumaCubiertos], R);

        while (izq <= R && cubiertos === requeridos) {
          if (R - izq + 1 < mejorLen) {
            mejorLen = R - izq + 1;
            mejorL = izq;
            snap(L(`Ventana [${izq},${R}] cubre todo t y mide ${mejorLen}: es la mejor hasta ahora.`,
                   `Window [${izq},${R}] covers all of t and has length ${mejorLen}: best so far.`),
                 [A.mientrasCubre, A.guardaMejor], R);
          }
          const lc = chars[izq];
          ventana[lc]--;
          let perdioCobertura = false;
          if (necesita[lc] != null && ventana[lc] < necesita[lc]) { cubiertos--; perdioCobertura = true; }
          snap(perdioCobertura
            ? L(`Sacamos "${lc}" (índice ${izq}): ya no cubre "${lc}". Cubiertos = ${cubiertos}. L avanza.`,
                `Remove "${lc}" (index ${izq}): "${lc}" is no longer covered. Covered = ${cubiertos}. L advances.`)
            : L(`Sacamos "${lc}" (índice ${izq}): sigue cubierto. L avanza.`,
                `Remove "${lc}" (index ${izq}): still covered. L advances.`),
            [A.sacaL, A.siDescubre, A.restaCubiertos, A.avanzaL], R);
          izq++;
        }
      }

      const resultado = mejorLen === Infinity ? "" : s.substr(mejorL, mejorLen);
      steps.push({
        note: resultado
          ? L(`Ventana mínima que cubre t: <b>"${resultado}"</b> (longitud ${mejorLen}).`,
              `Minimum window covering t: <b>"${resultado}"</b> (length ${mejorLen}).`)
          : L("Ninguna ventana cubre t por completo: respuesta \"\".", "No window fully covers t: answer \"\"."),
        line: A.retorna,
        array: {
          label: L("Cadena s", "String s"),
          items: chars.map((ch, i) => ({ v: ch, cls: resultado && i >= mejorL && i < mejorL + mejorLen ? "match" : "" })),
          indices: true,
          windowRange: resultado ? [mejorL, mejorL + mejorLen - 1] : [null, null],
        },
        vars: [
          { k: L("faltan por cubrir", "still needed"), v: requeridos - cubiertos },
          { k: L("mejor ventana", "best window"), v: mejorLen === Infinity ? "—" : mejorLen, cls: "result" },
        ],
      });
      return steps;
    },
  };
})();
