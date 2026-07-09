/* Prueba del camino de datos del modo interactivo: enterEditMode -> runCustom.
   No comprueba píxeles: comprueba que el estado editado alimenta a build().
   Uso: node tools/test-interactive-flow.js   (desde rep-visual/) */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

// DOM permisivo: el motor toca muchos nodos; aquí solo nos importa su estado.
function mkNode() {
  const n = {
    _cls: "", _txt: "", _html: "", children: [], listeners: {},
    style: {}, dataset: {}, value: "0", disabled: false, offsetTop: 0, clientHeight: 0,
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    scrollTo() {}, querySelector() { return null; }, querySelectorAll() { return []; },
  };
  Object.defineProperty(n, "className", { get() { return n._cls; }, set(v) { n._cls = v; } });
  Object.defineProperty(n, "textContent", { get() { return n._txt; }, set(v) { n._txt = v; } });
  Object.defineProperty(n, "innerHTML", { get() { return n._html; }, set(v) { n._html = v; n.children.length = 0; } });
  return n;
}
const sandbox = {
  console,
  document: {
    createElement: mkNode, createTextNode: (t) => ({ _txt: t }),
    querySelector: () => mkNode(), querySelectorAll: () => [],
    documentElement: { setAttribute() {} }, getElementById: () => mkNode(),
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: "" },
  URLSearchParams: class { get() { return null; } },
  setInterval: () => 0, clearInterval() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["js/i18n.js", "js/renderers.js", "js/engine.js", "js/problems/1091.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
const problem = sandbox.window.PROBLEMS["1091"];
const Engine = VIS.Engine;

let fails = 0;
const ok = (name, cond) => { if (cond) console.log(`✓ ${name}`); else { fails++; console.log(`✗ ${name}`); } };
const strip = (s) => s.replace(/<[^>]+>/g, "");
const lastNote = () => strip(VIS.pick(Engine.steps[Engine.steps.length - 1].note));

// Arranque mínimo: sin init() (que pide todo el DOM real).
VIS.lang = "es";
Engine.problem = problem;
Engine.steps = [];
Engine.i = 0;
Engine.codePre = mkNode();

// --- entrar en edición ---
Engine.enterEditMode();
ok("mode = edit", Engine.mode === "edit");
ok("editState arranca como editor.initial()",
   JSON.stringify(Engine.editState) === JSON.stringify(problem.editor.initial()));

// --- ejecutar la cuadrícula vacía: diagonal libre, 5 celdas ---
Engine.runCustom();
ok("mode = play tras ejecutar", Engine.mode === "play");
ok("se generaron pasos", Engine.steps.length > 0);
ok("cuadrícula libre -> distancia 5", /distancia 5/.test(lastNote()));

// --- amurallar para que no haya camino, y re-ejecutar ---
Engine.enterEditMode();
// Encierra la meta (4,4): muros en sus tres vecinas.
Engine.editState[3][3] = 1;
Engine.editState[3][4] = 1;
Engine.editState[4][3] = 1;
Engine.runCustom();
ok("meta encerrada -> respuesta -1", /-1/.test(lastNote()));

// --- persistencia REAL: al volver a editar, los muros dibujados siguen ahí ---
// (una regresión que hiciera editState = ed.initial() en cada enterEditMode()
//  reseteando el dibujo del usuario tiene que hacer fallar esta aserción)
Engine.enterEditMode();
ok("los muros dibujados persisten al re-entrar en edición",
   Engine.editState[3][3] === 1 && Engine.editState[3][4] === 1 && Engine.editState[4][3] === 1);

// --- el motor respeta que inicio y meta no se amurallan ---
problem.editor.cycle(Engine.editState, 0, 0);
ok("el inicio sigue libre tras alternarlo", Engine.editState[0][0] === 0);

// --- Hallazgo 1 (regresión): en modo edición las acciones de reproducción
//     no hacen nada, aunque haya pasos cargados (teclado/swipe también entran aquí).
Engine.mode = "edit";
Engine.steps = [{ note: "a", line: 0 }, { note: "b", line: 0 }, { note: "c", line: 0 }];
Engine.i = 1;
Engine.timer = null;
let rendered = false;
const origRender = Engine.render;
Engine.render = () => { rendered = true; };
Engine.next();
ok("next() no avanza en modo edición", Engine.i === 1);
Engine.prev();
ok("prev() no retrocede en modo edición", Engine.i === 1);
ok("ni next() ni prev() renderizan en modo edición", rendered === false);
Engine.toggle();
ok("toggle() no arranca el temporizador en modo edición", Engine.timer === null);
Engine.reset();
ok("reset() no cambia i en modo edición", Engine.i === 1);
ok("reset() no renderiza en modo edición", rendered === false);
Engine.render = origRender;

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
