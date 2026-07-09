/* ============================================================================
   test-multi-field.js — El motor con VARIOS campos, y con desplegables cuyas
   opciones dependen de lo escrito en otro campo.

   Usa un problema sintético, no uno real: así prueba el motor aislado, sin
   depender de ningún editor concreto.

   El DOM falso cachea los nodos por id: el motor crea los campos con VIS.el()
   y les asigna un id, y el test necesita recuperar ESOS mismos nodos.

   Uso: node tools/test-multi-field.js   (desde rep-visual/)
   ========================================================================= */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const nodes = new Map();

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
  Object.defineProperty(n, "id", { get() { return n._id; }, set(v) { n._id = v; nodes.set("#" + v, n); } });
  return n;
}
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
for (const f of ["js/i18n.js", "js/renderers.js", "js/editors.js", "js/engine.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });

const VIS = sandbox.VIS;
const Engine = VIS.Engine;

let fails = 0;
const ok = (n, c) => { if (c) console.log(`✓ ${n}`); else { fails++; console.log(`✗ ${n}`); } };
const eq = (n, got, want) => {
  const good = JSON.stringify(got) === JSON.stringify(want);
  if (!good) { fails++; console.log(`✗ ${n}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
  else console.log(`✓ ${n}`);
};

/* Problema sintético: un campo de texto (números separados por comas) y un
   desplegable cuyas opciones son esos números. Nada que ver con árboles: lo que
   se prueba es el motor.                                                      */
const numeros = (texto) => String(texto).split(",").map((t) => t.trim()).filter((t) => /^\d+$/.test(t));

const problema = {
  num: 0, title: "sintético", difficulty: "M", block: "grafos", tags: [],
  code: { es: ["a"], en: ["a"] }, summary: { es: "s", en: "s" }, cases: [],
  editor: {
    kind: "text",
    fields: [
      { id: "lista", type: "text", label: { es: "Lista", en: "List" },
        placeholder: { es: "1,2,3", en: "1,2,3" } },
      { id: "elegido", type: "select", label: { es: "Elegido", en: "Chosen" },
        options(state) { return numeros(state.lista).map((v) => ({ value: v, label: "n" + v })); } },
    ],
    initial() { return { lista: "1,2,3", elegido: "2" }; },
    parse(state) {
      const ns = numeros(state.lista);
      if (!ns.length) return { ok: false, field: "lista", error: { es: "vacía", en: "empty" } };
      // Estricto a propósito: si `elegido` ya no está entre los números de la
      // lista, es un valor huérfano y hay que rechazarlo, no convertirlo a
      // ciegas. Esto es lo que hace que el test note si syncSelects() corrió
      // antes o después de parse().
      if (!ns.includes(String(state.elegido))) {
        return {
          ok: false, field: "elegido",
          error: {
            es: `"${state.elegido}" ya no está en la lista.`,
            en: `"${state.elegido}" is no longer in the list.`,
          },
        };
      }
      return { ok: true, input: { lista: ns.map(Number), elegido: Number(state.elegido) } };
    },
    previewSpec(input) { return VIS.preview.tree([input.elegido], { es: "a", en: "a" }); },
    hint: { es: "instrucción", en: "hint" },
  },
  build(input) {
    return [{ line: 0, note: { es: "elegido " + input.elegido, en: "chosen " + input.elegido } }];
  },
};

VIS.lang = "es";
Engine.problem = problema;
Engine.steps = [];
Engine.i = 0;
Engine.codePre = mkNode();

// Los campos los crea el motor: hay que pedirlos DESPUÉS de entrar a editar, y
// cada vez, porque `enterEditMode()` los recrea.
const texto = () => bySel("#editor-field-lista");
const sel = () => bySel("#editor-field-elegido");
const run = bySel("#btn-run");
const opciones = () => sel().children.map((o) => o.value);

/* ------------------------------------------------------ entrar a editar */
Engine.enterEditMode();
eq("editState arranca con los dos campos", Engine.editState, { lista: "1,2,3", elegido: "2" });
eq("el desplegable se pobló con la lista", opciones(), ["1", "2", "3"]);
eq("las etiquetas salen de options()", sel().children.map((o) => o.textContent), ["n1", "n2", "n3"]);
eq("el desplegable muestra el valor elegido", sel().value, "2");
ok("el motor enganchó onchange", typeof sel().onchange === "function");
ok("Ejecutar habilitado", run.disabled === false);

/* El nodo de texto es EL MISMO objeto tras refrescar: si se recreara, el
   usuario perdería el cursor a cada tecla y escribir sería imposible.        */
const antes = texto();
Engine.refreshPreview();
ok("el <input> de texto no se recrea al refrescar", texto() === antes);

/* ------------------------------------------- cambiar la selección a mano */
sel().value = "3";
sel().onchange();
eq("elegir en el desplegable actualiza editState", Engine.editState.elegido, "3");

/* ------- reconciliación: el valor elegido desaparece al editar la lista */
texto().value = "1,2";
texto().oninput();
eq("las opciones se recalculan", opciones(), ["1", "2"]);
eq("el valor huérfano cae al primero", Engine.editState.elegido, "1");
eq("y el desplegable lo refleja", sel().value, "1");
/* Esto fija el orden syncSelects() -> parse() dentro de refreshPreview():
   como la reconciliación ya corrigió editState antes de llamar a parse(),
   éste ve un valor que SÍ está en la lista y no hay error. Si el orden se
   invirtiera, parse() vería el "3" huérfano, el parse estricto de arriba
   devolvería ok:false con field:"elegido", Ejecutar quedaría deshabilitado
   y el desplegable se marcaría inválido: las tres aserciones siguientes
   fallarían.                                                              */
ok("Ejecutar sigue habilitado", run.disabled === false);
ok("el desplegable no se marca inválido", !sel().classes.has("invalid"));

/* Un valor que sigue existiendo NO se toca. */
sel().value = "2";
sel().onchange();
texto().value = "2,5,9";
texto().oninput();
eq("un valor que sigue estando se conserva", Engine.editState.elegido, "2");
eq("aunque las opciones cambien", opciones(), ["2", "5", "9"]);

/* ------------------------ entrada inválida: los select conservan su valor */
texto().value = "";
texto().oninput();
ok("con la lista vacía, Ejecutar se deshabilita", run.disabled === true);
eq("el desplegable conserva su valor", Engine.editState.elegido, "2");
ok("el campo de texto se marca inválido", texto().classes.has("invalid"));

/* -------------------------------------------------- corregir y ejecutar */
texto().value = "2,5";
texto().oninput();
ok("al corregir, Ejecutar se habilita", run.disabled === false);
Engine.runCustom();
eq("mode = play tras ejecutar", Engine.mode, "play");
ok("build recibió el número, no el texto",
   /elegido 2$/.test(VIS.pick(Engine.steps[Engine.steps.length - 1].note)));

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
