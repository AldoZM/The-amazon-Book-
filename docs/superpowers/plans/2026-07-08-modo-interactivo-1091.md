# Modo interactivo (piloto 1091) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que en el problema 1091 el usuario dibuje su propia cuadrícula 5×5 (muros con un toque) y ejecute el mismo BFS animado, reutilizando el motor de pasos existente.

**Architecture:** El motor ya hace `build(input) → pasos`. El modo interactivo solo cambia de dónde viene `input`: de una cuadrícula que el usuario editó. Tres piezas nuevas y desacopladas: un descriptor `problem.editor` (datos + reglas de edición, en el módulo del problema), un pintor `VIS.renderers.gridEditor` (cuadrícula clicable, sin estado), y un modo `edit` en `engine.js` que las une. Ningún `build()` se toca.

**Tech Stack:** JavaScript vanilla (sin build, sin dependencias), `window.VIS` como namespace. Pruebas: scripts Node que cargan los módulos con `vm` sobre un DOM falso, al estilo de `tools/validate-code.js` (el repo no tiene test runner).

## Global Constraints

- Prosa de la interfaz en español e inglés: todo texto visible va en `{es, en}` o en el diccionario `UI` de `js/i18n.js`.
- Sin dependencias nuevas. Sin paso de build. Los `.js` se cargan con `<script>` directo.
- Tema oscuro existente. Reutilizar las clases de celda ya definidas (`wall`, `water`, `current`, `target`).
- No modificar ningún `build()`, ni `code`, ni `cases` de los 32 problemas.
- `node tools/validate-code.js` debe seguir dando `32 correctos · 0 con errores` al terminar cada tarea.
- Commits en español, **sin firma ni `Co-Authored-By` de IA**.
- El descriptor `editor` debe ser genérico: replicable después a 200, 994, 542, 695, 417 y 79 sin tocar motor ni pintor.

---

### Task 1: Descriptor de edición y cadenas de interfaz

Define los datos y las reglas de edición de 1091, más las tres cadenas de interfaz nuevas. Sin DOM: es lógica pura y por eso se prueba primero.

**Files:**
- Modify: `rep-visual/js/i18n.js` (diccionarios `UI.es` y `UI.en`)
- Modify: `rep-visual/js/problems/1091.js` (añadir `editor` entre `cases` y `build`)
- Test: `rep-visual/tools/test-editor-1091.js` (crear)

**Interfaces:**
- Consumes: nada (primera tarea).
- Produces:
  - `VIS.t("custom") | VIS.t("run") | VIS.t("edit")` → `string`
  - `problem.editor` con: `rows: number`, `cols: number`, `initial(): number[][]`, `toggle(v: number, r: number, c: number): number`, `cellView(v: number, r: number, c: number): {v: string, cls: string}`, `toInput(grid: number[][]): number[][]`, `hint: {es: string, en: string}`.
  - Todos los métodos de `editor` se invocan **como métodos** (`editor.toggle(...)`) porque usan `this.rows` / `this.cols`.

- [ ] **Step 1: Escribir el test que falla**

Crear `rep-visual/tools/test-editor-1091.js`:

```js
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

// --- toggle: alterna celdas normales, ignora inicio y meta ---
eq("toggle libre -> muro", ed.toggle(0, 2, 2), 1);
eq("toggle muro -> libre", ed.toggle(1, 2, 2), 0);
eq("toggle no toca el inicio (0,0)", ed.toggle(0, 0, 0), 0);
eq("toggle no toca la meta (4,4)", ed.toggle(0, 4, 4), 0);

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
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Ejecutar desde `rep-visual/`:

```bash
node tools/test-editor-1091.js
```

Esperado: FALLA. Primero por `VIS.t("custom")` devolviendo `"custom"` (la clave, porque no existe en el diccionario), y después con `TypeError: Cannot read properties of undefined (reading 'rows')` porque `editor` aún no existe.

- [ ] **Step 3: Añadir las cadenas de interfaz**

En `rep-visual/js/i18n.js`, dentro de `UI.es`, localizar la línea:

```js
      queue: "Cola", stack: "Pila", list: "Lista",
