# Modo interactivo: fases 1 y 2 (547 y los árboles) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modo interactivo en `547` (matriz de adyacencia) y en los 8 problemas de árbol que reciben un solo arreglo, escribiéndolo en notación de LeetCode con vista previa en vivo.

**Architecture:** El motor ya hace `build(input) → pasos`. Se generaliza el editor de texto que hoy usa 79: `sanitize`+`validate`+`toInput` se funden en un solo `parse(state)` que devuelve el `input` o un error bilingüe, y el escenario dibuja la vista previa en cada pulsación con los ayudantes de layout que ya existen. Los parsers y las vistas previas compartidas viven en un módulo nuevo, `js/editors.js`, para no duplicarlos en ocho archivos.

**Tech Stack:** JavaScript vanilla (sin build, sin dependencias), `window.VIS`. Pruebas: scripts Node que cargan los módulos con `vm` sobre un DOM falso, al estilo de `tools/validate-code.js`.

## Global Constraints

- Sin dependencias nuevas. Sin paso de build. Los `.js` se cargan con `<script>` directo.
- Todo texto visible va en `{es, en}` o en el diccionario `UI` de `js/i18n.js`. Nada de cadenas de interfaz sueltas en el motor.
- No modificar ningún `build()`, ni `code`, ni `cases` de ningún problema.
- `node tools/validate-code.js` debe dar `32 correctos · 0 con errores` al terminar cada tarea.
- Los tests existentes (`test-editor-1091.js`, `test-grid-editor.js`, `test-interactive-flow.js`, `test-editors.js`, `test-word-flow.js`) deben seguir pasando.
- Tema oscuro existente. Reutilizar las clases de celda ya definidas.
- Commits en español, **sin** `Co-Authored-By` ni firma de IA.
- Los métodos del descriptor `editor` se invocan **como métodos** (`ed.parse(...)`), nunca desestructurados: usan `this`.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `js/editors.js` (nuevo) | `VIS.parse.*` y `VIS.preview.*`: parsers y vistas previas puros, compartidos por los descriptores. Sin DOM, sin estado. |
| `js/engine.js` | Modo edición: `kind "grid"` y `kind "text"`, vista previa en vivo, errores. |
| `js/problems/NNN.js` | Cada `editor` declara sus campos y su `parse`, apoyándose en `VIS.parse`. |
| `problem.html`, `css/styles.css` | El contenedor de campos y su estilo. |

---

### Task 1: `cycle` recibe la cuadrícula, no la celda

`547` es una matriz de adyacencia **simétrica**: tocar `(i,j)` obliga a tocar `(j,i)`, y la diagonal vale siempre 1. Una función que devuelve **una** celda no puede expresarlo. Se cambia la firma antes de escribir `547`.

**Files:**
- Modify: `rep-visual/js/engine.js` (la llamada dentro de `paintEditor`)
- Modify: `rep-visual/js/problems/{200,417,542,695,994,1091}.js` — solo el método `cycle`. (79 no lleva `cycle`: su editor es de texto.)
- Modify: `rep-visual/tools/test-editors.js`, `rep-visual/tools/test-editor-1091.js`, `rep-visual/tools/test-interactive-flow.js`

**Interfaces:**
- Consumes: nada.
- Produces: `editor.cycle(grid: T[][], r: number, c: number) → T[][]` — recibe y devuelve la cuadrícula. Puede mutarla. Sustituye a `cycle(v, r, c) → v'`.

- [ ] **Step 1: Adaptar los tests que fijan la firma vieja**

En `rep-visual/tools/test-editor-1091.js`, sustituir el bloque de `cycle`:

```js
// --- cycle: alterna celdas normales, ignora inicio y meta ---
eq("cycle libre -> muro", ed.cycle(0, 2, 2), 1);
eq("cycle muro -> libre", ed.cycle(1, 2, 2), 0);
eq("cycle no toca el inicio (0,0)", ed.cycle(0, 0, 0), 0);
eq("cycle no toca la meta (4,4)", ed.cycle(0, 4, 4), 0);
```

por:

```js
// --- cycle: recibe la cuadrícula, alterna una celda, ignora inicio y meta ---
const g1 = ed.initial();
eq("cycle libre -> muro", ed.cycle(g1, 2, 2)[2][2], 1);
eq("cycle muro -> libre", ed.cycle(g1, 2, 2)[2][2], 0);
eq("cycle no toca el inicio (0,0)", ed.cycle(ed.initial(), 0, 0)[0][0], 0);
eq("cycle no toca la meta (4,4)", ed.cycle(ed.initial(), 4, 4)[4][4], 0);
eq("cycle devuelve la misma cuadrícula", ed.cycle(g1, 1, 1), g1);
```

En `rep-visual/tools/test-interactive-flow.js`, sustituir:

```js
Engine.editState[0][0] = problem.editor.cycle(Engine.editState[0][0], 0, 0);
```

por:

```js
problem.editor.cycle(Engine.editState, 0, 0);
```

En `rep-visual/tools/test-editors.js`, la función `outcome` **no cambia** (recibe
un `mutar(g, ed)` que ya opera sobre la cuadrícula). Lo que cambia son las
aserciones de `cycle` y los cuerpos de `mutar`. Sustituir, respectivamente:

