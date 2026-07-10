/* ============================================================================
   test-editors.js — Los descriptores `editor` de todos los problemas que tienen
   modo interactivo.

   La comprobación que de verdad importa es la última de cada bloque:
   `build(editor.toInput(editor.initial()))` debe generar pasos sin lanzar. Ahí
   es donde se cazaría un editor que produce una forma de `input` que su propio
   `build()` no acepta (p. ej. números donde build compara contra "1" de texto).

   Uso: node tools/test-editors.js   (desde rep-visual/)
   ========================================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function mkNode() {
  return {
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
    appendChild(c) { return c; }, addEventListener() {}, setAttribute() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
  };
}
const sandbox = {
  console,
  document: {
    createElement: mkNode, createTextNode: (t) => ({ _txt: t }),
    createElementNS: mkNode,
    querySelector: () => null, querySelectorAll: () => [],
    documentElement: { setAttribute() {} }, getElementById: () => null,
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: "" },
  URLSearchParams: class { get() { return null; } },
};
sandbox.window = sandbox;
vm.createContext(sandbox);

const NUMS = ["79", "98", "103", "124", "199", "200", "236", "297", "337", "417",
              "542", "543", "547", "695", "863", "987", "994", "1091", "1644"];
for (const f of ["js/i18n.js", "js/renderers.js", "js/editors.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
for (const n of NUMS)
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/problems", n + ".js"), "utf8"), sandbox, { filename: n });

const P = sandbox.window.PROBLEMS;
sandbox.VIS.lang = "es";

let fails = 0;
const ok = (name, cond) => { if (cond) console.log(`  ✓ ${name}`); else { fails++; console.log(`  ✗ ${name}`); } };
const eq = (name, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (!good) { fails++; console.log(`  ✗ ${name}\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`); }
  else console.log(`  ✓ ${name}`);
};

// Corre build() con lo que produce el editor. Es la prueba de integración: si el
// editor devuelve una forma que build() no entiende, aquí revienta.
function buildRuns(num, ed) {
  const p = P[num];
  let steps;
  try {
    steps = p.build(ed.toInput(ed.initial()));
  } catch (e) {
    fails++;
    console.log(`  ✗ build(toInput(initial())) lanzó: ${e.message}`);
    return null;
  }
  ok("build(toInput(initial())) genera pasos", Array.isArray(steps) && steps.length > 0);
  ok("todo paso trae `line`", steps.every((s) => s.line != null));
  return steps;
}

/* Comprueba el RESULTADO, no solo que haya pasos.

   Hace falta porque el fallo típico es silencioso: si el editor de 200
   devolviera números en vez del texto "1"/"0", su build() —que compara con
   `!== "1"`— no lanzaría: contaría cero islas y generaría pasos igualmente.
   Colocando la celda con el `cycle` del propio editor y exigiendo el resultado
   correcto, un editor con el tipo equivocado hace fallar el test.            */
function outcome(num, ed, mutar, esperado, nombre) {
  const g = ed.initial();
  mutar(g, ed);
  const steps = P[num].build(ed.toInput(g));
  const nota = steps[steps.length - 1].note.es.replace(/<[^>]+>/g, "");
  const good = esperado.test(nota);
  if (!good) { fails++; console.log(`  ✗ ${nombre}\n      nota final: ${nota}`); }
  else console.log(`  ✓ ${nombre}`);
}

/* Como `outcome`, pero para editores de árbol (kind "text", con parse() en
   vez de toInput()): parsea un árbol escrito a mano y exige la nota final. */
function treeOutcome(num, ed, arbol, esperado, nombre) {
  const parsed = ed.parse({ tree: arbol });
  if (!parsed.ok) { fails++; console.log(`  ✗ ${nombre}\n      parse rechazó "${arbol}": ${parsed.error && parsed.error.es}`); return; }
  const steps = P[num].build(parsed.input);
  const nota = steps[steps.length - 1].note.es.replace(/<[^>]+>/g, "");
  const good = esperado.test(nota);
  if (!good) { fails++; console.log(`  ✗ ${nombre}\n      nota final: ${nota}`); }
  else console.log(`  ✓ ${nombre}`);
}