```

y añadir justo debajo:

```js
      custom: "✏️ Personalizado",
      run: "▶ Ejecutar",
      edit: "✏️ Editar",
```

Dentro de `UI.en`, localizar:

```js
      queue: "Queue", stack: "Stack", list: "List",
```

y añadir justo debajo:

```js
      custom: "✏️ Custom",
      run: "▶ Run",
      edit: "✏️ Edit",
```

- [ ] **Step 4: Añadir el descriptor `editor` a 1091**

En `rep-visual/js/problems/1091.js`, entre el cierre de `cases: [ ... ],` y `build(input) {`, insertar:

```js
    // Modo interactivo: el usuario dibuja los muros y ejecuta este mismo BFS.
    // Los métodos usan `this`, así que hay que llamarlos sobre el objeto.
    editor: {
      rows: 5,
      cols: 5,
      initial() {
        return Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
      },
      // Inicio (0,0) y meta (rows-1, cols-1) son fijos: el toque no los cambia.
      toggle(v, r, c) {
        if (r === 0 && c === 0) return v;
        if (r === this.rows - 1 && c === this.cols - 1) return v;
        return v === 0 ? 1 : 0;
      },
      // El muro gana sobre inicio/meta, pero `toggle` nunca los amuralla.
      cellView(v, r, c) {
        if (v === 1) return { v: "", cls: "wall" };
        if (r === 0 && c === 0) return { v: "A", cls: "current" };
        if (r === this.rows - 1 && c === this.cols - 1) return { v: "B", cls: "target" };
        return { v: "", cls: "water" };
      },
      // build(input) de 1091 recibe la cuadrícula directamente.
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para poner o quitar un muro. Inicio (A) y meta (B) son fijos. Luego pulsa Ejecutar.",
        en: "Tap a cell to add or remove a wall. Start (A) and goal (B) are fixed. Then press Run.",
      },
    },

```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

```bash
node tools/test-editor-1091.js
```

Esperado: todas las líneas con `✓` y `Todo correcto`, salida `exit 0`.

- [ ] **Step 6: Verificar que no hay regresión**

```bash
node tools/validate-code.js
```

Esperado: `32 correctos · 0 con errores`.

- [ ] **Step 7: Commit**

```bash
git add rep-visual/js/i18n.js rep-visual/js/problems/1091.js rep-visual/tools/test-editor-1091.js
git commit -m "Descriptor de edición para 1091 y cadenas de interfaz"
```

---

### Task 2: Pintor de cuadrícula editable

Un pintor puro, sin estado, igual que el resto de `renderers.js`: recibe el estado y un callback, devuelve DOM. No sabe nada del motor.

**Files:**
- Modify: `rep-visual/js/renderers.js` (añadir `VIS.renderers.gridEditor` tras `VIS.renderers.grid`)
- Modify: `rep-visual/css/styles.css` (cursor de celda editable)
- Test: `rep-visual/tools/test-grid-editor.js` (crear)

**Interfaces:**
- Consumes: `problem.editor` de la Task 1 (usa `editor.cellView`).
- Produces: `VIS.renderers.gridEditor(editState: number[][], editor: Editor, onToggle: (r: number, c: number) => void): HTMLElement` — devuelve el `<div class="grid">` **sin** envolver en caja ni etiqueta (la instrucción vive en la barra del editor, no aquí). Cada celda lleva `class="cell editable <cls>"` y un listener `click` que llama `onToggle(r, c)`.

- [ ] **Step 1: Escribir el test que falla**

Crear `rep-visual/tools/test-grid-editor.js`:

```js
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
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

```bash
node tools/test-grid-editor.js
```

Esperado: FALLA con `TypeError: VIS.renderers.gridEditor is not a function`.