```js
// 200
eq("cycle agua -> tierra", ed.cycle(ed.initial(), 2, 2)[2][2], "1");
eq("cycle tierra -> agua", ed.cycle(ed.cycle(ed.initial(), 2, 2), 2, 2)[2][2], "0");
// ...
outcome("200", ed, (g, e) => { e.cycle(g, 2, 2); }, /Total de islas: 1\./, "una celda puesta con cycle -> exactamente 1 isla");

// 695
eq("cycle 0 -> 1", ed.cycle(ed.initial(), 2, 2)[2][2], 1);
eq("cycle 1 -> 0", ed.cycle(ed.cycle(ed.initial(), 2, 2), 2, 2)[2][2], 0);
outcome("695", ed, (g, e) => { e.cycle(g, 2, 2); }, /Área máxima: 1\./, "una celda puesta con cycle -> área 1");

// 542
eq("cycle fuente -> por calcular", ed.cycle(ed.initial(), 2, 2)[2][2], 1);

// 994  (la celda (1,1) arranca en 1 = fresca)
eq("cycle fresca -> podrida", ed.cycle(ed.initial(), 1, 1)[1][1], 2);
eq("cycle podrida -> vacío (da la vuelta)", ed.cycle(ed.cycle(ed.initial(), 1, 1), 1, 1)[1][1], 0);
eq("cycle vacío -> fresca", ed.cycle(ed.cycle(ed.cycle(ed.initial(), 1, 1), 1, 1), 1, 1)[1][1], 1);
outcome("994", ed, (g, e) => { e.cycle(g, 0, 0); e.cycle(g, 0, 0); }, /-1/, "sin ninguna podrida -> -1");

// 417  (la celda (0,0) arranca en altura 1)
eq("cycle sube un escalón", ed.cycle(ed.initial(), 0, 0)[0][0], 2);

// 1091
eq("cycle libre -> muro", ed.cycle(ed.initial(), 2, 2)[2][2], 1);
eq("cycle no toca el inicio", ed.cycle(ed.initial(), 0, 0)[0][0], 0);
eq("cycle no toca la meta", ed.cycle(ed.initial(), 4, 4)[4][4], 0);
```

Y la comprobación de pureza de `cellView` no cambia.

- [ ] **Step 2: Ejecutar y verificar que fallan**

```bash
node tools/test-editor-1091.js
node tools/test-editors.js
```

Esperado: FALLAN. Los editores actuales devuelven una celda, no la cuadrícula, así que `ed.cycle(g,2,2)[2][2]` da `undefined` (indexar un número).

- [ ] **Step 3: Cambiar la llamada del motor**

En `rep-visual/js/engine.js`, dentro de `paintEditor()`, sustituir:

```js
        stage.appendChild(VIS.renderers.gridEditor(this.editState, ed, (r, c) => {
          this.editState[r][c] = ed.cycle(this.editState[r][c], r, c);
          redraw();   // 5×5: re-dibujar entero es trivial y evita estado extra
        }));
```

por:

```js
        stage.appendChild(VIS.renderers.gridEditor(this.editState, ed, (r, c) => {
          // `cycle` recibe la cuadrícula entera: hay problemas (547) donde un
          // toque cambia dos celdas.
          this.editState = ed.cycle(this.editState, r, c);
          redraw();   // 5×5: re-dibujar entero es trivial y evita estado extra
        }));
```

- [ ] **Step 4: Cambiar los seis `cycle`**

`rep-visual/js/problems/200.js`:

```js
      cycle(g, r, c) { g[r][c] = g[r][c] === "0" ? "1" : "0"; return g; },
```

`rep-visual/js/problems/695.js`:

```js
      cycle(g, r, c) { g[r][c] = g[r][c] === 0 ? 1 : 0; return g; },
```

`rep-visual/js/problems/542.js`:

```js
      cycle(g, r, c) { g[r][c] = g[r][c] === 0 ? 1 : 0; return g; },
```

`rep-visual/js/problems/994.js`:

```js
      cycle(g, r, c) { g[r][c] = (g[r][c] + 1) % 3; return g; },
```

`rep-visual/js/problems/417.js`:

```js
      cycle(g, r, c) { g[r][c] = g[r][c] >= 9 ? 1 : g[r][c] + 1; return g; },
```

`rep-visual/js/problems/1091.js`:

```js
      // Inicio (0,0) y meta (rows-1, cols-1) son fijos: el toque no los cambia.
      cycle(g, r, c) {
        if (r === 0 && c === 0) return g;
        if (r === this.rows - 1 && c === this.cols - 1) return g;
        g[r][c] = g[r][c] === 0 ? 1 : 0;
        return g;
      },
```

- [ ] **Step 5: Ejecutar y verificar que pasan**

```bash
node tools/test-editor-1091.js && node tools/test-editors.js && node tools/test-interactive-flow.js && node tools/test-grid-editor.js && node tools/test-word-flow.js
node tools/validate-code.js
```

Esperado: `Todo correcto` en los cinco, y `32 correctos · 0 con errores`.

- [ ] **Step 6: Commit**

```bash
git add rep-visual/js/engine.js rep-visual/js/problems rep-visual/tools
git commit -m "cycle recibe la cuadrícula, no la celda"
```

---

### Task 2: Editor de 547 (matriz de adyacencia simétrica)

**Files:**
- Modify: `rep-visual/js/problems/547.js` (añadir `editor` entre `cases` y `build`)
- Modify: `rep-visual/tools/test-editors.js` (añadir `"547"` a `NUMS` y su bloque)

**Interfaces:**
- Consumes: `editor.cycle(grid, r, c) → grid` (Task 1).
- Produces: `PROBLEMS["547"].editor` con `rows: 5, cols: 5`.

- [ ] **Step 1: Escribir el test que falla**

En `rep-visual/tools/test-editors.js`, añadir `"547"` al array `NUMS` (queda `["79","200","417","542","547","695","994","1091"]`) y este bloque antes de la línea final:

```js
/* ------------------------------------------- 547 (matriz de adyacencia) */
console.log("\n── 547 Number of Provinces (matriz simétrica) ──");
{
  const ed = P["547"].editor;
  const g = ed.initial();
  eq("initial() es 5×5", [g.length, g[0].length], [5, 5]);
  ok("la diagonal arranca en 1", [0,1,2,3,4].every((i) => g[i][i] === 1));
  ok("fuera de la diagonal arranca en 0", g[0][1] === 0 && g[3][1] === 0);

  // Un toque cambia DOS celdas: la matriz es simétrica.
  const g2 = ed.cycle(ed.initial(), 1, 3);
  eq("cycle marca (1,3)", g2[1][3], 1);
  eq("cycle marca también (3,1)", g2[3][1], 1);
  const g3 = ed.cycle(g2, 1, 3);
  eq("volver a tocar desmarca las dos", [g3[1][3], g3[3][1]], [0, 0]);

  // La diagonal no se toca: una ciudad siempre está conectada consigo misma.
  const g4 = ed.cycle(ed.initial(), 2, 2);
  eq("cycle no toca la diagonal", g4[2][2], 1);

  eq("cellView conectada", ed.cellView(1, 0, 1), { v: "1", cls: "land" });
  eq("cellView sin conexión", ed.cellView(0, 0, 1), { v: "0", cls: "water" });
  eq("cellView diagonal", ed.cellView(1, 2, 2), { v: "1", cls: "visited" });
  ok("cellView no muta", cellViewIsPure(ed));

  buildRuns("547", ed);
  // 5 ciudades sin ninguna conexión: 5 provincias.
  outcome("547", ed, () => {}, /5/, "sin conexiones -> 5 provincias");
  // Unir 0-1 y 1-2 deja 3 provincias: {0,1,2}, {3}, {4}.
  outcome("547", ed, (g, e) => { e.cycle(g, 0, 1); e.cycle(g, 1, 2); },
          /3/, "dos conexiones encadenadas -> 3 provincias");
}
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-editors.js
```