// Un editor de rejilla no puede mutar la cuadrícula al preguntarle cómo pintar.
function cellViewIsPure(ed) {
  const g = ed.initial();
  const before = JSON.stringify(g);
  for (let r = 0; r < ed.rows; r++) for (let c = 0; c < ed.cols; c++) ed.cellView(g[r][c], r, c);
  return JSON.stringify(g) === before;
}

/* ---------------------------------------------------------- contrato común */
console.log("── contrato común ──");
for (const n of NUMS) {
  const ed = P[n].editor;
  ok(`${n}: tiene editor`, !!ed);
  if (!ed) continue;
  const kind = ed.kind || "grid";
  ok(`${n}: kind válido (${kind})`, kind === "grid" || kind === "text");
  ok(`${n}: hint bilingüe`, typeof ed.hint.es === "string" && typeof ed.hint.en === "string");
  ok(`${n}: initial() es función`, typeof ed.initial === "function");
  if (kind === "grid") ok(`${n}: toInput() es función`, typeof ed.toInput === "function");
  else ok(`${n}: parse() y previewSpec() son funciones`, typeof ed.parse === "function" && typeof ed.previewSpec === "function");
}

/* -------------------------------------------------------------- 200 (texto) */
console.log("\n── 200 Number of Islands (celdas de texto) ──");
{
  const ed = P["200"].editor;
  eq("initial() es 5×5 de agua \"0\"", ed.initial(), Array.from({ length: 5 }, () => ["0","0","0","0","0"]));
  eq("cycle agua -> tierra", ed.cycle(ed.initial(), 2, 2)[2][2], "1");
  eq("cycle tierra -> agua", ed.cycle(ed.cycle(ed.initial(), 2, 2), 2, 2)[2][2], "0");
  eq("cellView tierra", ed.cellView("1"), { v: "1", cls: "land" });
  eq("cellView agua", ed.cellView("0"), { v: "0", cls: "water" });
  ok("las celdas son texto, no números (build compara con ===)", typeof ed.initial()[0][0] === "string");
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("200", ed);
  outcome("200", ed, (g, e) => { e.cycle(g, 2, 2); },
          /Total de islas: 1\./, "una celda puesta con cycle -> exactamente 1 isla");
  outcome("200", ed, () => {}, /Total de islas: 0\./, "cuadrícula vacía -> 0 islas");
}

/* ------------------------------------------------------------ 695 (binario) */
console.log("\n── 695 Max Area of Island ──");
{
  const ed = P["695"].editor;
  eq("initial() es 5×5 de ceros", ed.initial(), Array.from({ length: 5 }, () => [0,0,0,0,0]));
  eq("cycle 0 -> 1", ed.cycle(ed.initial(), 2, 2)[2][2], 1);
  eq("cycle 1 -> 0", ed.cycle(ed.cycle(ed.initial(), 2, 2), 2, 2)[2][2], 0);
  eq("cellView tierra", ed.cellView(1), { v: "1", cls: "land" });
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("695", ed);
  outcome("695", ed, (g, e) => { e.cycle(g, 2, 2); },
          /Área máxima: 1\./, "una celda puesta con cycle -> área 1");
}

/* -------------------------------------------------------------- 542 (fuente) */
console.log("\n── 542 01 Matrix ──");
{
  const ed = P["542"].editor;
  const g = ed.initial();
  eq("initial() trae una fuente al centro", g[2][2], 0);
  ok("initial() tiene exactamente una fuente", g.flat().filter((v) => v === 0).length === 1);
  eq("cycle fuente -> por calcular", ed.cycle(ed.initial(), 2, 2)[2][2], 1);
  eq("cellView fuente usa la clase de build()", ed.cellView(0), { v: "0", cls: "fresh" });
  eq("cellView por calcular", ed.cellView(1), { v: "1", cls: "water" });
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("542", ed);
  // Sin ninguna fuente el algoritmo es válido: todo queda en infinito.
  const sinFuente = ed.initial().map((r) => r.map(() => 1));
  let steps = null;
  try { steps = P["542"].build(ed.toInput(sinFuente)); } catch (e) { fails++; console.log(`  ✗ sin fuente lanzó: ${e.message}`); }
  ok("sin ninguna fuente no lanza", Array.isArray(steps) && steps.length > 0);
}

