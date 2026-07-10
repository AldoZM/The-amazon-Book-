/* Parsers y vistas previas compartidos (js/editors.js).
   Uso: node tools/test-parsers.js   (desde rep-visual/) */
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
    createElement: mkNode, createTextNode: (t) => ({ _txt: t }), createElementNS: mkNode,
    querySelector: () => null, querySelectorAll: () => [],
    documentElement: { setAttribute() {} }, getElementById: () => null, addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: "" },
  URLSearchParams: class { get() { return null; } },
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["js/i18n.js", "js/renderers.js", "js/editors.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
let fails = 0;
const ok = (n, c) => { if (c) console.log(`✓ ${n}`); else { fails++; console.log(`✗ ${n}`); } };
const eq = (n, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (!good) { fails++; console.log(`✗ ${n}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${n}`);
};
const P = (t) => VIS.parse.treeArray(t, 31);

/* --------------------------------------------------------- entradas válidas */
eq("con corchetes", P("[3,9,20,null,null,15,7]").arr, [3, 9, 20, null, null, 15, 7]);
eq("sin corchetes", P("3,9,20").arr, [3, 9, 20]);
eq("con espacios de sobra", P("  [ 1 , 2 ,  3 ] ").arr, [1, 2, 3]);
eq("un solo nodo", P("[7]").arr, [7]);
eq("negativos", P("[-3,-1]").arr, [-3, -1]);
ok("una entrada válida trae ok:true", P("[1,2]").ok === true);
ok("y no trae error", P("[1,2]").error === undefined);

/* ---------------------------------------------------------- entradas malas */
const malo = (t) => { const r = P(t); return r.ok === false && typeof r.error.es === "string" && typeof r.error.en === "string"; };
ok("vacío", malo(""));
ok("solo espacios", malo("   "));
ok("corchete sin cerrar", malo("[1,2"));
ok("corchete sin abrir", malo("1,2]"));
ok("token que no es número ni null", malo("[1,x,3]"));
ok("token decimal", malo("[1.5]"));
ok("coma colgando", malo("[1,2,]"));
ok("la raíz no puede ser null", malo("[null,1]"));
ok("demasiados nodos", malo("[" + Array.from({ length: 32 }, (_, i) => i).join(",") + "]"));
ok("null solo es válido: árbol vacío rechazado", malo("[null]"));

// El mensaje debe decir QUÉ está mal, no solo que algo lo está.
ok("el error del token nombra el token", /x/.test(P("[1,x,3]").error.es));
ok("el error de límite nombra el máximo", /31/.test(P("[" + Array.from({ length: 32 }, (_, i) => i).join(",") + "]").error.es));

/* ------------------------------------------------------------ vista previa */
const spec = VIS.preview.tree([3, 9, 20, null, null, 15, 7], { es: "Árbol", en: "Tree" });
eq("type es tree", spec.type, "tree");
eq("5 nodos", spec.nodes.length, 5);
eq("4 aristas", spec.edges.length, 4);
ok("los nodos traen x, y, label", spec.nodes.every((n) => typeof n.x === "number" && typeof n.y === "number" && n.label != null));
ok("VIS.renderers sabe pintar ese type", typeof VIS.renderers[spec.type] === "function");
eq("un solo nodo: 1 nodo, 0 aristas", [VIS.preview.tree([7], {es:"a",en:"a"}).nodes.length, VIS.preview.tree([7], {es:"a",en:"a"}).edges.length], [1, 0]);

/* ------------------------------------------------- la fábrica de editores */
const hint = { es: "instrucción", en: "hint" };
const ed = VIS.treeEditor("[1,2,3]", hint);
eq("la fábrica devuelve kind text", ed.kind, "text");
eq("un solo campo, llamado tree", ed.fields.map((f) => f.id), ["tree"]);
eq("initial() trae el árbol de partida", ed.initial(), { tree: "[1,2,3]" });
eq("el hint es el que se le pasó", ed.hint, hint);
eq("parse acepta el árbol de partida", ed.parse(ed.initial()).ok, true);
eq("parse devuelve el arreglo, no el texto", ed.parse(ed.initial()).input, [1, 2, 3]);
eq("parse rechaza el corchete sin cerrar", ed.parse({ tree: "[1,2" }).ok, false);
eq("y señala el campo tree", ed.parse({ tree: "[1,2" }).field, "tree");
eq("previewSpec devuelve un árbol", ed.previewSpec([1, 2, 3]).type, "tree");

/* El límite de nodos que aplica la fábrica. No es capricho: el SVG se escala al
   ancho del panel, así que un árbol grande CABE, pero su texto se encoge. A 15
   nodos son ~7.6px en un panel de 620px; a 20 ya son 5.7px, ilegibles.
   Las aserciones de arriba pasan un máximo explícito al parser, así que no
   fijaban este número: sin esto, cambiar la constante no rompería nada.        */
const arbolDe = (n) => "[" + Array.from({ length: n }, (_, i) => i + 1).join(",") + "]";
eq("la fábrica acepta 15 nodos", ed.parse({ tree: arbolDe(15) }).ok, true);
eq("la fábrica rechaza 16", ed.parse({ tree: arbolDe(16) }).ok, false);
ok("y el mensaje nombra el máximo real", /15/.test(ed.parse({ tree: arbolDe(16) }).error.es));

ok("dos editores no comparten estado",
   VIS.treeEditor("[9]", hint).initial().tree === "[9]" && ed.initial().tree === "[1,2,3]");

/* ------------------------------------------------- ayudantes de árbol */
const ARBOL = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4];

eq("valores(): ordenados y sin repetidos", VIS.arbol.valores(ARBOL), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
eq("valores() de un solo nodo", VIS.arbol.valores([7]), [7]);
eq("valores() con negativos", VIS.arbol.valores([-1, -5, 3]), [-5, -1, 3]);

// La distancia entre dos nodos puede subir y volver a bajar: el diámetro NO es
// la altura. En este árbol la altura es 4 y el diámetro 5 (por ejemplo, de 7 a 0).
eq("diametro() del árbol de ejemplo", VIS.arbol.diametro(ARBOL), 5);
eq("diametro() de un solo nodo", VIS.arbol.diametro([7]), 0);
eq("diametro() de una cadena de tres", VIS.arbol.diametro([1, 2, null, 3]), 2);

eq("opcionesDeNodos()", VIS.arbol.opcionesDeNodos("[1,2,3]"),
   [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }]);
eq("opcionesDeNodos() con árbol roto devuelve []", VIS.arbol.opcionesDeNodos("[1,2"), []);
eq("opcionesDeNodos() con texto vacío devuelve []", VIS.arbol.opcionesDeNodos(""), []);

// Cadena 1-2-3: diámetro 2, así que k puede ser 0, 1 o 2.
eq("opcionesDeK()", VIS.arbol.opcionesDeK("[1,2,null,3]"),
   [{ value: "0", label: "0" }, { value: "1", label: "1" }, { value: "2", label: "2" }]);
eq("opcionesDeK() de un solo nodo: solo el 0", VIS.arbol.opcionesDeK("[7]"), [{ value: "0", label: "0" }]);
eq("opcionesDeK() con árbol roto devuelve []", VIS.arbol.opcionesDeK("[1,2"), []);

/* --- El campo del árbol y el parse, compartidos: idénticos en los tres
       editores, así que viven una vez. El límite de nodos, también.        */
const campo = VIS.arbol.campo();
eq("campo(): id y tipo", [campo.id, campo.type], ["tree", "text"]);
ok("campo(): etiqueta bilingüe", typeof campo.label.es === "string" && typeof campo.label.en === "string");
ok("campo(): marcador de posición bilingüe", typeof campo.placeholder.es === "string");
ok("campo() devuelve un objeto nuevo cada vez", VIS.arbol.campo() !== campo);

// El comentario promete objetos nuevos en cada llamada: mutar el label o el
// placeholder de una llamada no debe filtrarse a otra.
const campoMutable = VIS.arbol.campo();
campoMutable.label.es = "MUTADO";
ok("mutar campo().label no afecta a otra llamada", VIS.arbol.campo().label.es !== "MUTADO");
campoMutable.placeholder.es = "MUTADO";
ok("mutar campo().placeholder no afecta a otra llamada", VIS.arbol.campo().placeholder.es !== "MUTADO");

ok("dos treeEditor no comparten el label del campo",
   VIS.treeEditor("[1]", hint).fields[0].label !== VIS.treeEditor("[2]", hint).fields[0].label);

const bien = VIS.arbol.parseCon({ tree: "[1,2,3]", p: "2", q: "3" }, ["p", "q"]);
eq("parseCon(): ok", bien.ok, true);
eq("parseCon(): devuelve el árbol parseado", bien.input.tree, [1, 2, 3]);
eq("parseCon(): convierte a número los campos nombrados", [bien.input.p, bien.input.q], [2, 3]);
ok("parseCon(): no arrastra campos que no se le piden", bien.input.otro === undefined);

const roto = VIS.arbol.parseCon({ tree: "[1,2", p: "1" }, ["p"]);
eq("parseCon(): con el árbol roto, ok:false", roto.ok, false);
eq("parseCon(): y señala el campo tree", roto.field, "tree");
ok("parseCon(): con mensaje bilingüe", typeof roto.error.es === "string" && typeof roto.error.en === "string");

// El límite vive en parseCon, no copiado en cada problema: 16 nodos lo exceden.
const dieciseis = "[" + Array.from({ length: 16 }, (_, i) => i + 1).join(",") + "]";
eq("parseCon(): aplica el límite de nodos del módulo", VIS.arbol.parseCon({ tree: dieciseis }, []).ok, false);
ok("parseCon(): y el mensaje nombra el máximo", /15/.test(VIS.arbol.parseCon({ tree: dieciseis }, []).error.es));

// Un campo nombrado que no está en state no debe colarse como NaN silencioso.
const faltante = VIS.arbol.parseCon({ tree: "[1,2,3]" }, ["p"]);
eq("parseCon(): campo numérico ausente, ok:false", faltante.ok, false);
eq("parseCon(): y señala el campo culpable", faltante.field, "p");
ok("parseCon(): el mensaje nombra el campo p",
   /p/.test(faltante.error.es) && /p/.test(faltante.error.en));

/* ------------------------------------- vista previa con nodos resaltados */
const sinResaltar = VIS.preview.tree([1, 2, 3], { es: "a", en: "a" });
ok("sin tercer argumento, ningún nodo va resaltado", sinResaltar.nodes.every((n) => n.cls === ""));

const conResaltado = VIS.preview.tree([1, 2, 3], { es: "a", en: "a" }, [2, 3]);
const claseDe = (spec, valor) => spec.nodes.find((n) => n.label === valor).cls;
eq("el nodo 2 va resaltado", claseDe(conResaltado, 2), "target");
eq("el nodo 3 va resaltado", claseDe(conResaltado, 3), "target");
eq("el nodo 1 no", claseDe(conResaltado, 1), "");
ok("VIS.renderers sabe pintarlo", typeof VIS.renderers[conResaltado.type] === "function");

// Un valor que no está en el árbol se ignora, no rompe: 1644 lo necesita (q=99).
const conFantasma = VIS.preview.tree([1, 2, 3], { es: "a", en: "a" }, [2, 99]);
eq("un resaltado inexistente no rompe", conFantasma.nodes.filter((n) => n.cls === "target").length, 1);

/* ------------------------------------------------- parsers de grafos */
console.log("\n── Parsers de Grafos ──");

// edgeList
const EL = VIS.parse.edgeList("[[0,1],[1,2]]", 3);
eq("edgeList(): parsea formato correcto", EL.ok, true);
eq("edgeList(): devuelve las aristas", EL.edges, [[0,1], [1,2]]);
eq("edgeList(): devuelve n basado en maxNodo + 1", EL.n, 3);
eq("edgeList(): rechaza si un nodo supera maxNodos", VIS.parse.edgeList("[[0,5]]", 5).ok, false);
eq("edgeList(): mensaje especifica el nodo infractor", /5/.test(VIS.parse.edgeList("[[0,5]]", 5).error.es), true);

// prereqList (igual a edgeList pero devuelve formato {n, prereqs})
const PL = VIS.parse.prereqList("[[1,0]]", 5);
eq("prereqList(): parsea y devuelve prereqs", PL.ok, true);
eq("prereqList(): la llave es prereqs", PL.prereqs, [[1,0]]);

// adjList (1-indexed por Leetcode en 133, pero lo mapeamos internamente a 0-indexed)
const AL = VIS.parse.adjList("[[2,4],[1,3],[2,4],[1,3]]", 10);
eq("adjList(): parsea formato correcto", AL.ok, true);
eq("adjList(): adj mapea a 0-indexed internamente", AL.adj, [[1,3], [0,2], [1,3], [0,2]]);

console.log("\n── Parsers adicionales (Fase 4b) ──");
// numberArray
const NA = VIS.parse.numberArray ? VIS.parse.numberArray("[3,9,20,15,7]", 10) : {ok:false};
eq("numberArray(): parsea formato correcto", NA.ok, true);
if (NA.ok) eq("numberArray(): devuelve los números", NA.arr, [3, 9, 20, 15, 7]);
const NAbad = VIS.parse.numberArray ? VIS.parse.numberArray("[1,a,3]", 10) : {ok:true};
eq("numberArray(): error de parseo", NAbad.ok, false);

// weightedEdgeList
const WE = VIS.parse.weightedEdgeList ? VIS.parse.weightedEdgeList("[[2,1,1],[2,3,1]]", 5) : {ok:false};
eq("weightedEdgeList(): parsea formato correcto", WE.ok, true);
if (WE.ok) eq("weightedEdgeList(): devuelve aristas", WE.edges, [[2,1,1],[2,3,1]]);
const WEbad = VIS.parse.weightedEdgeList ? VIS.parse.weightedEdgeList("[[2,1]]", 5) : {ok:true};
eq("weightedEdgeList(): error si no tiene 3 elementos", WEbad.ok, false);

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