- [ ] **Step 3: Implementar el pintor**

En `rep-visual/js/renderers.js`, justo después del cierre de `VIS.renderers.grid = function (spec) { ... };` (la línea `};` seguida de `/* --------------------------------------------------- COLA / PILA / LISTA */`), insertar:

```js
  /* ---------------------------------------------------------- GRID EDITABLE */
  // Cuadrícula que responde al clic/toque. No participa en el pipeline de pasos:
  // el motor la coloca en #stage durante el modo edición.
  //   editState: number[][]  — estado actual, propiedad del motor
  //   editor:    problem.editor — decide cómo se ve cada celda
  //   onToggle:  (r, c) => void — el motor decide qué hacer con el toque
  // El pintor no muta editState: solo reporta el toque.
  VIS.renderers.gridEditor = function (editState, editor, onToggle) {
    const rows = editState.length;
    const cols = rows ? editState[0].length : 0;
    const g = el("div", "grid");
    g.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const view = editor.cellView(editState[r][c], r, c);
        const d = el("div", "cell editable " + (view.cls || ""));
        d.appendChild(document.createTextNode(view.v != null ? view.v : ""));
        d.addEventListener("click", () => onToggle(r, c));
        g.appendChild(d);
      }
    }
    return g;
  };

```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

```bash
node tools/test-grid-editor.js
```

Esperado: todas las líneas con `✓` y `Todo correcto`, salida `exit 0`.

- [ ] **Step 5: Marcar la celda editable como clicable**

En `rep-visual/css/styles.css`, justo después de la regla `.cell.dim { opacity: .35; }`, añadir:

```css
/* Celda de la cuadrícula editable (modo interactivo) */
.cell.editable { cursor: pointer; user-select: none; }
.cell.editable:hover { border-color: var(--azul-soft); }
```

- [ ] **Step 6: Verificar que no hay regresión**

```bash
node tools/validate-code.js && node tools/test-editor-1091.js
```

Esperado: `32 correctos · 0 con errores`, y `Todo correcto` del test de la Task 1.

- [ ] **Step 7: Commit**

```bash
git add rep-visual/js/renderers.js rep-visual/css/styles.css rep-visual/tools/test-grid-editor.js
git commit -m "Pintor de cuadrícula editable"
```

---

### Task 3: Modo edición en el motor e interfaz

Une las dos piezas: el desplegable gana un caso "Personalizado", el escenario se vuelve editable y un botón Ejecutar alimenta el `build()` existente.

**Files:**
- Modify: `rep-visual/js/engine.js` (`buildCaseSelect`, `loadCase`, `relang`, `bindControls`; añadir `enterEditMode` y `runCustom`)
- Modify: `rep-visual/problem.html` (barra del editor y botón Editar)
- Modify: `rep-visual/css/styles.css` (estilo de la barra del editor)
- Test: `rep-visual/tools/test-interactive-flow.js` (crear)

**Interfaces:**
- Consumes: `problem.editor` (Task 1), `VIS.renderers.gridEditor` (Task 2), `VIS.t("custom"|"run"|"edit")` (Task 1).
- Produces:
  - `Engine.mode: "edit" | "play"` — en qué estado está el motor.
  - `Engine.editState: number[][]` — la cuadrícula que el usuario edita; persiste entre ediciones durante la sesión.
  - `Engine.setPlaybackEnabled(on: boolean): void` — enciende/apaga los cuatro botones de reproducción. Único sitio que toca `disabled`.
  - `Engine.hideEditorUI(): void` — oculta barra y botón Editar, reactiva reproducción.
  - `Engine.enterEditMode(): void` — pinta el editor, muestra la barra, apaga los controles de reproducción.
  - `Engine.runCustom(): void` — `build(editor.toInput(editState))` → `steps`, pasa a `mode = "play"` y reproduce.
  - Ids del DOM: `#editor-bar`, `#editor-hint`, `#btn-run`, `#btn-edit`.