/* --------------------------------------------------------- 994 (ciclo de 3) */
console.log("\n── 994 Rotting Oranges (ciclo de tres estados) ──");
{
  const ed = P["994"].editor;
  const g = ed.initial();
  eq("initial() trae una podrida en (0,0)", g[0][0], 2);
  ok("el resto arranca fresco", g.flat().filter((v) => v === 1).length === 24);
  eq("cycle fresca -> podrida", ed.cycle(ed.initial(), 1, 1)[1][1], 2);
  eq("cycle podrida -> vacío (da la vuelta)", ed.cycle(ed.cycle(ed.initial(), 1, 1), 1, 1)[1][1], 0);
  eq("cycle vacío -> fresca", ed.cycle(ed.cycle(ed.cycle(ed.initial(), 1, 1), 1, 1), 1, 1)[1][1], 1);
  eq("cellView vacío", ed.cellView(0), { v: "", cls: "water" });
  eq("cellView fresca", ed.cellView(1), { v: "1", cls: "fresh" });
  eq("cellView podrida", ed.cellView(2), { v: "2", cls: "rotten" });
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("994", ed);
  // Una podrida en la esquina de un 5×5 de frescas: la más lejana está a 8
  // pasos en 4 direcciones.
  outcome("994", ed, () => {}, /8 minutos/, "podrida en (0,0) -> 8 minutos");
  // Sin ninguna podrida no se pudre nada y quedan frescas: respuesta -1.
  outcome("994", ed, (g, e) => { e.cycle(g, 0, 0); e.cycle(g, 0, 0); },
          /-1/, "sin ninguna podrida -> -1");
}

/* --------------------------------------------------------- 417 (alturas 1-9) */
console.log("\n── 417 Pacific Atlantic (ciclo de alturas) ──");
{
  const ed = P["417"].editor;
  const g = ed.initial();
  eq("initial() es 5×5", [g.length, g[0].length], [5, 5]);
  ok("todas las alturas están entre 1 y 9", g.flat().every((v) => v >= 1 && v <= 9));
  eq("cycle sube un escalón", ed.cycle(ed.initial(), 0, 0)[0][0], 2);
  eq("cycle borde 8 -> 9", (() => { const g2 = ed.initial(); g2[0][0] = 8; return ed.cycle(g2, 0, 0)[0][0]; })(), 9);
  eq("cycle da la vuelta 9 -> 1", (() => { const g2 = ed.initial(); g2[0][0] = 9; return ed.cycle(g2, 0, 0)[0][0]; })(), 1);
  eq("cellView muestra la altura", ed.cellView(7), { v: "7", cls: "water" });
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("417", ed);
  // Las alturas del ejemplo clásico dan 7 celdas que alcanzan ambos océanos.
  outcome("417", ed, () => {}, /ambos océanos \(resaltadas\): 7\./, "ejemplo clásico -> 7 celdas");
  // Meseta plana: el agua fluye a cualquier vecina, así que las 25 alcanzan ambos.
  outcome("417", ed, (g) => { for (const row of g) row.fill(1); },
          /ambos océanos \(resaltadas\): 25\./, "meseta plana -> las 25 celdas");
}

/* -------------------------------------------------------- 1091 (el piloto) */
console.log("\n── 1091 Shortest Path (piloto) ──");
{
  const ed = P["1091"].editor;
  eq("cycle libre -> muro", ed.cycle(ed.initial(), 2, 2)[2][2], 1);
  eq("cycle no toca el inicio", ed.cycle(ed.initial(), 0, 0)[0][0], 0);
  eq("cycle no toca la meta", ed.cycle(ed.initial(), 4, 4)[4][4], 0);
  ok("cellView no muta", cellViewIsPure(ed));
  buildRuns("1091", ed);
}

