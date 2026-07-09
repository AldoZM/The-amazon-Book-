# Modo interactivo en 236, 1644 y 863 — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que en 236, 1644 y 863 el usuario escriba el árbol y elija sus parámetros (`p`, `q`, `target`, `k`) de un desplegable poblado con los nodos que acaba de escribir.

**Architecture:** El motor gana un tipo de campo, `select`, cuyas opciones se calculan con `options(state)` a partir del estado completo — es decir, dependen de lo tecleado en **otro** campo. En cada pulsación el motor reconcilia: si el nodo elegido ya no está en el árbol, cae a la raíz. Los ayudantes de árbol (valores, diámetro, opciones) viven en `js/editors.js` como funciones puras. Ningún `build()` se toca.

**Tech Stack:** JavaScript vanilla (sin build, sin dependencias), `window.VIS`. Pruebas: scripts Node que cargan los módulos con `vm` sobre un DOM falso.

## Global Constraints

- Sin dependencias nuevas. Sin paso de build. Los `.js` se cargan con `<script>` directo.
- Todo texto visible va en `{es, en}` o en el diccionario `UI` de `js/i18n.js`. Nada de cadenas de interfaz sueltas en el motor.
- No modificar ningún `build()`, ni `code`, ni `cases` de ningún problema.
- `node tools/validate-code.js` debe dar `32 correctos · 0 con errores` al terminar cada tarea.
- Los seis tests existentes deben seguir pasando: `test-parsers.js`, `test-editors.js`, `test-word-flow.js`, `test-editor-1091.js`, `test-grid-editor.js`, `test-interactive-flow.js`.
- `refreshPreview()` sigue siendo el **único** sitio que habilita o deshabilita `#btn-run`.
- Con entrada inválida **no se borra el escenario**: se conserva el último dibujo válido.
- **Los `<input type="text">` no se recrean en cada pulsación**: solo se repintan los `<select>`. Recrear el texto mataría el foco del cursor.
- `this.editState == null`, nunca `!this.editState`.
- `editState[id]` es siempre **texto**. `parse` convierte a número.
- Commits en español, **sin** `Co-Authored-By` ni firma de IA.

## Desviación deliberada del spec

El spec pedía una función nueva, `VIS.preview.treeConNodos(arr, resaltados, label)`.
En su lugar se **extiende** `VIS.preview.tree(arr, label, resaltados)` con un tercer
argumento opcional. Motivo: una función aparte duplicaría el cálculo del layout, y
los ocho editores de árbol existentes seguirían llamando a la vieja. Con el
argumento opcional, quien no lo pasa obtiene exactamente el comportamiento de hoy.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `js/editors.js` | Ayudantes puros de árbol (`VIS.arbol.*`) y vista previa con resaltado. Sin DOM. |
| `js/engine.js` | El tipo de campo `select`, la reconciliación, el repintado de opciones. |
| `js/problems/{236,1644,863}.js` | Cada `editor` declara sus campos y su `parse`. |
| `css/styles.css` | Aspecto del `<select>`, igual que el del `<input>`. |

---

### Task 1: Ayudantes de árbol y vista previa con resaltado

Funciones puras. Ningún DOM, ningún estado.

**Files:**
- Modify: `rep-visual/js/editors.js`
- Modify: `rep-visual/tools/test-parsers.js`

**Interfaces:**
- Consumes: `VIS.treeFromArray(arr)`, `VIS.binaryLayout(root)` de `js/renderers.js`; `VIS.parse.treeArray(text, maxNodes)`.
- Produces:
  - `VIS.arbol.valores(arr: (number|null)[]): number[]` — valores de los nodos, ordenados de menor a mayor, sin repetidos.
  - `VIS.arbol.diametro(arr: (number|null)[]): number` — la distancia máxima (en aristas) entre dos nodos cualesquiera. `0` para un árbol de un nodo.
  - `VIS.arbol.opcionesDeNodos(texto: string): {value: string, label: string}[]` — `[]` si el texto no es un árbol válido.
  - `VIS.arbol.opcionesDeK(texto: string): {value: string, label: string}[]` — de `0` al diámetro. `[]` si el árbol es inválido.
  - `VIS.preview.tree(arr, label, resaltados?: number[])` — tercer argumento opcional: los nodos cuyo valor esté en `resaltados` llevan `cls: "target"`.