Esperado: FALLA con `TypeError: Cannot read properties of undefined (reading 'initial')` — `547` aún no tiene `editor`.

- [ ] **Step 3: Escribir el editor**

En `rep-visual/js/problems/547.js`, entre el cierre de `cases: [ ... ],` y `build(input) {`, insertar:

```js
    // Modo interactivo: conecta ciudades y cuenta las provincias.
    // La entrada es una matriz de adyacencia SIMÉTRICA: si i es amiga de j,
    // j es amiga de i. Por eso `cycle` toca dos celdas de golpe, y la diagonal
    // (toda ciudad consigo misma) no se puede cambiar.
    editor: {
      rows: 5, cols: 5,
      initial() {
        const g = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
        for (let i = 0; i < this.rows; i++) g[i][i] = 1;
        return g;
      },
      cycle(g, r, c) {
        if (r === c) return g;                    // la diagonal es siempre 1
        const v = g[r][c] === 0 ? 1 : 0;
        g[r][c] = v;
        g[c][r] = v;                              // simétrica, siempre
        return g;
      },
      cellView(v, r, c) {
        if (r === c) return { v: "1", cls: "visited" };   // diagonal, fija
        return v === 1 ? { v: "1", cls: "land" } : { v: "0", cls: "water" };
      },
      toInput(grid) { return grid; },
      hint: {
        es: "Toca una celda para conectar o desconectar dos ciudades. La matriz es simétrica y la diagonal es fija. Luego pulsa Ejecutar.",
        en: "Tap a cell to connect or disconnect two cities. The matrix is symmetric and the diagonal is fixed. Then press Run.",
      },
    },

```

- [ ] **Step 4: Ejecutar y verificar que pasa**

```bash
node tools/test-editors.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 5: Verificar que no hay regresión**

```bash
node tools/validate-code.js
node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js && node tools/test-word-flow.js
```

Esperado: `32 correctos · 0 con errores` y `Todo correcto` en los cuatro.

- [ ] **Step 6: Commit**

```bash
git add rep-visual/js/problems/547.js rep-visual/tools/test-editors.js
git commit -m "Modo interactivo en 547: conecta ciudades en la matriz de adyacencia"
```

---

### Task 3: Parsers y vistas previas compartidos (`js/editors.js`)

Los ocho problemas de árbol parsean **exactamente el mismo** texto. El parser vive una vez.

**Files:**
- Create: `rep-visual/js/editors.js`
- Modify: `rep-visual/problem.html` (cargar el módulo nuevo)
- Test: `rep-visual/tools/test-parsers.js` (crear)

**Interfaces:**
- Consumes: `VIS.treeFromArray(arr)`, `VIS.binaryLayout(root)` de `js/renderers.js`.
- Produces:
  - `VIS.parse.treeArray(text: string, maxNodes: number): {ok: true, arr: (number|null)[]} | {ok: false, error: {es,en}}`
  - `VIS.preview.tree(arr: (number|null)[], label: {es,en}): {type: "tree", label, r: 18, nodes, edges}`
  - `VIS.treeEditor(arranque: string, hint: {es,en}): editor` — fábrica que devuelve el descriptor completo de un problema de árbol. Los ocho comparten `parse` y `previewSpec`; solo cambian el árbol de partida y la instrucción.

- [ ] **Step 1: Escribir el test que falla**

Crear `rep-visual/tools/test-parsers.js`:

```js
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
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-parsers.js
```

Esperado: FALLA con `Error: ENOENT ... js/editors.js` — el módulo no existe.

- [ ] **Step 3: Escribir el módulo**

Crear `rep-visual/js/editors.js`:

```js
/* ============================================================================
   editors.js — Parsers y vistas previas compartidos por los descriptores
   `problem.editor`. Funciones puras: sin DOM, sin estado.

   Un parser devuelve `{ok:true, ...}` o `{ok:false, error:{es,en}}`. El error
   dice QUÉ está mal (qué token, cuántos nodos caben), no solo que algo falla:
   el usuario lo lee mientras escribe.
   ============================================================================ */