/* --------------------------------------------------------- 79 (modo texto) */
console.log("\n── 79 Word Search (modo texto) ──");
{
  const ed = P["79"].editor;
  eq("kind es text", ed.kind, "text");
  eq("un solo campo, llamado word", ed.fields.map((f) => f.id), ["word"]);
  eq("initial() es un objeto de campos", ed.initial(), { word: "ABCCED" });

  const san = ed.fields[0].sanitize;
  eq("sanitize pasa a mayúsculas", san("abc"), "ABC");
  eq("sanitize tira lo que no es letra", san("a1b-c "), "ABC");
  eq("sanitize corta a 10", san("ABCDEFGHIJKLMNOP").length, 10);

  const vacio = ed.parse({ word: "" });
  eq("parse rechaza la palabra vacía", vacio.ok, false);
  eq("y señala el campo", vacio.field, "word");
  ok("con mensaje bilingüe", typeof vacio.error.es === "string" && typeof vacio.error.en === "string");

  const bien = ed.parse({ word: "SEE" });
  eq("parse acepta una palabra", bien.ok, true);
  ok("y devuelve {board, word}", Array.isArray(bien.input.board) && bien.input.word === "SEE");
  bien.input.board[0][0] = "Z";
  eq("parse copia el tablero (no lo comparte)", ed.board[0][0], "A");

  // Hallazgo 2 (regresión): el campo `word` declaraba maxlength/autocapitalize
  // en el <input> de problem.html; el motor los tiene que fijar si el campo
  // los declara.
  eq("campo word declara maxlength 10", ed.fields[0].maxlength, 10);
  eq("campo word declara autocapitalize characters", ed.fields[0].autocapitalize, "characters");

  const spec = ed.previewSpec();
  eq("previewSpec es una rejilla", spec.type, "grid");
  eq("previewSpec: 3 filas × 4 columnas", [spec.cells.length, spec.cells[0].length], [3, 4]);
  ok("VIS.renderers sabe pintar ese type", typeof sandbox.VIS.renderers[spec.type] === "function");

  // Palabras conocidas del tablero clásico.
  const existe = P["79"].build(ed.parse({ word: "SEE" }).input);
  ok("SEE existe en el tablero", /verdadero/.test(existe[existe.length - 1].note.es));
  const noExiste = P["79"].build(ed.parse({ word: "ABCB" }).input);
  ok("ABCB no existe", /falso/.test(noExiste[noExiste.length - 1].note.es));
}

/* ------------------------------------------- 547 (matriz de adyacencia) */
console.log("\n── 547 Number of Provinces (matriz simétrica) ──");
{
  const ed = P["547"].editor;
  const g = ed.initial();
  eq("initial() es 5×5", [g.length, g[0].length], [5, 5]);
  ok("la diagonal arranca en 1", [0,1,2,3,4].every((i) => g[i][i] === 1));
  ok("fuera de la diagonal arranca en 0", g[0][1] === 0 && g[3][1] === 0);

  // Un toque cambia DOS celdas: la matriz es simétrica.
  const g2 = ed.cycle(ed.initial(), 1, 3);
  eq("cycle marca (1,3)", g2[1][3], 1);
  eq("cycle marca también (3,1)", g2[3][1], 1);
  const g3 = ed.cycle(g2, 1, 3);
  eq("volver a tocar desmarca las dos", [g3[1][3], g3[3][1]], [0, 0]);

  // La diagonal no se toca: una ciudad siempre está conectada consigo misma.
  const g4 = ed.cycle(ed.initial(), 2, 2);
  eq("cycle no toca la diagonal", g4[2][2], 1);

  eq("cellView conectada", ed.cellView(1, 0, 1), { v: "1", cls: "land" });
  eq("cellView sin conexión", ed.cellView(0, 0, 1), { v: "0", cls: "water" });
  eq("cellView diagonal", ed.cellView(1, 2, 2), { v: "1", cls: "visited" });
  ok("cellView no muta", cellViewIsPure(ed));

  buildRuns("547", ed);
  // 5 ciudades sin ninguna conexión: 5 provincias.
  outcome("547", ed, () => {}, /5/, "sin conexiones -> 5 provincias");
  // Unir 0-1 y 1-2 deja 3 provincias: {0,1,2}, {3}, {4}.
  outcome("547", ed, (g, e) => { e.cycle(g, 0, 1); e.cycle(g, 1, 2); },
          /3/, "dos conexiones encadenadas -> 3 provincias");
}