- [ ] **Step 1: Escribir el test que falla**

Añadir a `rep-visual/tools/test-parsers.js`, **antes** de las dos líneas finales (`console.log(fails ? ...)` y `process.exit(...)`):

```js
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
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-parsers.js
```

Esperado: FALLA con `TypeError: Cannot read properties of undefined (reading 'valores')` — `VIS.arbol` no existe.

- [ ] **Step 3: Mover `MAX_NODOS` por encima de donde se usará**

`const` no se iza. `VIS.arbol.opcionesDeNodos` lo usará, así que su declaración tiene que aparecer **antes** en el archivo.

En `rep-visual/js/editors.js`, localizar este bloque (está debajo de `VIS.preview.tree`):

```js
  const ETIQUETA_ARBOL = { es: "Árbol", en: "Tree" };
  // Un árbol grande sí cabe: el SVG lleva viewBox y se escala al ancho del
  // panel. Lo que se pierde es la letra. Medido en un panel de 620px: 11 nodos
  // → 10.3px, 15 → 7.6px, 20 → 5.7px, 31 → 3.7px. El caso predefinido más
  // grande del visualizador (236) tiene 11 nodos.
  const MAX_NODOS = 15;
```

y **cortarlo entero**, para pegarlo en el Step 4 justo encima de los ayudantes.

- [ ] **Step 4: Implementar los ayudantes**

En `rep-visual/js/editors.js`, sustituir el bloque completo de `VIS.preview.tree`:

```js
  /* Vista previa de un árbol, con los mismos ayudantes que usa build(). */
  VIS.preview.tree = function (arr, label) {
    const root = VIS.treeFromArray(arr);
    const layout = VIS.binaryLayout(root);
    return {
      type: "tree", label, r: 18,
      nodes: layout.nodes.map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y, cls: "" })),
      edges: layout.edges,
    };
  };
```

por esto (incluye el bloque que cortaste en el Step 3, ya en su sitio):

```js
  /* Vista previa de un árbol, con los mismos ayudantes que usa build().
     `resaltados` es opcional: los nodos cuyo valor esté en la lista se pintan
     con la clase `target`, la misma que usa build() para marcar lo buscado.
     Un valor que no está en el árbol simplemente no marca nada: 1644 lo
     necesita, porque su caso didáctico es un nodo que no existe.             */
  VIS.preview.tree = function (arr, label, resaltados) {
    const marca = new Set(resaltados || []);
    const root = VIS.treeFromArray(arr);
    const layout = VIS.binaryLayout(root);
    return {
      type: "tree", label, r: 18,
      nodes: layout.nodes.map((n) => ({
        id: n.id, label: n.label, x: n.x, y: n.y,
        cls: marca.has(n.label) ? "target" : "",
      })),
      edges: layout.edges,
    };
  };

  const ETIQUETA_ARBOL = { es: "Árbol", en: "Tree" };
  // Un árbol grande sí cabe: el SVG lleva viewBox y se escala al ancho del
  // panel. Lo que se pierde es la letra. Medido en un panel de 620px: 11 nodos
  // → 10.3px, 15 → 7.6px, 20 → 5.7px, 31 → 3.7px. El caso predefinido más
  // grande del visualizador (236) tiene 11 nodos.
  const MAX_NODOS = 15;

  /* ------------------------------------------------------ ayudantes de árbol
     Funciones puras sobre el arreglo de LeetCode. Los editores las usan para
     poblar sus desplegables.                                                 */
  VIS.arbol = VIS.arbol || {};

  VIS.arbol.valores = function (arr) {
    const root = VIS.treeFromArray(arr);
    const vals = [];
    (function recorrer(n) {
      if (!n) return;
      vals.push(n.val);
      recorrer(n.left);
      recorrer(n.right);
    })(root);
    return [...new Set(vals)].sort((a, b) => a - b);
  };

  /* La distancia entre dos nodos puede subir y volver a bajar, así que el
     diámetro NO es la altura: en [3,5,1,6,2,0,8,null,null,7,4] la altura es 4
     y el diámetro 5. Se recorre el árbol como un grafo no dirigido.          */
  VIS.arbol.diametro = function (arr) {
    const root = VIS.treeFromArray(arr);
    if (!root) return 0;
    const vecinos = new Map();
    const unir = (a, b) => {
      if (!vecinos.has(a)) vecinos.set(a, []);
      vecinos.get(a).push(b);
    };
    (function recorrer(n, padre) {
      if (!n) return;
      if (!vecinos.has(n.id)) vecinos.set(n.id, []);
      if (padre != null) { unir(n.id, padre); unir(padre, n.id); }
      recorrer(n.left, n.id);
      recorrer(n.right, n.id);
    })(root, null);

    let diam = 0;
    for (const inicio of vecinos.keys()) {
      const dist = new Map([[inicio, 0]]);
      const cola = [inicio];
      while (cola.length) {
        const u = cola.shift();
        for (const v of vecinos.get(u)) {
          if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); cola.push(v); }
        }
      }
      for (const d of dist.values()) diam = Math.max(diam, d);
    }
    return diam;
  };

  const opcion = (v) => ({ value: String(v), label: String(v) });

  VIS.arbol.opcionesDeNodos = function (texto) {
    const r = VIS.parse.treeArray(texto, MAX_NODOS);
    if (!r.ok) return [];
    return VIS.arbol.valores(r.arr).map(opcion);
  };

  VIS.arbol.opcionesDeK = function (texto) {
    const r = VIS.parse.treeArray(texto, MAX_NODOS);
    if (!r.ok) return [];
    const d = VIS.arbol.diametro(r.arr);
    return Array.from({ length: d + 1 }, (_, i) => opcion(i));
  };
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

```bash
node tools/test-parsers.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 6: Verificar que no hay regresión**

