/* Prueba del descriptor `editor` de 1091 y de las cadenas de interfaz nuevas.
   Uso: node tools/test-editor-1091.js   (desde rep-visual/) */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

// DOM mínimo: i18n.js y renderers.js lo tocan al cargarse.
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
for (const f of ["js/i18n.js", "js/renderers.js", "js/problems/1091.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
const ed = sandbox.window.PROBLEMS["1091"].editor;

let fails = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fails++; console.log(`✗ ${name}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${name}`);
};

// --- cadenas de interfaz, en los dos idiomas ---
VIS.lang = "es";
eq("t(custom) es", VIS.t("custom"), "✏️ Personalizado");
eq("t(run) es", VIS.t("run"), "▶ Ejecutar");
eq("t(edit) es", VIS.t("edit"), "✏️ Editar");
VIS.lang = "en";
eq("t(custom) en", VIS.t("custom"), "✏️ Custom");
eq("t(run) en", VIS.t("run"), "▶ Run");
eq("t(edit) en", VIS.t("edit"), "✏️ Edit");
VIS.lang = "es";

// --- forma del descriptor ---
eq("rows", ed.rows, 5);
eq("cols", ed.cols, 5);
eq("initial() es 5x5 de ceros", ed.initial(), Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]));

// --- cycle: recibe la cuadrícula, alterna una celda, ignora inicio y meta ---
const g1 = ed.initial();
eq("cycle libre -> muro", ed.cycle(g1, 2, 2)[2][2], 1);
eq("cycle muro -> libre", ed.cycle(g1, 2, 2)[2][2], 0);
eq("cycle no toca el inicio (0,0)", ed.cycle(ed.initial(), 0, 0)[0][0], 0);
eq("cycle no toca la meta (4,4)", ed.cycle(ed.initial(), 4, 4)[4][4], 0);
eq("cycle devuelve la misma cuadrícula", ed.cycle(g1, 1, 1), g1);

// --- cellView: el muro gana sobre cualquier otra cosa ---
eq("cellView muro", ed.cellView(1, 2, 2), { v: "", cls: "wall" });
eq("cellView inicio", ed.cellView(0, 0, 0), { v: "A", cls: "current" });
eq("cellView meta", ed.cellView(0, 4, 4), { v: "B", cls: "target" });
eq("cellView libre", ed.cellView(0, 2, 2), { v: "", cls: "water" });

// --- toInput: build() de 1091 recibe la cuadrícula tal cual ---
const g = [[0, 1], [1, 0]];
eq("toInput devuelve la cuadrícula", ed.toInput(g), g);

// --- hint bilingüe ---
eq("hint tiene es y en", [typeof ed.hint.es, typeof ed.hint.en], ["string", "string"]);

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
