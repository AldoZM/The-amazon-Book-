/* Prueba de VIS.renderers.gridEditor: estructura, clases y clic.
   Uso: node tools/test-grid-editor.js   (desde rep-visual/) */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

// DOM falso capaz de guardar el árbol y los listeners, para simular un clic.
function mkNode() {
  const n = {
    _cls: "", _txt: "", children: [], listeners: {},
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    setAttribute() {}, querySelector() { return null; }, querySelectorAll() { return []; },
  };
  Object.defineProperty(n, "className", { get() { return n._cls; }, set(v) { n._cls = v; } });
  Object.defineProperty(n, "textContent", { get() { return n._txt; }, set(v) { n._txt = v; } });
  return n;
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
const ok = (name, cond) => { if (cond) console.log(`✓ ${name}`); else { fails++; console.log(`✗ ${name}`); } };
// Texto de una celda: el nodo de texto que se le colgó.
const cellText = (cell) => cell.children.map((c) => c._txt || "").join("");

const state = ed.initial();
let clicked = null;
const grid = VIS.renderers.gridEditor(state, ed, (r, c) => { clicked = [r, c]; });

ok("devuelve un div .grid", grid.className === "grid");
ok("columnas fluidas con var(--cell)", grid.style.gridTemplateColumns === "repeat(5, var(--cell))");
ok("25 celdas", grid.children.length === 25);

const at = (r, c) => grid.children[r * 5 + c];
ok("inicio marcado con A", cellText(at(0, 0)) === "A");
ok("meta marcada con B", cellText(at(4, 4)) === "B");
ok("inicio usa la clase current", at(0, 0).className.includes("current"));
ok("meta usa la clase target", at(4, 4).className.includes("target"));
ok("celda libre usa la clase water", at(2, 2).className.includes("water"));
ok("toda celda es editable", grid.children.every((d) => d.className.includes("editable")));

// El clic reporta la celda; el pintor NO muta el estado (eso es del motor).
at(2, 2).listeners.click[0]();
ok("el clic reporta (2,2)", JSON.stringify(clicked) === "[2,2]");
ok("el pintor no muta el estado", state[2][2] === 0);

// Con un muro en el estado, esa celda se pinta como muro.
state[3][1] = 1;
const grid2 = VIS.renderers.gridEditor(state, ed, () => {});
ok("un muro se pinta con la clase wall", grid2.children[3 * 5 + 1].className.includes("wall"));

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