(function () {
  const VIS = window.VIS || (window.VIS = {});
  VIS.parse = VIS.parse || {};
  VIS.preview = VIS.preview || {};

  const err = (es, en) => ({ ok: false, error: { es, en } });

  /* Notación de LeetCode para árboles: "[3,9,20,null,null,15,7]".
     Por niveles, con `null` para los huecos. Los corchetes son opcionales,
     pero si hay uno tiene que estar el otro.                                */
  VIS.parse.treeArray = function (text, maxNodes) {
    let s = String(text == null ? "" : text).trim();
    if (!s) return err("Escribe un árbol, por ejemplo [1,2,3].",
                       "Type a tree, for example [1,2,3].");

    const abre = s.startsWith("["), cierra = s.endsWith("]");
    if (abre !== cierra) {
      return abre ? err("Falta cerrar el corchete.", "The bracket is not closed.")
                  : err("Falta abrir el corchete.", "The bracket is not opened.");
    }
    if (abre) s = s.slice(1, -1).trim();
    if (!s) return err("El árbol está vacío: escribe al menos la raíz.",
                       "The tree is empty: type at least the root.");

    const partes = s.split(",");
    const arr = [];
    for (const bruto of partes) {
      const t = bruto.trim();
      if (t === "") {
        return err("Hay una coma de más.", "There is one comma too many.");
      }
      if (t === "null") { arr.push(null); continue; }
      if (!/^-?\d+$/.test(t)) {
        return err(`"${t}" no es un número ni null.`, `"${t}" is not a number or null.`);
      }
      arr.push(parseInt(t, 10));
    }

    if (arr[0] == null) {
      return err("La raíz no puede ser null.", "The root cannot be null.");
    }
    const nodos = arr.filter((v) => v != null).length;
    if (nodos > maxNodes) {
      return err(`Demasiados nodos: ${nodos}. Caben ${maxNodes}.`,
                 `Too many nodes: ${nodos}. The limit is ${maxNodes}.`);
    }
    return { ok: true, arr };
  };

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

  const ETIQUETA_ARBOL = { es: "Árbol", en: "Tree" };
  const MAX_NODOS = 31;   // más allá, el dibujo deja de caber

  /* Descriptor completo de un problema de árbol. Los ocho reciben el mismo
     arreglo de LeetCode: comparten `parse` y `previewSpec`, y solo cambian el
     árbol de partida y la instrucción. Escribirlo ocho veces sería copiarlo
     ocho veces.                                                              */
  VIS.treeEditor = function (arranque, hint) {
    return {
      kind: "text",
      fields: [
        {
          id: "tree",
          label: ETIQUETA_ARBOL,
          placeholder: { es: "[1,2,3,null,4]", en: "[1,2,3,null,4]" },
        },
      ],
      initial() { return { tree: arranque }; },
      parse(state) {
        const r = VIS.parse.treeArray(state.tree, MAX_NODOS);
        if (!r.ok) return { ok: false, field: "tree", error: r.error };
        return { ok: true, input: r.arr };
      },
      previewSpec(arr) { return VIS.preview.tree(arr, ETIQUETA_ARBOL); },
      hint,
    };
  };
})();
```

- [ ] **Step 4: Cargar el módulo en la página**

En `rep-visual/problem.html`, localizar:

```html
  <script src="js/i18n.js"></script>
  <script src="js/renderers.js"></script>
  <script src="js/engine.js"></script>
```

y sustituir por (el módulo depende de `renderers.js` y lo usa `engine.js`):

```html
  <script src="js/i18n.js"></script>
  <script src="js/renderers.js"></script>
  <script src="js/editors.js"></script>
  <script src="js/engine.js"></script>
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

```bash
node tools/test-parsers.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 6: Verificar que no hay regresión**

```bash
node tools/validate-code.js
node tools/test-editors.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js && node tools/test-word-flow.js
```

Esperado: `32 correctos · 0 con errores` y `Todo correcto` en los cinco.

- [ ] **Step 7: Commit**

```bash
git add rep-visual/js/editors.js rep-visual/problem.html rep-visual/tools/test-parsers.js
git commit -m "Parsers y vistas previas compartidos para los editores"
```

---

### Task 4: `kind: "text"` con varios campos y vista previa en vivo

Unifica `sanitize`+`validate`+`toInput` en un solo `parse`, pinta la vista previa en cada pulsación y enseña los errores. `79` migra a la forma nueva y `kind: "word"` desaparece.

**Files:**
- Modify: `rep-visual/js/engine.js` (`paintEditor`, `runCustom`; añadir `refreshPreview`)
- Modify: `rep-visual/problem.html` (sustituir `#editor-word` por `#editor-fields`)
- Modify: `rep-visual/css/styles.css` (campos y estado de error)
- Modify: `rep-visual/js/problems/79.js` (migrar el editor)
- Modify: `rep-visual/tools/test-word-flow.js` (el campo cambia de id)
- Modify: `rep-visual/tools/test-editors.js` (el bloque de 79)

**Interfaces:**
- Consumes: `VIS.renderers[spec.type]`, `VIS.el`, `VIS.pick`.
- Produces:
  - `editor.kind === "text"` con `fields: [{id, label:{es,en}, placeholder:{es,en}, sanitize?(raw)}]`
  - `editor.initial(): {[fieldId]: string}`
  - `editor.parse(state): {ok:true, input} | {ok:false, error:{es,en}, field?:string}`
  - `editor.previewSpec(input): {type:"tree"|"graph"|"grid", ...}`
  - `Engine.refreshPreview(): void` — corre `parse`, pinta la vista previa o el error, y es el **único** sitio que habilita o deshabilita `#btn-run`.
  - Ids del DOM: `#editor-fields`, y un `#editor-field-<id>` por campo.

- [ ] **Step 1: Escribir el test que falla**

Sustituir el contenido de `rep-visual/tools/test-word-flow.js` por:

```js
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
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-word-flow.js
```

Esperado: FALLA. `Engine.editState.word` es `undefined` (hoy `editState` es una cadena, no un objeto) y `#editor-field-word` no existe.

- [ ] **Step 3: Sustituir el campo único por el contenedor de campos (HTML)**

En `rep-visual/problem.html`, localizar:

```html
        <div class="editor-bar" id="editor-bar" style="display:none">
          <span class="editor-hint" id="editor-hint"></span>
          <input class="editor-word" id="editor-word" type="text" maxlength="10"
                 autocomplete="off" autocapitalize="characters" spellcheck="false"
                 style="display:none">
          <button id="btn-run" class="primary" data-i18n="run">▶ Ejecutar</button>
        </div>
```

y sustituir por:

```html
        <div class="editor-bar" id="editor-bar" style="display:none">
          <span class="editor-hint" id="editor-hint"></span>
          <div class="editor-fields" id="editor-fields" style="display:none"></div>
          <button id="btn-run" class="primary" data-i18n="run">▶ Ejecutar</button>
        </div>
```

- [ ] **Step 4: Estilo de los campos y del error (CSS)**

En `rep-visual/css/styles.css`, sustituir el bloque de `.editor-word` (desde el comentario `/* Campo de texto del modo palabra (79) ... */` hasta `.editor-word:focus { ... }`, ambos incluidos) por:

```css
/* Campos del modo texto: el usuario escribe la entrada (árbol, palabra, aristas). */
.editor-fields { display: flex; gap: 12px; flex-wrap: wrap; }
.editor-field { display: flex; flex-direction: column; gap: 4px; }
.editor-field .lbl {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--muted);
}
.editor-field input {
  background: var(--bg-3);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 9px 12px;
  font-family: var(--mono);
  font-size: .95rem;
  min-height: 42px;
  width: 13em;
}
.editor-field input:focus { outline: none; border-color: var(--azul); }
.editor-field input.invalid { border-color: var(--rojo); }
.editor-hint.error { color: var(--rojo); }
```

