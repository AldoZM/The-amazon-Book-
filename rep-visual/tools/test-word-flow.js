/* ============================================================================
   test-word-flow.js — El camino del motor en modo palabra (editor.kind "word",
   usado por 79 Word Search): entrar a editar, escribir, ejecutar.

   El DOM falso aquí CACHEA los nodos por selector, a diferencia del de
   test-interactive-flow.js. Hace falta: el motor guarda `oninput` sobre el nodo
   que obtuvo de `qs("#editor-word")`, y para simular que el usuario escribe hay
   que recuperar ese mismo nodo.

   Uso: node tools/test-word-flow.js   (desde rep-visual/)
   ========================================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function mkNode() {
  const n = {
    _cls: "", _txt: "", _html: "", children: [], listeners: {},
    style: {}, dataset: {}, value: "", disabled: false, placeholder: "",
    offsetTop: 0, clientHeight: 0,
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

// Un nodo por selector, estable entre llamadas: así el motor y el test hablan
// del mismo elemento.
const nodes = new Map();
const bySel = (sel) => { if (!nodes.has(sel)) nodes.set(sel, mkNode()); return nodes.get(sel); };

const sandbox = {
  console,
  document: {
    createElement: mkNode, createTextNode: (t) => ({ _txt: t }),
    createElementNS: mkNode,
    querySelector: bySel, querySelectorAll: () => [],
    documentElement: { setAttribute() {} }, getElementById: bySel,
    addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: "" },
  URLSearchParams: class { get() { return null; } },
  setInterval: () => 0, clearInterval() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["js/i18n.js", "js/renderers.js", "js/engine.js", "js/problems/79.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
const problem = sandbox.window.PROBLEMS["79"];
const Engine = VIS.Engine;

let fails = 0;
const ok = (name, cond) => { if (cond) console.log(`✓ ${name}`); else { fails++; console.log(`✗ ${name}`); } };
const strip = (s) => s.replace(/<[^>]+>/g, "");
const lastNote = () => strip(VIS.pick(Engine.steps[Engine.steps.length - 1].note));

VIS.lang = "es";
Engine.problem = problem;
Engine.steps = [];
Engine.i = 0;
Engine.codePre = mkNode();

const campo = bySel("#editor-word");
const stage = bySel("#stage");

/* ------------------------------------------------------------ entrar a editar */
Engine.enterEditMode();
ok("mode = edit", Engine.mode === "edit");
ok("editState arranca con la palabra por defecto", Engine.editState === "ABCCED");
ok("el campo de texto se muestra", campo.style.display === "");
ok("el campo lleva la palabra actual", campo.value === "ABCCED");
ok("el campo lleva su placeholder en español", campo.placeholder === "Ej. ABCCED");
ok("el motor enganchó oninput", typeof campo.oninput === "function");
ok("el escenario pinta el tablero fijo", stage.children.length === 1);

/* ------------------------------------------- el usuario escribe (se sanea) */
campo.value = "see!";
campo.oninput();
ok("escribir 'see!' deja editState en SEE", Engine.editState === "SEE");
ok("y el campo muestra lo mismo que recibirá build()", campo.value === "SEE");

/* ------------------------------------------------------------------ ejecutar */
Engine.runCustom();
ok("mode = play tras ejecutar", Engine.mode === "play");
ok("se generaron pasos", Engine.steps.length > 0);
ok("SEE existe en el tablero", /verdadero/.test(lastNote()));

/* ------------------------------------- una palabra que no está en el tablero */
Engine.enterEditMode();
campo.value = "ZZZ";
campo.oninput();
Engine.runCustom();
ok("ZZZ no existe", /falso/.test(lastNote()));

/* ----------------------------- palabra vacía: Ejecutar no debe hacer nada */
Engine.enterEditMode();
campo.value = "";
campo.oninput();
ok("borrar deja editState vacío", Engine.editState === "");
const pasosAntes = Engine.steps;
Engine.runCustom();
ok("con palabra vacía, Ejecutar no reproduce nada", Engine.mode === "edit");
ok("y no toca los pasos", Engine.steps === pasosAntes);

/* --- re-entrar con la palabra vacía NO debe resucitar la palabra por defecto.
       Es justo lo que rompería `if (!this.editState)`: "" es falsy.          */
Engine.enterEditMode();
ok("re-entrar con palabra vacía la conserva vacía", Engine.editState === "");
ok("y el campo sigue vacío", campo.value === "");

/* ------------------------------------------- el usuario vuelve a escribir */
campo.value = "abf";
campo.oninput();
Engine.runCustom();
ok("ABF existe en el tablero", /verdadero/.test(lastNote()));

/* ----------------------- cambiar de idioma en edición conserva lo escrito */
Engine.enterEditMode();
campo.value = "SEE";
campo.oninput();
VIS.lang = "en";
Engine.enterEditMode();          // lo que hace relang() en modo edición
ok("al cambiar de idioma se conserva la palabra", Engine.editState === "SEE");
ok("y el placeholder pasa al inglés", campo.placeholder === "e.g. ABCCED");
VIS.lang = "es";

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