/* ------------------------------------------------- VIS.treeEditor (factoría) */
console.log("\n── VIS.treeEditor (campo tree) ──");
{
  // Hallazgo 2 (regresión): un árbol como [3,9,20,null,null,15,7] pasa de 10
  // caracteres y no se escribe en mayúsculas, así que el campo `tree` NO debe
  // declarar maxlength ni autocapitalize.
  const ed = sandbox.VIS.treeEditor("[3,9,20,null,null,15,7]", { es: "hint", en: "hint" });
  ok("campo tree no declara maxlength", ed.fields[0].maxlength === undefined);
  ok("campo tree no declara autocapitalize", ed.fields[0].autocapitalize === undefined);
}

/* ------------------------------------------------- los ocho de árbol */
console.log("\n── Árboles (un arreglo de LeetCode) ──");
{
  const ARBOLES = {
    "98":  "[2,1,3]",
    "103": "[3,9,20,null,null,15,7]",
    "124": "[1,2,3]",
    "199": "[1,2,3,null,5,null,4]",
    "297": "[1,2,3,null,null,4,5]",
    "337": "[3,2,3,null,3,null,1]",
    "543": "[1,2,3,4,5]",
    "987": "[3,9,20,null,null,15,7]",
  };
  // Nota final esperada para cada problema con el árbol [5,3,8,1,4] escrito a
  // mano. Sirve para cazar un editor cuyo build() no truena pero produce el
  // resultado equivocado (p. ej. devuelve el texto crudo en vez del arreglo
  // parseado, o los nodos en otro orden): buildRuns/steps.length no lo vería,
  // pero la nota final sí.
  const NOTA_ESPERADA = {
    "98":  /Todos los nodos respetan su rango: es BST\./,
    "103": /Recorrido zigzag: \[\[5\], \[8,3\], \[1,4\]\]\./,
    "124": /Suma máxima de camino: 20\./,
    "199": /Vista desde la derecha: \[5, 8, 4\]\./,
    "297": /Cadena final: 5,3,8,1,4,#,#,#,#,#,#\. Deserializar la lee en el mismo orden BFS\./,
    "337": /Botín máximo = máx\(10, 13\) = 13\./,
    "543": /Diámetro del árbol: 3 aristas\./,
    "987": /Columnas de izquierda a derecha: c-2:\[1\]  c-1:\[3\]  c0:\[5,4\]  c1:\[8\]\./,
  };

  for (const [n, arranque] of Object.entries(ARBOLES)) {
    const ed = P[n].editor;
    eq(`${n}: kind text, campo "tree"`, [ed.kind, ed.fields.map((f) => f.id)], ["text", ["tree"]]);
    eq(`${n}: initial() trae su árbol`, ed.initial(), { tree: arranque });

    const bien = ed.parse(ed.initial());
    ok(`${n}: parse acepta su propio arranque`, bien.ok === true);
    ok(`${n}: parse devuelve el arreglo que build() espera`, Array.isArray(bien.input));

    const malo = ed.parse({ tree: "[1,2" });
    eq(`${n}: parse rechaza el corchete sin cerrar`, malo.ok, false);
    eq(`${n}: y señala el campo tree`, malo.field, "tree");

    const spec = ed.previewSpec(bien.input);
    eq(`${n}: previewSpec es un árbol`, spec.type, "tree");
    ok(`${n}: VIS.renderers sabe pintarlo`, typeof sandbox.VIS.renderers[spec.type] === "function");

    // Lo que de verdad importa: el arreglo que produce parse() lo digiere build().
    let steps = null;
    try { steps = P[n].build(bien.input); } catch (e) { fails++; console.log(`  ✗ ${n}: build lanzó: ${e.message}`); }
    ok(`${n}: build(parse(initial())) genera pasos`, Array.isArray(steps) && steps.length > 0);
    ok(`${n}: todo paso trae line`, steps && steps.every((s) => s.line != null));

    // Aserción de resultado: no basta con que build() no truene, la nota
    // final del árbol [5,3,8,1,4] tiene que ser la correcta.
    treeOutcome(n, ed, "[5,3,8,1,4]", NOTA_ESPERADA[n], `${n}: [5,3,8,1,4] -> nota final correcta`);
  }

  // 98 aparte: distingue las dos ramas (BST válido vs. violación) con un
  // segundo árbol que sí rompe la propiedad de BST.
  treeOutcome("98", P["98"].editor, "[5,1,4,null,null,3,6]", /Encontramos una violación: no es BST\./,
              "98: [5,1,4,null,null,3,6] no es BST -> nota final correcta");

  // Un árbol distinto del de arranque también funciona: 543 con una cadena.
  const ed543 = P["543"].editor;
  const cadena = ed543.parse({ tree: "[1,2,null,3,null,4]" });
  ok("543 acepta una cadena escrita a mano", cadena.ok === true);
  const st = P["543"].build(cadena.input);
  const notaCadena = st[st.length - 1].note.es.replace(/<[^>]+>/g, "");
  ok("543 sobre la cadena da diámetro 3", /Diámetro del árbol: 3 aristas\./.test(notaCadena));

  // Salen todos de la misma fábrica, pero cada uno con su propio estado: si
  // compartieran el objeto, escribir en un problema cambiaría el de al lado.
  const a = P["98"].editor, b = P["543"].editor;
  ok("cada problema tiene su propio descriptor", a !== b);
  ok("y su propio árbol de partida", a.initial().tree !== b.initial().tree);
  ok("los ocho comparten el mismo parse (viene de la fábrica)",
     Object.keys(ARBOLES).every((n) => typeof P[n].editor.parse === "function"));
}