Y dentro del bloque `@media (max-width: 600px) { ... }`, sustituir la línea `.editor-word { width: 100%; }` por:

```css
  .editor-fields { width: 100%; }
  .editor-field { flex: 1; min-width: 100%; }
  .editor-field input { width: 100%; }
```

- [ ] **Step 5: Reescribir el modo edición del motor**

En `rep-visual/js/engine.js`, sustituir el método `paintEditor()` completo por:

```js
    // Escenario en modo edición: una cuadrícula que se toca (kind "grid") o unos
    // campos de texto con vista previa en vivo (kind "text").
    paintEditor() {
      const ed = this.problem.editor;
      const stage = qs("#stage");
      const wrap = qs("#editor-fields");

      if ((ed.kind || "grid") === "text") {
        if (wrap) {
          wrap.innerHTML = "";
          wrap.style.display = "flex";
          ed.fields.forEach((f) => {
            const campo = VIS.el("label", "editor-field");
            campo.appendChild(VIS.el("span", "lbl", VIS.pick(f.label)));
            const inp = VIS.el("input");
            inp.type = "text";
            inp.id = "editor-field-" + f.id;
            inp.autocomplete = "off";
            inp.spellcheck = false;
            inp.value = this.editState[f.id];
            inp.placeholder = VIS.pick(f.placeholder) || "";
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
        }
        this.refreshPreview();
        return;
      }

      if (wrap) wrap.style.display = "none";
      const redraw = () => {
        stage.innerHTML = "";
        stage.appendChild(VIS.renderers.gridEditor(this.editState, ed, (r, c) => {
          // `cycle` recibe la cuadrícula entera: hay problemas (547) donde un
          // toque cambia dos celdas.
          this.editState = ed.cycle(this.editState, r, c);
          redraw();   // 5×5: re-dibujar entero es trivial y evita estado extra
        }));
      };
      redraw();
      const run = qs("#btn-run");
      if (run) run.disabled = false;
    },

    // Corre parse() y refleja el resultado: vista previa o error. Es el único
    // sitio que decide si Ejecutar está habilitado.
    refreshPreview() {
      const ed = this.problem.editor;
      const res = ed.parse(this.editState);
      const hintEl = qs("#editor-hint");
      const run = qs("#btn-run");

      (ed.fields || []).forEach((f) => {
        const inp = qs("#editor-field-" + f.id);
        if (inp) inp.classList.remove("invalid");
      });

      if (res.ok) {
        if (hintEl) { hintEl.classList.remove("error"); hintEl.textContent = VIS.pick(ed.hint); }
        const spec = ed.previewSpec(res.input);
        const pintor = VIS.renderers[spec.type];
        if (pintor) {
          const stage = qs("#stage");
          stage.innerHTML = "";
          stage.appendChild(pintor(spec));
        }
        if (run) run.disabled = false;
        return;
      }

      if (hintEl) { hintEl.classList.add("error"); hintEl.textContent = VIS.pick(res.error); }
      if (res.field) {
        const inp = qs("#editor-field-" + res.field);
        if (inp) inp.classList.add("invalid");
      }
      if (run) run.disabled = true;
      // El escenario NO se toca: se conserva el último dibujo válido, para que
      // no parpadee mientras se escribe.
    },
```

Sustituir el arranque de `runCustom()` (desde `runCustom() {` hasta el cierre del `try/catch`) por:

```js
    // Alimenta el build() del problema con la entrada que construyó el usuario.
    runCustom() {
      const ed = this.problem.editor;
      if (!ed || this.editState == null) return;
      let entrada;
      if ((ed.kind || "grid") === "text") {
        const res = ed.parse(this.editState);
        if (!res.ok) return;      // el usuario ya ve el error; Ejecutar no hace nada
        entrada = res.input;
      } else {
        entrada = ed.toInput(this.editState);
      }
      try {
        this.steps = this.problem.build(entrada) || [];
      } catch (err) {
        this.steps = [{ note: "Error generando pasos: " + err.message, line: 0 }];
        console.error(err);
      }
```

(El resto de `runCustom` —`this.mode = "play"`, ocultar la barra, mostrar Editar, `setPlaybackEnabled(true)`, `this.i = 0`, `this.render()`— no cambia.)

Sustituir el método `enterEditMode()` completo por el siguiente. **El cambio
importante es el orden**: hoy `paintEditor()` se llama *antes* de escribir la
instrucción en `#editor-hint`, así que el mensaje de error que pinta
`refreshPreview()` se borraría acto seguido. `paintEditor()` pasa al final y
tiene la última palabra.

```js
    // Modo interactivo: el usuario construye la entrada y luego la ejecuta.
    enterEditMode() {
      this.pause();
      const ed = this.problem.editor;
      if (!ed) return;
      this.mode = "edit";
      this.steps = [];   // fuera los pasos del caso anterior: aún no hay reproducción
      // `== null` y no `!editState`: la cadena vacía y el objeto vacío son
      // estados legítimos, y `!""` haría reaparecer el valor por defecto.
      if (this.editState == null) this.editState = ed.initial();

      const hint = VIS.pick(ed.hint);
      const bar = qs("#editor-bar");
      if (bar) bar.style.display = "flex";
      const hintEl = qs("#editor-hint");
      if (hintEl) { hintEl.classList.remove("error"); hintEl.textContent = hint; }
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

      // Al final: `refreshPreview()` puede sustituir la instrucción por un error
      // y deshabilitar Ejecutar. Nadie debe pisarlo después.
      this.paintEditor();
    },
```

El test del Step 1 ya fija ese orden con las dos aserciones
`"al entrar con entrada inválida, el error se ve"` y
`"y Ejecutar sigue deshabilitado"`. Si dejas `paintEditor()` donde estaba, esas
dos fallan.

- [ ] **Step 6: Migrar el editor de 79**

En `rep-visual/js/problems/79.js`, sustituir el bloque `editor: { ... },` completo por:

```js
    // Modo interactivo, variante de texto: aquí lo editable no es una
    // cuadrícula. build() recibe {board, word}, y ciclar letras A→Z a toques
    // serían 26 toques por celda. Así que el tablero queda fijo y se escribe la
    // palabra en un campo.
    editor: {
      kind: "text",
      board: [
        ["A","B","C","E"],
        ["S","F","C","S"],
        ["A","D","E","E"],
      ],
      fields: [
        {
          id: "word",
          label: { es: "Palabra", en: "Word" },
          placeholder: { es: "Ej. ABCCED", en: "e.g. ABCCED" },
          // Lo que se ve en el campo es exactamente lo que recibirá build().
          sanitize(raw) { return String(raw).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 10); },
        },
      ],
      initial() { return { word: "ABCCED" }; },
      parse(state) {
        const word = state.word || "";
        if (!word) {
          return { ok: false, field: "word",
                   error: { es: "Escribe una palabra para buscarla.",
                            en: "Type a word to search for it." } };
        }
        return { ok: true, input: { board: this.board.map((r) => r.slice()), word } };
      },
      // El tablero es fijo: la vista previa no depende de lo escrito.
      previewSpec() {
        return {
          type: "grid",
          label: { es: "Tablero (fijo)", en: "Board (fixed)" },
          cells: this.board.map((row) => row.map((ch) => ({ v: ch, cls: "water" }))),
        };
      },
      hint: {
        es: "El tablero es fijo. Escribe la palabra a buscar y pulsa Ejecutar. Prueba ABCCED, SEE o ABF.",
        en: "The board is fixed. Type the word to search and press Run. Try ABCCED, SEE or ABF.",
      },
    },
```

- [ ] **Step 7: Adaptar el bloque de 79 en `test-editors.js`**

En `rep-visual/tools/test-editors.js`, sustituir el bloque `── 79 Word Search (modo palabra) ──` completo por:

```js
/* --------------------------------------------------------- 79 (modo texto) */
console.log("\n── 79 Word Search (modo texto) ──");
{
  const ed = P["79"].editor;
  eq("kind es text", ed.kind, "text");
  eq("un solo campo, llamado word", ed.fields.map((f) => f.id), ["word"]);
  eq("initial() es un objeto de campos", ed.initial(), { word: "ABCCED" });

  const san = ed.fields[0].sanitize;
  eq("sanitize pasa a mayúsculas", san("abc"), "ABC");
  eq("sanitize tira lo que no es letra", san("a1b-c "), "ABC");
  eq("sanitize corta a 10", san("ABCDEFGHIJKLMNOP").length, 10);

  const vacio = ed.parse({ word: "" });
  eq("parse rechaza la palabra vacía", vacio.ok, false);
  eq("y señala el campo", vacio.field, "word");
  ok("con mensaje bilingüe", typeof vacio.error.es === "string" && typeof vacio.error.en === "string");

  const bien = ed.parse({ word: "SEE" });
  eq("parse acepta una palabra", bien.ok, true);
  ok("y devuelve {board, word}", Array.isArray(bien.input.board) && bien.input.word === "SEE");
  bien.input.board[0][0] = "Z";
  eq("parse copia el tablero (no lo comparte)", ed.board[0][0], "A");

  const spec = ed.previewSpec();
  eq("previewSpec es una rejilla", spec.type, "grid");
  eq("previewSpec: 3 filas × 4 columnas", [spec.cells.length, spec.cells[0].length], [3, 4]);
  ok("VIS.renderers sabe pintar ese type", typeof sandbox.VIS.renderers[spec.type] === "function");

  const existe = P["79"].build(ed.parse({ word: "SEE" }).input);
  ok("SEE existe en el tablero", /verdadero/.test(existe[existe.length - 1].note.es));
  const noExiste = P["79"].build(ed.parse({ word: "ABCB" }).input);
  ok("ABCB no existe", /falso/.test(noExiste[noExiste.length - 1].note.es));
}
```

Y en el bloque `── contrato común ──`, sustituir:

```js
  ok(`${n}: kind válido (${kind})`, kind === "grid" || kind === "word");
  ok(`${n}: hint bilingüe`, typeof ed.hint.es === "string" && typeof ed.hint.en === "string");
  ok(`${n}: initial() y toInput() son funciones`, typeof ed.initial === "function" && typeof ed.toInput === "function");
```

por:

```js
  ok(`${n}: kind válido (${kind})`, kind === "grid" || kind === "text");
  ok(`${n}: hint bilingüe`, typeof ed.hint.es === "string" && typeof ed.hint.en === "string");
  ok(`${n}: initial() es función`, typeof ed.initial === "function");
  if (kind === "grid") ok(`${n}: toInput() es función`, typeof ed.toInput === "function");
  else ok(`${n}: parse() y previewSpec() son funciones`, typeof ed.parse === "function" && typeof ed.previewSpec === "function");
```

Además, `test-editors.js` debe cargar el módulo nuevo: en su lista de archivos, cambiar

```js
for (const f of ["js/i18n.js", "js/renderers.js"])
```

por

```js
for (const f of ["js/i18n.js", "js/renderers.js", "js/editors.js"])
```

- [ ] **Step 8: Ejecutar y verificar que pasan**

```bash
node tools/test-word-flow.js
node tools/test-editors.js
```

Esperado: `Todo correcto` en los dos.

- [ ] **Step 9: Verificar que no hay regresión**

```bash
node --check js/engine.js && node --check js/editors.js && node --check js/problems/79.js
node tools/validate-code.js
node tools/test-parsers.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: sintaxis correcta, `32 correctos · 0 con errores`, `Todo correcto` en los cuatro.

- [ ] **Step 10: Comprobar que los selectores del motor existen en el HTML**

El DOM falso de los tests es permisivo: `qs()` devuelve un nodo para cualquier selector, así que **un id mal escrito no lo caza ningún test**.

```bash
grep -oE 'qs\("#[a-zA-Z-]+"\)' js/engine.js | grep -oE '#[a-zA-Z-]+' | sort -u > /tmp/e.txt
grep -oE 'id="[a-zA-Z-]+"' problem.html | sed 's/id="/#/;s/"//' | sort -u > /tmp/h.txt
comm -23 /tmp/e.txt /tmp/h.txt
```

Esperado: salida vacía. (`#editor-field-<id>` se crea en tiempo de ejecución y no aparece en este `grep`, que solo mira selectores literales.)

- [ ] **Step 11: Commit**