```bash
node --check js/editors.js
node tools/validate-code.js
node tools/test-editors.js && node tools/test-word-flow.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: sintaxis correcta, `32 correctos · 0 con errores` y `Todo correcto` en los cinco. Los ocho editores de árbol llaman a `VIS.preview.tree` con dos argumentos: el tercero queda `undefined`, `marca` es un conjunto vacío y ningún nodo se resalta, exactamente como antes.

- [ ] **Step 7: Commit**

```bash
git add rep-visual/js/editors.js rep-visual/tools/test-parsers.js
git commit -m "Ayudantes de árbol y vista previa con nodos resaltados"
```

---

### Task 2: El tipo de campo `select` y la reconciliación

El motor aprende a pintar desplegables cuyas opciones dependen de otro campo, y a reconciliar cuando el valor elegido desaparece.

**Files:**
- Modify: `rep-visual/js/engine.js` (`paintEditor`, `refreshPreview`; añadir `syncSelects`)
- Modify: `rep-visual/css/styles.css`
- Test: `rep-visual/tools/test-multi-field.js` (crear)

**Interfaces:**
- Consumes: `VIS.el(tag, cls, txt)`, `VIS.pick(x)`.
- Produces:
  - `field.type: "text" | "select"` — por defecto `"text"`.
  - `field.options(state): {value: string, label: string}[]` — obligatorio en los `select`.
  - `Engine.syncSelects(): void` — reconcilia el valor de cada `select` y repinta sus opciones. Se llama **al principio** de `refreshPreview()`, antes de `parse`.
  - Ids del DOM: cada campo, sea `<input>` o `<select>`, lleva `id = "editor-field-<id>"`.

- [ ] **Step 1: Escribir el test que falla**

Crear `rep-visual/tools/test-multi-field.js`:

```js
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
ok("Ejecutar sigue habilitado", run.disabled === false);

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
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-multi-field.js
```

Esperado: FALLA. El motor crea un `<input type=text>` también para el campo `elegido`, así que `sel().children` está vacío y `opciones()` devuelve `[]`.

- [ ] **Step 3: Pintar el `<select>` en `paintEditor()`**

En `rep-visual/js/engine.js`, dentro de la rama `kind === "text"` de `paintEditor()`, sustituir el `ed.fields.forEach((f) => { ... });` completo por:

```js
            ed.fields.forEach((f) => {
              const campo = VIS.el("label", "editor-field");
              campo.appendChild(VIS.el("span", "lbl", VIS.pick(f.label)));

              if (f.type === "select") {
                const sel = VIS.el("select");
                sel.id = "editor-field-" + f.id;
                // Las opciones las rellena refreshPreview() -> syncSelects():
                // dependen de lo escrito en los otros campos.
                sel.onchange = () => {
                  this.editState[f.id] = sel.value;
                  this.refreshPreview();
                };
                campo.appendChild(sel);
                wrap.appendChild(campo);
                return;
              }

              const inp = VIS.el("input");
              inp.type = "text";
              inp.id = "editor-field-" + f.id;
              inp.autocomplete = "off";
              inp.spellcheck = false;
              inp.value = this.editState[f.id];
              inp.placeholder = VIS.pick(f.placeholder) || "";
              // Solo si el campo los declara: nada codificado a fuego aquí.
              if (f.maxlength != null) inp.maxLength = f.maxlength;
              if (f.autocapitalize != null) inp.autocapitalize = f.autocapitalize;
              // Se sanea en cada pulsación y se devuelve al campo: lo que se ve es
              // exactamente lo que va a parse().
              inp.oninput = () => {
                const limpio = f.sanitize ? f.sanitize(inp.value) : inp.value;
                if (limpio !== inp.value) inp.value = limpio;
                this.editState[f.id] = limpio;
                this.refreshPreview();
              };
              campo.appendChild(inp);
              wrap.appendChild(campo);
            });