- [ ] **Step 1: Escribir el test que falla**

Crear `rep-visual/tools/test-interactive-flow.js`:

```js
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
ok("editState se conserva al re-editar",
   JSON.stringify(Engine.editState) === JSON.stringify(problem.editor.initial()));
// Encierra la meta (4,4): muros en sus tres vecinas.
Engine.editState[3][3] = 1;
Engine.editState[3][4] = 1;
Engine.editState[4][3] = 1;
Engine.runCustom();
ok("meta encerrada -> respuesta -1", /-1/.test(lastNote()));

// --- el motor respeta que inicio y meta no se amurallan ---
Engine.enterEditMode();
Engine.editState[0][0] = problem.editor.toggle(Engine.editState[0][0], 0, 0);
ok("el inicio sigue libre tras alternarlo", Engine.editState[0][0] === 0);

console.log(fails ? `\n${fails} fallo(s)` : "\nTodo correcto");
process.exit(fails ? 1 : 0);
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

```bash
node tools/test-interactive-flow.js
```

Esperado: FALLA con `TypeError: Engine.enterEditMode is not a function`.

- [ ] **Step 3: Añadir el modo edición al motor**

En `rep-visual/js/engine.js`, dentro del objeto `Engine`, localizar la lista de campos:

```js
    problem: null,
    steps: [],
    i: 0,
    timer: null,
    speed: 900,
    codePre: null,
```

y sustituirla por (añade dos campos):

```js
    problem: null,
    steps: [],
    i: 0,
    timer: null,
    speed: 900,
    codePre: null,
    mode: "play",        // "play" | "edit"
    editState: null,     // cuadrícula que el usuario edita (modo interactivo)
```

Sustituir el método `buildCaseSelect()` completo por:

```js
    buildCaseSelect() {
      const sel = qs("#case-select");
      sel.innerHTML = "";
      (this.problem.cases || [{}]).forEach((c, i) => {
        const o = VIS.el("option", null, VIS.pick(c.name) || "Caso " + (i + 1));
        o.value = i;
        sel.appendChild(o);
      });
      // Si el problema trae editor, se ofrece como un caso más: lo haces tú.
      if (this.problem.editor) {
        const o = VIS.el("option", null, VIS.t("custom"));
        o.value = "custom";
        sel.appendChild(o);
      }
      sel.onchange = () => {
        if (sel.value === "custom") this.enterEditMode();
        else this.loadCase(+sel.value);
      };
    },
```

Sustituir el método `loadCase(idx)` completo por (añade el apagado del editor):

```js
    loadCase(idx) {
      this.pause();
      this.mode = "play";
      this.hideEditorUI();
      const c = (this.problem.cases || [{}])[idx] || {};
      try {
        this.steps = this.problem.build(c.input) || [];
      } catch (err) {
        this.steps = [{ note: "Error generando pasos: " + err.message, line: 0 }];
        console.error(err);
      }
      this.i = 0;
      this.render();
    },