```bash
git add rep-visual/js/engine.js rep-visual/problem.html rep-visual/css/styles.css rep-visual/js/problems/79.js rep-visual/tools
git commit -m "Editor de texto con varios campos, vista previa en vivo y errores"
```

---

### Task 5: Los ocho problemas de árbol

Los ocho reciben el mismo arreglo de LeetCode. Todos usan la fábrica `VIS.treeEditor(arranque, hint)`: una línea por problema. Solo cambian el árbol de partida y la instrucción.

**Files:**
- Modify: `rep-visual/js/problems/{98,103,124,199,297,337,543,987}.js` — una línea `editor:` en cada uno
- Modify: `rep-visual/tools/test-editors.js`

**Interfaces:**
- Consumes: `VIS.treeEditor(arranque, hint)` (Task 3); `kind: "text"` (Task 4).
- Produces: `PROBLEMS[n].editor` con `kind: "text"` y un solo campo `tree`, para los ocho.

- [ ] **Step 1: Escribir el test que falla**

En `rep-visual/tools/test-editors.js`, añadir los ocho a `NUMS` (queda `["79","98","103","124","199","200","297","337","417","542","543","547","695","987","994","1091"]`) y este bloque antes de la línea final:

```js
/* ------------------------------------------------- los ocho de árbol */
console.log("\n── Árboles (un arreglo de LeetCode) ──");
{
  const ARBOLES = {
    "98":  "[2,1,3]",
    "103": "[3,9,20,null,null,15,7]",
    "124": "[1,2,3]",
    "199": "[1,2,3,null,5,null,4]",
    "297": "[1,2,3,null,null,4,5]",
    "337": "[3,2,3,null,3,null,1]",
    "543": "[1,2,3,4,5]",
    "987": "[3,9,20,null,null,15,7]",
  };
  for (const [n, arranque] of Object.entries(ARBOLES)) {
    const ed = P[n].editor;
    eq(`${n}: kind text, campo "tree"`, [ed.kind, ed.fields.map((f) => f.id)], ["text", ["tree"]]);
    eq(`${n}: initial() trae su árbol`, ed.initial(), { tree: arranque });

    const bien = ed.parse(ed.initial());
    ok(`${n}: parse acepta su propio arranque`, bien.ok === true);
    ok(`${n}: parse devuelve el arreglo que build() espera`, Array.isArray(bien.input));

    const malo = ed.parse({ tree: "[1,2" });
    eq(`${n}: parse rechaza el corchete sin cerrar`, malo.ok, false);
    eq(`${n}: y señala el campo tree`, malo.field, "tree");

    const spec = ed.previewSpec(bien.input);
    eq(`${n}: previewSpec es un árbol`, spec.type, "tree");
    ok(`${n}: VIS.renderers sabe pintarlo`, typeof sandbox.VIS.renderers[spec.type] === "function");

    // Lo que de verdad importa: el arreglo que produce parse() lo digiere build().
    let steps = null;
    try { steps = P[n].build(bien.input); } catch (e) { fails++; console.log(`  ✗ ${n}: build lanzó: ${e.message}`); }
    ok(`${n}: build(parse(initial())) genera pasos`, Array.isArray(steps) && steps.length > 0);
    ok(`${n}: todo paso trae line`, steps && steps.every((s) => s.line != null));
  }

  // Un árbol distinto del de arranque también funciona: 543 con una cadena.
  const ed543 = P["543"].editor;
  const cadena = ed543.parse({ tree: "[1,2,null,3,null,4]" });
  ok("543 acepta una cadena escrita a mano", cadena.ok === true);
  const st = P["543"].build(cadena.input);
  ok("543 sobre la cadena da diámetro 3", /3/.test(st[st.length - 1].note.es));

  // Salen todos de la misma fábrica, pero cada uno con su propio estado: si
  // compartieran el objeto, escribir en un problema cambiaría el de al lado.
  const a = P["98"].editor, b = P["543"].editor;
  ok("cada problema tiene su propio descriptor", a !== b);
  ok("y su propio árbol de partida", a.initial().tree !== b.initial().tree);
  ok("los ocho comparten el mismo parse (viene de la fábrica)",
     Object.keys(ARBOLES).every((n) => typeof P[n].editor.parse === "function"));
}
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
node tools/test-editors.js
```

Esperado: FALLA con `TypeError: Cannot read properties of undefined (reading 'kind')` — ninguno de los ocho tiene `editor`.

- [ ] **Step 3: Escribir los ocho editores**

Cada problema usa la fábrica `VIS.treeEditor(arranque, hint)` de la Task 3. En
cada archivo, insertar entre el cierre de `cases: [ ... ],` y `build(input) {` la
línea que le corresponde. **Éste es el de `103.js`, completo y literal**:

```js
    // Modo interactivo: escribe el árbol en la notación de LeetCode (por
    // niveles, con null para los huecos) y se dibuja mientras escribes.
    editor: VIS.treeEditor("[3,9,20,null,null,15,7]", {
      es: "Escribe el árbol por niveles, con null para los huecos, y míralo recorrer en zigzag. Luego pulsa Ejecutar.",
      en: "Type the tree level by level, with null for the gaps, and watch the zigzag traversal. Then press Run.",
    }),

```

Los otros siete son la misma línea con otros dos argumentos. El comentario de
arriba se copia tal cual en los ocho. Argumentos exactos:

`98.js`
```js
    editor: VIS.treeEditor("[2,1,3]", {
      es: "Escribe un árbol y comprueba si es un BST. Prueba [5,1,4,null,null,3,6], que no lo es. Luego pulsa Ejecutar.",
      en: "Type a tree and check whether it is a BST. Try [5,1,4,null,null,3,6], which is not. Then press Run.",
    }),
```

`124.js`
```js
    editor: VIS.treeEditor("[1,2,3]", {
      es: "Escribe un árbol y busca el camino de suma máxima. Prueba [-10,9,20,null,null,15,7]. Luego pulsa Ejecutar.",
      en: "Type a tree and find the maximum path sum. Try [-10,9,20,null,null,15,7]. Then press Run.",
    }),
```

`199.js`
```js
    editor: VIS.treeEditor("[1,2,3,null,5,null,4]", {
      es: "Escribe el árbol y mira qué nodos se ven desde la derecha. Luego pulsa Ejecutar.",
      en: "Type the tree and see which nodes are visible from the right. Then press Run.",
    }),
```