```

- [ ] **Step 4: Añadir `syncSelects()` y llamarlo desde `refreshPreview()`**

En `rep-visual/js/engine.js`, justo **antes** del método `refreshPreview()`, insertar:

```js
    /* Recalcula las opciones de cada desplegable y reconcilia su valor.

       Las opciones dependen de lo escrito en otro campo (los nodos del árbol),
       así que al teclear el valor elegido puede dejar de existir. La regla: si ya
       no está entre las opciones, cae a la primera (la raíz del árbol). Nunca
       queda un estado inválido, y Ejecutar sigue habilitado.

       Si el árbol es inválido, `options()` devuelve [] y el valor se conserva tal
       cual: el error del árbol ya deshabilita Ejecutar.                       */
    syncSelects() {
      const ed = this.problem.editor;
      (ed.fields || []).forEach((f) => {
        if (f.type !== "select") return;
        const sel = qs("#editor-field-" + f.id);
        if (!sel) return;

        const ops = f.options(this.editState) || [];
        if (!ops.length) return;

        if (!ops.some((o) => o.value === this.editState[f.id])) {
          this.editState[f.id] = ops[0].value;
        }

        // Se repintan siempre: son unas pocas opciones, y el desplegable no puede
        // estar abierto mientras se teclea en otro campo.
        sel.innerHTML = "";
        ops.forEach((o) => {
          const op = VIS.el("option", null, o.label);
          op.value = o.value;
          sel.appendChild(op);
        });
        sel.value = this.editState[f.id];
      });
    },
```

Y dentro de `refreshPreview()`, sustituir:

```js
        const res = ed.parse(this.editState);
        const hintEl = qs("#editor-hint");
```

por:

```js
        // Antes de parsear: reconciliar los desplegables con lo que se escribió.
        // parse() lee editState, y la reconciliación puede cambiarlo.
        this.syncSelects();

        const res = ed.parse(this.editState);
        const hintEl = qs("#editor-hint");
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

