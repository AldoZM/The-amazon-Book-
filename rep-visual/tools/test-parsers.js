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
ok("dos editores no comparten estado",
   VIS.treeEditor("[9]", hint).initial().tree === "[9]" && ed.initial().tree === "[1,2,3]");

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