/* -------------------------------- árboles con parámetros (236, 1644, 863) */
console.log("\n── Árboles con parámetros ──");
{
  const ARB = "[3,5,1,6,2,0,8,null,null,7,4]";
  const nota = (steps) => steps[steps.length - 1].note.es.replace(/<[^>]+>/g, "");

  /* --- 236: p y q, solo nodos que existen --- */
  const e236 = P["236"].editor;
  eq("236: kind text", e236.kind, "text");
  eq("236: tres campos", e236.fields.map((f) => f.id), ["tree", "p", "q"]);
  eq("236: tipos", e236.fields.map((f) => f.type), ["text", "select", "select"]);
  eq("236: initial()", e236.initial(), { tree: ARB, p: "5", q: "1" });

  eq("236: las opciones son los nodos, ordenados",
     e236.fields[1].options({ tree: ARB }).map((o) => o.value),
     ["0", "1", "2", "3", "4", "5", "6", "7", "8"]);
  eq("236: con el árbol roto, sin opciones", e236.fields[1].options({ tree: "[3,5" }), []);

  const r236 = e236.parse(e236.initial());
  ok("236: parse acepta su arranque", r236.ok === true);
  eq("236: parse convierte p y q a número", [r236.input.p, r236.input.q], [5, 1]);
  ok("236: parse devuelve el árbol parseado", Array.isArray(r236.input.tree));
  eq("236: parse rechaza el árbol roto", e236.parse({ tree: "[3,5", p: "5", q: "1" }).field, "tree");
  eq("236: previewSpec resalta p y q",
     e236.previewSpec(r236.input).nodes.filter((n) => n.cls === "target").map((n) => n.label).sort(),
     [1, 5]);
  eq("236: LCA(5,1) = 3", nota(P["236"].build(r236.input)), "LCA(5, 1) = 3.");

  /* --- 1644: q ofrece además la trampa "no existe" --- */
  const e1644 = P["1644"].editor;
  eq("1644: initial()", e1644.initial(), { tree: ARB, p: "5", q: "99" });
  const opsQ = e1644.fields[2].options({ tree: ARB });
  eq("1644: la última opción de q es la trampa", opsQ[opsQ.length - 1].value, "99");
  ok("1644: y su etiqueta lo advierte", /no existe/.test(opsQ[opsQ.length - 1].label));
  ok("1644: p NO ofrece la trampa",
     e1644.fields[1].options({ tree: ARB }).every((o) => o.value !== "99"));

  // Si el árbol YA tiene un 99, la trampa se omite: dos opciones con el mismo
  // value serían un desplegable ambiguo, y la etiqueta "no existe" una mentira.
  const con99 = e1644.fields[2].options({ tree: "[99,1]" });
  eq("1644: con un 99 real, la trampa no se duplica",
     con99.filter((o) => o.value === "99").length, 1);
  ok("1644: y esa opción no dice 'no existe'",
     !/no existe/.test(con99.find((o) => o.value === "99").label));

  const r1644 = e1644.parse(e1644.initial());
  eq("1644: q=99 se acepta", [r1644.ok, r1644.input.q], [true, 99]);
  eq("1644: con q=99 la respuesta es null",
     nota(P["1644"].build(r1644.input)), "Solo encontramos 1/2. Respuesta null.");
  eq("1644: con p=5 y q=4 el LCA es 5",
     nota(P["1644"].build(e1644.parse({ tree: ARB, p: "5", q: "4" }).input)),
     "Ambos presentes. LCA = 5.");

  /* --- 863: target solo existente (build lanza si no), k hasta el diámetro --- */
  const e863 = P["863"].editor;
  eq("863: tres campos", e863.fields.map((f) => f.id), ["tree", "target", "k"]);
  eq("863: initial()", e863.initial(), { tree: ARB, target: "5", k: "2" });
  ok("863: target NO ofrece nodos inexistentes",
     e863.fields[1].options({ tree: ARB }).every((o) => Number(o.value) <= 8));
  eq("863: k llega al diámetro (5), no a la altura-1 (3)",
     e863.fields[2].options({ tree: ARB }).map((o) => o.value), ["0", "1", "2", "3", "4", "5"]);

  const r863 = e863.parse(e863.initial());
  eq("863: parse convierte target y k a número", [r863.input.target, r863.input.k], [5, 2]);
  eq("863: previewSpec resalta el objetivo",
     e863.previewSpec(r863.input).nodes.filter((n) => n.cls === "target").map((n) => n.label), [5]);
  eq("863: target=5, k=2 -> [7, 4, 1]",
     nota(P["863"].build(r863.input)), "Distancia 2 = K. Nodos: [7, 4, 1].");
  eq("863: un k sin resultados no es un error, es una lección",
     nota(P["863"].build(e863.parse({ tree: ARB, target: "3", k: "5" }).input)),
     "No hay nodos a distancia 5. Respuesta [].");

  // La razón por la que `target` es un desplegable y no un campo libre.
  let lanzo = false;
  try { P["863"].build({ tree: JSON.parse(ARB), target: 99, k: 1 }); } catch (e) { lanzo = true; }
  ok("863: build LANZA con un target inexistente (por eso el desplegable)", lanzo);
}