```bash
node tools/test-multi-field.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 6: Dar estilo al desplegable**

En `rep-visual/css/styles.css`, localizar:

```css
.editor-field input:focus { outline: none; border-color: var(--azul); }
.editor-field input.invalid { border-color: var(--rojo); }
```

y sustituir por:

```css
.editor-field select {
  background: var(--bg-3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 9px 12px;
  font-family: var(--mono);
  font-size: .95rem;
  min-height: 42px;
  cursor: pointer;
}
.editor-field input:focus,
.editor-field select:focus { outline: none; border-color: var(--azul); }
.editor-field input.invalid,
.editor-field select.invalid { border-color: var(--rojo); }
```

Y dentro del bloque `@media (max-width: 600px) { ... }`, junto a la línea `.editor-field input { width: 100%; }`, añadir:

```css
  .editor-field select { width: 100%; }
```

- [ ] **Step 7: Verificar que no hay regresión**

```bash
node --check js/engine.js
node tools/validate-code.js
node tools/test-parsers.js && node tools/test-editors.js && node tools/test-word-flow.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: sintaxis correcta, `32 correctos · 0 con errores`, `Todo correcto` en los seis. Los dieciséis editores actuales no declaran `type`, así que siguen siendo `<input type=text>`.

- [ ] **Step 8: Comprobar que los selectores literales del motor existen en el HTML**

El DOM falso es permisivo: un id mal escrito no lo caza ningún test.

```bash
grep -oE 'qs\("#[a-zA-Z-]+"\)' js/engine.js | grep -oE '#[a-zA-Z-]+' | sort -u > /tmp/e.txt
grep -oE 'id="[a-zA-Z-]+"' problem.html | sed 's/id="/#/;s/"//' | sort -u > /tmp/h.txt
comm -23 /tmp/e.txt /tmp/h.txt
```

Esperado: salida vacía. (`#editor-field-<id>` se construye en tiempo de ejecución y no aparece en este `grep`.)

- [ ] **Step 9: Commit**

```bash
git add rep-visual/js/engine.js rep-visual/css/styles.css rep-visual/tools/test-multi-field.js
git commit -m "Campo select con opciones dependientes y reconciliación"
```

---

### Task 3: Los tres editores (236, 1644, 863)

**Files:**
- Modify: `rep-visual/js/problems/236.js`, `rep-visual/js/problems/1644.js`, `rep-visual/js/problems/863.js`
- Modify: `rep-visual/tools/test-editors.js`

**Interfaces:**
- Consumes: `VIS.parse.treeArray(texto, 15)`, `VIS.arbol.opcionesDeNodos(texto)`, `VIS.arbol.opcionesDeK(texto)`, `VIS.preview.tree(arr, label, resaltados)` (Task 1); `field.type: "select"` con `options(state)` (Task 2).
- Produces: `PROBLEMS[{236,1644,863}].editor` con `kind: "text"` y tres campos cada uno.

- [ ] **Step 1: Escribir el test que falla**

En `rep-visual/tools/test-editors.js`, añadir `"236"`, `"863"` y `"1644"` al array `NUMS`, que pasa a ser:

```js
const NUMS = ["79", "98", "103", "124", "199", "200", "236", "297", "337", "417",
              "542", "543", "547", "695", "863", "987", "994", "1091", "1644"];
```

y añadir este bloque antes de las dos líneas finales del archivo:

```js
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
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-editors.js
```

Esperado: FALLA con `TypeError: Cannot read properties of undefined (reading 'kind')` — `236` no tiene `editor`.

- [ ] **Step 3: Escribir el editor de 236**

En `rep-visual/js/problems/236.js`, entre el cierre de `cases: [ ... ],` y la línea `build(input) {`, insertar:

```js
    // Modo interactivo: escribe el árbol y elige p y q de un desplegable con los
    // nodos que existen. Así no se puede pedir un nodo que no está.
    editor: {
      kind: "text",
      fields: [
        { id: "tree", type: "text", label: { es: "Árbol", en: "Tree" },
          placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" } },
        { id: "p", type: "select", label: { es: "p", en: "p" },
          options(state) { return VIS.arbol.opcionesDeNodos(state.tree); } },
        { id: "q", type: "select", label: { es: "q", en: "q" },
          options(state) { return VIS.arbol.opcionesDeNodos(state.tree); } },
      ],
      initial() { return { tree: "[3,5,1,6,2,0,8,null,null,7,4]", p: "5", q: "1" }; },
      parse(state) {
        const r = VIS.parse.treeArray(state.tree, 15);
        if (!r.ok) return { ok: false, field: "tree", error: r.error };
        return { ok: true, input: { tree: r.arr, p: Number(state.p), q: Number(state.q) } };
      },
      previewSpec(input) {
        return VIS.preview.tree(input.tree, { es: "Árbol", en: "Tree" }, [input.p, input.q]);
      },
      hint: {
        es: "Escribe el árbol y elige dos nodos. Se busca su ancestro común más bajo. Luego pulsa Ejecutar.",
        en: "Type the tree and pick two nodes. We look for their lowest common ancestor. Then press Run.",
      },
    },

```

- [ ] **Step 4: Escribir el editor de 1644**

En `rep-visual/js/problems/1644.js`, entre el cierre de `cases: [ ... ],` y la línea `build(input) {`, insertar:

```js
    // Modo interactivo: como 236, pero `q` ofrece además un nodo que NO está en
    // el árbol. Ésa es la lección entera de 1644: si falta uno de los dos, la
    // respuesta es null. La trampa se omite si el árbol ya contiene un 99, para
    // no tener dos opciones con el mismo valor ni una etiqueta que mienta.
    editor: {
      kind: "text",
      fields: [
        { id: "tree", type: "text", label: { es: "Árbol", en: "Tree" },
          placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" } },
        { id: "p", type: "select", label: { es: "p", en: "p" },
          options(state) { return VIS.arbol.opcionesDeNodos(state.tree); } },
        { id: "q", type: "select", label: { es: "q", en: "q" },
          options(state) {
            const ops = VIS.arbol.opcionesDeNodos(state.tree);
            if (!ops.length || ops.some((o) => o.value === "99")) return ops;
            return ops.concat([{ value: "99", label: "99 (no existe)" }]);
          } },
      ],
      initial() { return { tree: "[3,5,1,6,2,0,8,null,null,7,4]", p: "5", q: "99" }; },
      parse(state) {
        const r = VIS.parse.treeArray(state.tree, 15);
        if (!r.ok) return { ok: false, field: "tree", error: r.error };
        return { ok: true, input: { tree: r.arr, p: Number(state.p), q: Number(state.q) } };
      },
      previewSpec(input) {
        return VIS.preview.tree(input.tree, { es: "Árbol", en: "Tree" }, [input.p, input.q]);
      },
      hint: {
        es: "Escribe el árbol y elige dos nodos. Prueba con 99, que no existe: la respuesta es null. Luego pulsa Ejecutar.",
        en: "Type the tree and pick two nodes. Try 99, which is missing: the answer is null. Then press Run.",
      },
    },

```

- [ ] **Step 5: Escribir el editor de 863**

En `rep-visual/js/problems/863.js`, entre el cierre de `cases: [ ... ],` y la línea `build(input) {`, insertar:

```js
    // Modo interactivo: escribe el árbol, elige el objetivo y la distancia.
    // `target` es un desplegable de nodos existentes por una razón dura:
    // build() lanza una excepción si el objetivo no está en el árbol.
    // `k` llega al diámetro, no a la altura: la distancia puede subir y volver a
    // bajar, así que hay nodos más lejos de lo que el árbol es alto.
    editor: {
      kind: "text",
      fields: [
        { id: "tree", type: "text", label: { es: "Árbol", en: "Tree" },
          placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" } },
        { id: "target", type: "select", label: { es: "Objetivo", en: "Target" },
          options(state) { return VIS.arbol.opcionesDeNodos(state.tree); } },
        { id: "k", type: "select", label: { es: "Distancia k", en: "Distance k" },
          options(state) { return VIS.arbol.opcionesDeK(state.tree); } },
      ],
      initial() { return { tree: "[3,5,1,6,2,0,8,null,null,7,4]", target: "5", k: "2" }; },
      parse(state) {
        const r = VIS.parse.treeArray(state.tree, 15);
        if (!r.ok) return { ok: false, field: "tree", error: r.error };
        return { ok: true, input: { tree: r.arr, target: Number(state.target), k: Number(state.k) } };
      },
      previewSpec(input) {
        return VIS.preview.tree(input.tree, { es: "Árbol", en: "Tree" }, [input.target]);
      },
      hint: {
        es: "Escribe el árbol, elige un nodo objetivo y una distancia. Se buscan los nodos a exactamente esa distancia. Luego pulsa Ejecutar.",
        en: "Type the tree, pick a target node and a distance. We look for the nodes exactly that far away. Then press Run.",
      },
    },

```

- [ ] **Step 6: Ejecutar y verificar que pasa**

```bash
node tools/test-editors.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 7: Verificar que no hay regresión**

```bash
node --check js/problems/236.js && node --check js/problems/1644.js && node --check js/problems/863.js
node tools/validate-code.js
node tools/test-parsers.js && node tools/test-multi-field.js && node tools/test-word-flow.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: sintaxis correcta, `32 correctos · 0 con errores` y `Todo correcto` en los seis.

- [ ] **Step 8: Commit**

```bash
git add rep-visual/js/problems/236.js rep-visual/js/problems/1644.js rep-visual/js/problems/863.js rep-visual/tools/test-editors.js
git commit -m "Modo interactivo en 236, 1644 y 863: árbol escrito, parámetros elegidos"
```

---

### Task 4: Verificación en el navegador

Ningún test dibuja un SVG, despacha un evento real ni mide un layout. Esto no se automatiza aquí: hay que mirarlo.

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el servidor**

```bash
python -m http.server 8000 --bind 127.0.0.1
```

- [ ] **Step 2: Recorrer el checklist**

Abrir cada URL con **Ctrl+F5** (los `.js` se cachean).

`http://127.0.0.1:8000/problem.html?p=236`
1. Al elegir "✏️ Personalizado" salen tres campos: un texto con el árbol y dos desplegables, `p` y `q`.
2. El árbol se dibuja con los nodos `5` y `1` **resaltados**.
3. Cambiar `q` a `4` mueve el resaltado sin tocar nada más.
4. Editar el árbol a `[3,5,1]` teniendo `p=5`, `q=1`: las opciones se recortan y ningún desplegable queda apuntando a un nodo que ya no está.
5. Escribir `[3,5` (roto): el campo del árbol se pone rojo, Ejecutar se deshabilita y **el dibujo anterior no desaparece**. Los desplegables conservan su valor.
6. Corregir y **Ejecutar**: anima la búsqueda del LCA sobre el árbol que escribiste.
7. Al teclear en el campo del árbol, **el cursor no salta al final**: el `<input>` no se recrea.

`http://127.0.0.1:8000/problem.html?p=1644`
8. El desplegable de `q` ofrece `99 (no existe)` como última opción; el de `p` no.
9. Con `q = 99`, Ejecutar responde `null`.
10. Escribir un árbol que contenga un 99 (`[99,1,2]`): la opción `99` aparece **una sola vez** y sin la etiqueta "no existe".

`http://127.0.0.1:8000/problem.html?p=863`
11. `Distancia k` ofrece de `0` a `5` con el árbol por defecto.
12. `target = 5`, `k = 2` → `[7, 4, 1]`.
13. `target = 3`, `k = 5` → `No hay nodos a distancia 5. Respuesta [].`
14. El objetivo aparece resaltado en la vista previa.

En los tres:
15. Cambiar ES/EN en modo edición: las etiquetas cambian de idioma y los valores elegidos se conservan.
16. En DevTools responsive (Ctrl+Shift+M, iPhone SE): los tres campos ocupan el ancho completo y el árbol cabe.

- [ ] **Step 3: Detener el servidor**

```bash
taskkill //F //IM python.exe
```

---

## Notas para el implementador

- **`const` no se iza.** `MAX_NODOS` se usa dentro de `VIS.arbol.opcionesDeNodos`, así que su declaración tiene que aparecer **antes** en el archivo. Por eso la Task 1 lo mueve en un paso propio. Si lo olvidas, el fallo es un `ReferenceError` en tiempo de ejecución, no un error de sintaxis: no lo cazará `node --check`.
- **`this` en el descriptor.** `options`, `parse` y `previewSpec` se invocan como métodos. No los desestructures.
- **El `<input>` de texto no se recrea.** `syncSelects()` solo toca los `<select>`. Si algún día se repinta el texto en cada tecla, el cursor salta al final y escribir se vuelve imposible. Hay un test que lo fija: `el <input> de texto no se recrea al refrescar`.
- **`syncSelects()` va antes de `parse()`**, no después: `parse` lee `editState`, y la reconciliación puede cambiarlo.
- **Los valores de `editState` son texto**, también los de los desplegables. `parse` los convierte con `Number()`. Hoy ninguno puede valer `""` —un árbol válido siempre tiene al menos un nodo, y uno inválido corta en `parse` antes de mirar los parámetros—, pero si algún día ocurriera, `Number("")` daría `0` en silencio y no `NaN`.
- **La fase 4 se parte aquí.** `105`, `743` y `787` (dos arreglos, y grafos con pesos) van en otro spec: su entrada no es un árbol.