```

Justo debajo de `loadCase`, insertar los tres métodos nuevos:

```js
    // Enciende o apaga los cuatro controles de reproducción de una vez.
    setPlaybackEnabled(on) {
      ["#btn-prev", "#btn-next", "#btn-play", "#btn-reset"].forEach((s) => {
        const b = qs(s); if (b) b.disabled = !on;
      });
    },

    // Oculta la barra del editor y el botón Editar, y reactiva la reproducción.
    hideEditorUI() {
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "none";
      const be = qs("#btn-edit");
      if (be) be.style.display = "none";
      this.setPlaybackEnabled(true);
    },

    // Modo interactivo: el escenario pasa a ser una cuadrícula que se toca.
    enterEditMode() {
      this.pause();
      const ed = this.problem.editor;
      if (!ed) return;
      this.mode = "edit";
      if (!this.editState) this.editState = ed.initial();

      const stage = qs("#stage");
      const redraw = () => {
        stage.innerHTML = "";
        stage.appendChild(VIS.renderers.gridEditor(this.editState, ed, (r, c) => {
          this.editState[r][c] = ed.toggle(this.editState[r][c], r, c);
          redraw();   // 5×5: re-dibujar entero es trivial y evita estado extra
        }));
      };
      redraw();

      const hint = VIS.pick(ed.hint);
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "flex";
      const hintEl = qs("#editor-hint");
      if (hintEl) hintEl.textContent = hint;
      const run = qs("#btn-run");
      if (run) run.textContent = VIS.t("run");
      const be = qs("#btn-edit");
      if (be) be.style.display = "none";

      // Todavía no hay pasos: la narración explica qué hacer y no se reproduce.
      const nar = qs("#narration");
      if (nar) nar.innerHTML = hint;
      const bar2 = qs("#bar");
      if (bar2) bar2.style.width = "0%";
      this.setPlaybackEnabled(false);
    },

    // Alimenta el build() del problema con la cuadrícula que dibujó el usuario.
    runCustom() {
      const ed = this.problem.editor;
      if (!ed || !this.editState) return;
      try {
        this.steps = this.problem.build(ed.toInput(this.editState)) || [];
      } catch (err) {
        this.steps = [{ note: "Error generando pasos: " + err.message, line: 0 }];
        console.error(err);
      }
      this.mode = "play";
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "none";
      const be = qs("#btn-edit");
      if (be) { be.style.display = ""; be.textContent = VIS.t("edit"); }
      this.setPlaybackEnabled(true);
      this.i = 0;
      this.render();
    },
```

En `bindControls()`, después de la línea `qs("#btn-reset").onclick = () => this.reset();`, añadir:

```js
      const run = qs("#btn-run");
      if (run) run.onclick = () => this.runCustom();
      const be = qs("#btn-edit");
      if (be) be.onclick = () => this.enterEditMode();
```

Sustituir el método `relang()` completo por (conserva el modo y el valor `"custom"`):

```js
    // Refresca todo lo que depende del idioma sin perder caso ni paso.
    relang() {
      if (!this.problem) return;
      this.buildHeader();
      this.codePre = VIS.renderCode(qs("#code"), VIS.pickCode(this.problem.code));
      this.buildLegend();
      const sel = qs("#case-select");
      const cur = sel.value;          // puede ser "custom": se guarda como texto
      this.buildCaseSelect();
      sel.value = cur;
      this.setPlayLabel();
      if (this.mode === "edit") this.enterEditMode();
      else this.render();
    },
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

```bash
node tools/test-interactive-flow.js
```

Esperado: todas las líneas con `✓` y `Todo correcto`, salida `exit 0`.

- [ ] **Step 5: Añadir la barra del editor y el botón Editar al HTML**

En `rep-visual/problem.html`, dentro del primer `.panel` (el del escenario), localizar:

```html
        <div class="stage" id="stage"></div>
        <div class="legend" id="legend"></div>
      </div>
```

y sustituirlo por:

```html
        <div class="stage" id="stage"></div>
        <div class="legend" id="legend"></div>
        <div class="editor-bar" id="editor-bar" style="display:none">
          <span class="editor-hint" id="editor-hint"></span>
          <button id="btn-run" class="primary" data-i18n="run">▶ Ejecutar</button>
        </div>
      </div>
```

Después, en la fila de controles, localizar:

```html
          <button id="btn-next" data-i18n="next">Siguiente ▶</button>
```

y añadir justo debajo:

```html
          <button id="btn-edit" data-i18n="edit" style="display:none">✏️ Editar</button>
```

- [ ] **Step 6: Dar estilo a la barra del editor**

En `rep-visual/css/styles.css`, justo después del bloque de la leyenda (las tres reglas que empiezan por `.legend`), y **antes** del comentario `/* ==== MÓVIL ... */`, añadir:

```css
/* Barra del modo interactivo: instrucción + botón Ejecutar */
.editor-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.editor-hint { color: var(--muted); font-size: .85rem; flex: 1; min-width: 180px; }
.editor-bar button {
  background: var(--azul);
  color: #fff;
  border: 1px solid var(--azul);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: .92rem;
  min-height: 42px;
  cursor: pointer;
}
.editor-bar button:hover { background: var(--azul-soft); }
```

Y dentro del bloque `@media (max-width: 600px) { ... }`, antes de su llave de cierre, añadir:

```css
  .editor-bar { padding: 10px 12px; }
  .editor-bar button { width: 100%; }
```

- [ ] **Step 7: Verificar sintaxis y ausencia de regresión**

```bash
node --check js/engine.js && node --check js/renderers.js && node --check js/problems/1091.js
node tools/validate-code.js
node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: los tres `--check` sin salida (correcto), `32 correctos · 0 con errores`, y `Todo correcto` en los tres tests.

- [ ] **Step 8: Verificación manual en el navegador**

Levantar el servidor y abrir `http://127.0.0.1:8000/problem.html?p=1091`:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Comprobar, uno a uno:

1. El desplegable "Caso de entrada" muestra **"✏️ Personalizado"** como última opción.
2. Al elegirlo: aparece una rejilla 5×5, con **A** en (0,0) y **B** en (4,4); la instrucción se lee bajo la rejilla; los botones Reiniciar / Anterior / Reproducir / Siguiente están **deshabilitados**.
3. Tocar una celda intermedia la convierte en muro (negra); tocarla otra vez la libera.
4. Tocar (0,0) o (4,4) **no** las cambia.
5. **Ejecutar**: la rejilla se anima con el BFS, el pseudocódigo se resalta paso a paso, los controles se reactivan y aparece **"✏️ Editar"**.
6. **Editar**: vuelve la rejilla con los muros que había; se puede modificar y volver a ejecutar.
7. Encerrar la meta con muros y ejecutar: la respuesta final es **-1**.
8. Cambiar el switch **ES/EN** en modo edición: la instrucción y los botones cambian de idioma y la rejilla se conserva.
9. Elegir otra vez un caso predefinido (ej. "Diagonal 5×5"): la barra del editor y el botón Editar **desaparecen** y todo funciona como antes.
10. En modo responsive de DevTools (Ctrl+Shift+M, iPhone SE): la rejilla cabe, el toque alterna muros y el botón Ejecutar ocupa el ancho.

- [ ] **Step 9: Commit**

```bash
git add rep-visual/js/engine.js rep-visual/problem.html rep-visual/css/styles.css rep-visual/tools/test-interactive-flow.js
git commit -m "Modo interactivo en 1091: dibuja la cuadrícula y ejecuta el BFS"
```

---

## Notas para el implementador

- **`this` en el descriptor.** `editor.toggle`, `editor.cellView` e `editor.initial` usan `this.rows` / `this.cols`. Hay que llamarlos siempre como métodos (`ed.toggle(...)`), nunca desestructurados (`const {toggle} = ed`), o `this` se pierde.
- **El pintor no muta.** `gridEditor` solo reporta el toque; quien cambia `editState` es el motor. Así el pintor sigue siendo puro, como el resto de `renderers.js`.
- **Por qué se re-dibuja entero.** En 5×5 son 25 nodos: re-dibujar es más simple y menos propenso a errores que actualizar una celda en sitio, y no se nota.
- **`sel.value` es texto.** Al añadir la opción `"custom"`, `relang()` ya no puede hacer `+sel.value`. El plan lo cambia a guardar la cadena.
- **Extensión futura.** Para dar modo interactivo a 200, 994, 542, 695, 417 o 79 basta con añadirles su propio `editor` (con su `initial`, `toggle`, `cellView`, `toInput` y `hint`). Ni el motor ni el pintor cambian.