/* ------------------------------------------------- VIS.graphEditor (factoría) */
console.log("\n── VIS.graphEditor (campo graph) ──");
{
  const ed = sandbox.VIS.graphEditor({
    id: 999,
    maxNodos: 10,
    directed: false,
    defaultInput: "[[0,1]]",
    parser: sandbox.VIS.parse.edgeList
  });
  eq("graphEditor: kind es text", ed.kind, "text");
  eq("graphEditor: un solo campo llamado graph", ed.fields.map((f) => f.id), ["graph"]);
  eq("graphEditor: initial() trae su grafo de partida", ed.initial(), { graph: "[[0,1]]" });
  
  const bien = ed.parse(ed.initial());
  ok("graphEditor: parse acepta su arranque", bien.ok === true);
  eq("graphEditor: parse devuelve n y edges", [bien.input.n, bien.input.edges], [2, [[0,1]]]);
  
  const malo = ed.parse({ graph: "[[0,1" });
  eq("graphEditor: parse rechaza el corchete sin cerrar", malo.ok, false);
  eq("graphEditor: y señala el campo graph", malo.field, "graph");
  
  const spec = ed.previewSpec(bien.input);
  eq("previewSpec es un grafo", spec.type, "graph");
  ok("VIS.renderers sabe pintarlo", typeof sandbox.VIS.renderers[spec.type] === "function");
}

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
