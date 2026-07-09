/* ============================================================================
   test-word-flow.js — El motor en modo texto (editor.kind "text"): entrar a
   editar, escribir, ver la vista previa, equivocarse, corregir y ejecutar.

   El DOM falso CACHEA los nodos por selector: el motor engancha `oninput` sobre
   el nodo que obtuvo de qs(), y para simular que el usuario escribe hay que
   recuperar ese mismo nodo.
   ========================================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

function mkNode() {
  const n = {
    _cls: "", _txt: "", _html: "", children: [], listeners: {}, classes: new Set(),
    style: {}, dataset: {}, value: "", disabled: false, placeholder: "", type: "",
    offsetTop: 0, clientHeight: 0, spellcheck: false, autocomplete: "",
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    removeChild() {}, setAttribute() {}, getAttribute() { return null; },
    scrollTo() {}, querySelector() { return null; }, querySelectorAll() { return []; },
  };
  n.classList = { add: (c) => n.classes.add(c), remove: (c) => n.classes.delete(c), toggle() {} };
  Object.defineProperty(n, "className", { get() { return n._cls; }, set(v) { n._cls = v; } });
  Object.defineProperty(n, "textContent", { get() { return n._txt; }, set(v) { n._txt = v; } });
  Object.defineProperty(n, "innerHTML", { get() { return n._html; }, set(v) { n._html = v; n.children.length = 0; } });
  // Al ponerle un id, el nodo queda localizable por querySelector, como en un
  // DOM de verdad. Sin esto, el motor crearía el campo con VIS.el("input") y el
  // test miraría otro objeto distinto: pasaría o fallaría por la razón errónea.
  Object.defineProperty(n, "id", { get() { return n._id; }, set(v) { n._id = v; nodes.set("#" + v, n); } });
  return n;
}
const nodes = new Map();
const bySel = (sel) => { if (!nodes.has(sel)) nodes.set(sel, mkNode()); return nodes.get(sel); };

const sandbox = {
  console,
  document: {
    createElement: mkNode, createTextNode: (t) => ({ _txt: t }), createElementNS: mkNode,
    querySelector: bySel, querySelectorAll: () => [],
    documentElement: { setAttribute() {} }, getElementById: bySel, addEventListener() {},
  },
  localStorage: { getItem: () => null, setItem() {} },
  location: { search: "" },
  URLSearchParams: class { get() { return null; } },
  setInterval: () => 0, clearInterval() {},
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ["js/i18n.js", "js/renderers.js", "js/editors.js", "js/engine.js", "js/problems/79.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
const problem = sandbox.window.PROBLEMS["79"];
const Engine = VIS.Engine;

let fails = 0;
const ok = (n, c) => { if (c) console.log(`✓ ${n}`); else { fails++; console.log(`✗ ${n}`); } };
const strip = (s) => s.replace(/<[^>]+>/g, "");
const lastNote = () => strip(VIS.pick(Engine.steps[Engine.steps.length - 1].note));

VIS.lang = "es";
Engine.problem = problem;
Engine.steps = [];
Engine.i = 0;
Engine.codePre = mkNode();

const run = bySel("#btn-run");
const hint = bySel("#editor-hint");
const stage = bySel("#stage");
// El motor RECREA los campos en cada `enterEditMode()`. Guardar una referencia
// dejaría el test mirando un nodo huérfano en la segunda entrada: hay que
// pedirlo cada vez.
const campo = () => bySel("#editor-field-word");
const teclear = (txt) => { const c = campo(); c.value = txt; c.oninput(); };

/* ------------------------------------------------------------ entrar a editar */
Engine.enterEditMode();
ok("mode = edit", Engine.mode === "edit");
ok("editState es un objeto de campos", Engine.editState.word === "ABCCED");
ok("el campo lleva la palabra actual", campo().value === "ABCCED");
ok("el campo lleva su placeholder en español", campo().placeholder === "Ej. ABCCED");
ok("el motor enganchó oninput", typeof campo().oninput === "function");
ok("el escenario pinta el tablero", stage.children.length === 1);
ok("Ejecutar habilitado con entrada válida", run.disabled === false);

/* ------------------------------------------- el usuario escribe (se sanea) */
teclear("see!");
ok("escribir 'see!' deja el campo en SEE", Engine.editState.word === "SEE");
ok("y el campo muestra lo mismo que recibirá build()", campo().value === "SEE");
ok("Ejecutar sigue habilitado", run.disabled === false);

/* ---------------------------------------------- entrada inválida: se avisa */
teclear("");
ok("con el campo vacío, Ejecutar se deshabilita", run.disabled === true);
ok("el campo se marca como inválido", campo().classes.has("invalid"));
ok("la instrucción se pone en rojo", hint.classes.has("error"));
ok("y dice qué está mal", /palabra/i.test(hint.textContent));

/* ------------------------------------------------ corregir vuelve a la normalidad */
teclear("SEE");
ok("al corregir, Ejecutar se habilita", run.disabled === false);
ok("el campo deja de estar marcado", campo().classes.has("invalid") === false);
ok("la instrucción vuelve a su color", hint.classes.has("error") === false);

/* ------------------------------------------------------------------ ejecutar */
Engine.runCustom();
ok("mode = play tras ejecutar", Engine.mode === "play");
ok("SEE existe en el tablero", /verdadero/.test(lastNote()));

/* ----------------------------- con entrada inválida, Ejecutar no hace nada */
Engine.enterEditMode();
teclear("");
const pasosAntes = Engine.steps;
Engine.runCustom();
ok("Ejecutar no reproduce nada", Engine.mode === "edit");
ok("y no toca los pasos", Engine.steps === pasosAntes);

/* --- re-entrar con el campo vacío NO resucita la palabra por defecto. --- */
Engine.enterEditMode();
ok("re-entrar conserva el campo vacío", Engine.editState.word === "");

/* --- entrar a editar con una entrada inválida deja el error a la vista.
       Fija el orden: paintEditor() va DESPUÉS de escribir la instrucción. --- */
ok("al entrar con entrada inválida, el error se ve", hint.classes.has("error"));
ok("y Ejecutar sigue deshabilitado", run.disabled === true);

/* ----------------------- cambiar de idioma en edición conserva lo escrito */
teclear("SEE");
VIS.lang = "en";
Engine.enterEditMode();
ok("al cambiar de idioma se conserva la palabra", Engine.editState.word === "SEE");
ok("y el placeholder pasa al inglés", campo().placeholder === "e.g. ABCCED");
VIS.lang = "es";

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