`297.js`
```js
    editor: VIS.treeEditor("[1,2,3,null,null,4,5]", {
      es: "Escribe el árbol y míralo convertirse en una cadena de texto. Luego pulsa Ejecutar.",
      en: "Type the tree and watch it turn into a string. Then press Run.",
    }),
```

`337.js`
```js
    editor: VIS.treeEditor("[3,2,3,null,3,null,1]", {
      es: "Escribe el árbol de casas y busca el botín máximo sin robar dos casas vecinas. Luego pulsa Ejecutar.",
      en: "Type the tree of houses and find the maximum loot without robbing two adjacent houses. Then press Run.",
    }),
```

`543.js`
```js
    editor: VIS.treeEditor("[1,2,3,4,5]", {
      es: "Escribe el árbol y mide su diámetro: el camino más largo entre dos nodos. Luego pulsa Ejecutar.",
      en: "Type the tree and measure its diameter: the longest path between two nodes. Then press Run.",
    }),
```

`987.js`
```js
    editor: VIS.treeEditor("[3,9,20,null,null,15,7]", {
      es: "Escribe el árbol y míralo recorrer por columnas, de izquierda a derecha. Luego pulsa Ejecutar.",
      en: "Type the tree and watch the column-by-column traversal, left to right. Then press Run.",
    }),
```

**Ojo con el orden de carga:** `VIS.treeEditor` se invoca al cargar el módulo del
problema, así que `js/editors.js` tiene que estar cargado antes. En el navegador
lo garantiza el `<script>` de la Task 3; en los tests, la lista de archivos que
carga el `vm`.

- [ ] **Step 4: Ejecutar y verificar que pasa**

```bash
node tools/test-editors.js
```

Esperado: `Todo correcto`, salida `exit 0`.

- [ ] **Step 5: Verificar que no hay regresión**

```bash
node tools/validate-code.js
node tools/test-parsers.js && node tools/test-word-flow.js && node tools/test-editor-1091.js && node tools/test-grid-editor.js && node tools/test-interactive-flow.js
```

Esperado: `32 correctos · 0 con errores` y `Todo correcto` en los cinco.

- [ ] **Step 6: Commit**

```bash
git add rep-visual/js/problems rep-visual/tools/test-editors.js
git commit -m "Modo interactivo en los ocho problemas de árbol"
```

---

### Task 6: Verificación en el navegador

Ningún test toca el layout real ni un toque de verdad. Esto no se puede automatizar aquí: hay que mirarlo.

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el servidor**

```bash
python -m http.server 8000 --bind 127.0.0.1
```

- [ ] **Step 2: Recorrer el checklist**

Abrir cada URL con **Ctrl+F5** (los `.js` se cachean) y comprobar:

`http://127.0.0.1:8000/problem.html?p=547`
1. El desplegable muestra "✏️ Personalizado" como último caso.
2. Rejilla 5×5, la diagonal en otro color y con un 1.
3. Tocar `(1,3)` marca **también** `(3,1)`. Tocar de nuevo desmarca las dos.
4. Tocar la diagonal no hace nada.
5. Ejecutar anima el conteo de provincias.

`http://127.0.0.1:8000/problem.html?p=103`
6. Al elegir "Personalizado" aparece un campo con `[3,9,20,null,null,15,7]` y el árbol **dibujado** en el escenario.
7. Borrar un carácter para dejar `[3,9,20,null,null,15,` : el campo se pone rojo, la instrucción se sustituye por "Falta cerrar el corchete", **Ejecutar se deshabilita** y el árbol dibujado **no desaparece**.
8. Escribir `[1,x]` : el mensaje nombra el token (`"x" no es un número ni null`).
9. Escribir `[1,2,3,4,5]` : el árbol se redibuja al teclear y Ejecutar se habilita.
10. Ejecutar anima el recorrido en zigzag sobre el árbol que escribiste.
11. "✏️ Editar" devuelve el campo con lo que había.
12. Cambiar ES/EN en modo edición: etiqueta, marcador y mensaje de error cambian de idioma; lo escrito se conserva.
13. Elegir un caso predefinido: la barra del editor desaparece y todo funciona como antes.

`http://127.0.0.1:8000/problem.html?p=79`
14. El campo de la palabra sigue funcionando como antes de la migración.

En DevTools responsive (Ctrl+Shift+M, iPhone SE):
15. El campo ocupa el ancho completo, el botón Ejecutar también, y el árbol cabe.

- [ ] **Step 3: Detener el servidor**

```bash
taskkill //F //IM python.exe
```

---

## Fases 3, 4 y 5 (segundo plan)

Este plan deja probado el editor de texto. Las tres fases restantes se planifican
aparte, cuando exista, porque su forma depende de lo aprendido aquí:

- **Fase 3 — grafos** (207, 210, 261, 323, 1192, 133). Añade
  `VIS.parse.edgeList(text, n)` y `VIS.preview.graph(n, edges)` a `js/editors.js`.
  Tres formatos distintos: `{n, edges}` no dirigidas (261, 323, 1192),
  `{n, prereqs}` dirigidas (207, 210) y `{n, adj}` listas de adyacencia (133).
- **Fase 4 — con parámetros** (105, 236, 863, 1644, 743, 787). Estrena los
  editores de varios campos: árbol + `p` + `q`; aristas + pesos + origen.
- **Fase 5 — listas** (126, 127, 269, 128). `VIS.parse.wordList` y
  `VIS.parse.intList`.

## Notas para el implementador

- **`this` en el descriptor.** `parse`, `previewSpec` y `cycle` usan `this` (el
  tablero fijo de 79, `this.rows` de las rejillas). Llámalos siempre como métodos
  (`ed.parse(...)`), nunca desestructurados.
- **El DOM falso de los tests es permisivo**: `qs()` devuelve un nodo para
  cualquier selector, así que un id mal escrito no lo caza ningún test. Por eso el
  Step 10 de la Task 4 compara a mano los selectores contra el HTML.
- **La vista previa no borra el escenario cuando hay error.** Es deliberado: si se
  borrara a cada tecla, escribir un árbol sería un parpadeo constante.
- **`parse` es la única fuente de verdad.** No añadas un `validate` aparte: la
  razón de fundir las tres funciones era que no pudieran contradecirse.
