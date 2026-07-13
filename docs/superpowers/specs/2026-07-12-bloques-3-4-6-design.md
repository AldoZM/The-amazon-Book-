# Bloques 3, 4 y 6 — Intervalos, Heaps/Top-K, Sliding Window/Stack

## Contexto

El libro tiene 32 problemas completos (Grafos + Árboles), cada uno con C++, capítulo LaTeX, visualizador interactivo (`rep-visual/`) y audiolibro. La hoja de ruta (`capitulos/99-ruta.tex`) ya define bloques futuros por técnica, no por "Arrays" genérico. Esta ronda implementa tres de esos bloques ya anotados:

- **Bloque 3 — Intervalos**: 56 Merge Intervals, 253 Meeting Rooms II, 2402 Meeting Rooms III, 1094 Car Pooling.
- **Bloque 4 — Heaps / Top-K**: 215 Kth Largest Element, 347 Top K Frequent Elements, 973 K Closest Points to Origin, 295 Find Median from Data Stream, 23 Merge k Sorted Lists, 621 Task Scheduler.
- **Bloque 6 — Sliding Window / Stack**: 3 Longest Substring Without Repeating Characters, 76 Minimum Window Substring, 42 Trapping Rain Water, 84 Largest Rectangle in Histogram, 394 Decode String.

15 problemas en total, todos Media/Difícil. Se salta el Bloque 5 (Design) porque no es afín a "arreglos/estructuras lineales" y el Bloque 7 (DP) queda para una ronda propia, según lo acordado con el usuario.

**Decisión de fases**: esta ronda cubre C++ + capítulo LaTeX + audiolibro (Fase 1). El **visualizador interactivo queda diseñado en detalle en este documento pero NO implementado** (Fase 2, sección dedicada abajo) — se implementa en una ronda posterior, por mí o por otra IA, usando este documento como referencia autosuficiente.

---

## FASE 1 — Contenido (esta ronda)

### Estructura de carpetas

Mismo patrón que `01-grafos`/`02-arboles`, con slugs de bloque tomados de la hoja de ruta:

```
capitulos/03-intervalos/          src/03-intervalos/          audiolibro/03-intervalos/
capitulos/04-heaps-topk/           src/04-heaps-topk/           audiolibro/04-heaps-topk/
capitulos/06-sliding-window-stack/ src/06-sliding-window-stack/ audiolibro/06-sliding-window-stack/
```

Se salta el número `05` porque ya está reservado para el futuro Bloque 5 (Design) en la hoja de ruta.

### Lista completa de problemas (slug, dificultad, carpeta)

| # | Título | Dificultad | Carpeta | Slug |
|---|---|---|---|---|
| 56 | Merge Intervals | M | `03-intervalos` | `56-merge-intervals` |
| 253 | Meeting Rooms II | M | `03-intervalos` | `253-meeting-rooms-ii` |
| 2402 | Meeting Rooms III | H | `03-intervalos` | `2402-meeting-rooms-iii` |
| 1094 | Car Pooling | M | `03-intervalos` | `1094-car-pooling` |
| 215 | Kth Largest Element in an Array | M | `04-heaps-topk` | `215-kth-largest-element` |
| 347 | Top K Frequent Elements | M | `04-heaps-topk` | `347-top-k-frequent-elements` |
| 973 | K Closest Points to Origin | M | `04-heaps-topk` | `973-k-closest-points` |
| 295 | Find Median from Data Stream | H | `04-heaps-topk` | `295-find-median-data-stream` |
| 23 | Merge k Sorted Lists | H | `04-heaps-topk` | `23-merge-k-sorted-lists` |
| 621 | Task Scheduler | M | `04-heaps-topk` | `621-task-scheduler` |
| 3 | Longest Substring Without Repeating Characters | M | `06-sliding-window-stack` | `3-longest-substring-without-repeating` |
| 76 | Minimum Window Substring | H | `06-sliding-window-stack` | `76-minimum-window-substring` |
| 42 | Trapping Rain Water | H | `06-sliding-window-stack` | `42-trapping-rain-water` |
| 84 | Largest Rectangle in Histogram | H | `06-sliding-window-stack` | `84-largest-rectangle-histogram` |
| 394 | Decode String | M | `06-sliding-window-stack` | `394-decode-string` |

### Plantilla C++ (`src/<bloque>/<slug>.cpp`)

Reusar el estilo exacto de los 32 existentes (ver `src/01-grafos/743-network-delay-time.cpp` como referencia):
- Bloque de comentario superior con `// ====...`, enunciado resumido, ejemplo trazado a mano, diagrama ASCII del algoritmo en pseudocódigo con comentarios, explicación de por qué funciona, complejidad.
- `class Solution { public: ... };` con el método exacto que pide LeetCode (firma real).
- `int main()` con varios `assert()` cubriendo caso normal, casos límite (arreglo vacío, un solo elemento, etc.) y un caso donde el orden de procesamiento importe, terminando con un `cout` de confirmación.

### Plantilla LaTeX (`capitulos/<bloque>/<slug>.tex`)

Mismo macro `\problema{Título}{núm}{ruta-cpp}{dificultad}` de `macros.tex`, con las 4 secciones estándar del libro (**distintas** del estilo del audiolibro):
1. Enunciado en prosa con `\texttt{}`/`\emph{}`.
2. `\paragraph{La idea, con un ejemplo de la vida real.}` — analogía + ejemplo trazado (puede llevar `\begin{center}...\end{center}` con tabla/diagrama).
3. `\paragraph{Cómo lo resuelve el código, paso a paso.}` — pasos, típicamente `\begin{enumerate}`.
4. `\lstinputlisting{src/<bloque>/<slug>.cpp}`.
5. `\complejidad{tiempo}{espacio}`.
6. `\paragraph{¿Qué significa esa complejidad?}`.
7. `\paragraph{Consejos para la entrevista (Amazon).}`.

Difficulty letter: usar `M` (Media) o `H` (Difícil) — el libro ya tiene inconsistencia menor entre `H` y `D` para "Hard" en problemas viejos; para estos 15 usar `H` de forma consistente.

**Nota de deuda técnica**: el macro `\problema` siempre agrega dos enlaces "Ver animación · local | web" apuntando a `rep-visual/problem.html?p=<núm>`. Para estos 15 problemas, esos enlaces **no van a funcionar** hasta que se implemente la Fase 2 (abajo) — es el mismo estado que cualquier bloque pendiente de la hoja de ruta, no requiere cambio en el macro.

### Integración a `main.tex`

Agregar 3 nuevos `\chapter{}` después del bloque de Árboles y antes de `\include{capitulos/99-ruta}`:

```latex
% ── Bloque 3: Intervalos ──
\chapter{Intervalos}
\include{capitulos/03-intervalos/56-merge-intervals}
\include{capitulos/03-intervalos/253-meeting-rooms-ii}
\include{capitulos/03-intervalos/2402-meeting-rooms-iii}
\include{capitulos/03-intervalos/1094-car-pooling}

% ── Bloque 4: Heaps / Top-K ──
\chapter{Heaps y Top-K}
\include{capitulos/04-heaps-topk/215-kth-largest-element}
\include{capitulos/04-heaps-topk/347-top-k-frequent-elements}
\include{capitulos/04-heaps-topk/973-k-closest-points}
\include{capitulos/04-heaps-topk/295-find-median-data-stream}
\include{capitulos/04-heaps-topk/23-merge-k-sorted-lists}
\include{capitulos/04-heaps-topk/621-task-scheduler}

% ── Bloque 6: Sliding Window / Stack ──
\chapter{Sliding Window y Pilas}
\include{capitulos/06-sliding-window-stack/3-longest-substring-without-repeating}
\include{capitulos/06-sliding-window-stack/76-minimum-window-substring}
\include{capitulos/06-sliding-window-stack/42-trapping-rain-water}
\include{capitulos/06-sliding-window-stack/84-largest-rectangle-histogram}
\include{capitulos/06-sliding-window-stack/394-decode-string}
```

### `capitulos/99-ruta.tex`

Marcar `\checkmark` en los 15 problemas de Bloques 3, 4 y 6 (siguiendo el formato ya usado en Bloques 1 y 2).

### Plantilla audiolibro (`audiolibro/<bloque>/<slug>.md` + `.txt`)

Misma plantilla de 6 secciones ya validada en los 32 problemas existentes (ver `audiolibro/01-grafos/200-number-of-islands.md` como referencia): encabezado, "El problema en palabras simples", "La idea central", "Cómo funciona el algoritmo paso a paso" (pseudocódigo narrativo en prosa, sin símbolos ni indexación), "Por qué esta complejidad", "Errores comunes y tips de entrevista". Contenido redactado desde cero, no traducido del `.tex`. Misma convención de terminología (algoritmos en inglés canónico con glosa en primera mención — `min-heap`, `max-heap`, `sliding window`, `two pointers`; estructuras en español — `pila`, `cola`, `arreglo`).

`.txt` = misma redacción sin símbolos markdown, listo para TTS.

### Generación de audio

Reusar `audiolibro/generar-audios.py` (recorre todos los `.txt` nuevos automáticamente) y extender `audiolibro/unir-capitulos.py` con 3 nuevas entradas en `CAPITULOS` (una por bloque nuevo), usando el orden de `main.tex` como `ORDEN_*`.

### Ejecución sugerida (Fase 1)

Repartir los 15 problemas en 3 agentes en paralelo (uno por bloque), cada uno produciendo `.cpp` + `.tex` + `.md` + `.txt` de sus problemas siguiendo las plantillas de referencia exactas. Después: integración manual a `main.tex`/`99-ruta.tex`, generación de audio, commit.

---

## FASE 2 — Visualizador interactivo (diseño detallado, NO implementado en esta ronda)

Esta sección documenta la arquitectura de `rep-visual/` con el detalle suficiente para que cualquiera (yo en otra sesión, u otra IA) pueda implementar el modo interactivo de estos 15 problemas sin tener que redescubrir el sistema.

### 7.1 Arquitectura general (ya existente, no cambia)

```
rep-visual/
├── index.html          catálogo — lee window.MANIFEST (js/manifest.js), NO carga engine.js
├── problem.html         shell genérico del reproductor, usado por TODOS los problemas via ?p=<num>
├── js/
│   ├── i18n.js           VIS.pick/VIS.t/VIS.code/VIS.pickCode
│   ├── manifest.js        window.MANIFEST — solo lo usa index.html para las tarjetas del catálogo
│   ├── renderers.js        VIS.renderers.* — pintores puros DOM (grid, graph/tree, queue/stack/list, vars, code)
│   ├── editors.js          VIS.parse.*, VIS.preview.*, helpers de modo edición
│   ├── engine.js           VIS.Engine + VIS.boot — inyecta <script src="js/problems/<num>.js"> dinámicamente
│   └── problems/<num>.js   un módulo IIFE por problema, se auto-registra en window.PROBLEMS[num]
└── tools/                 scripts de validación con Node (sin framework, sin CI wired)
```

**Punto clave**: `problem.html?p=<num>` NO lee ningún registro central — `VIS.boot()` en `engine.js` simplemente inyecta `<script src="js/problems/<num>.js">` y espera que ese archivo exista y se auto-registre en `window.PROBLEMS[num]`. Por eso un problema nuevo funciona por URL directa aunque no esté en `manifest.js`; el manifest solo controla si aparece como tarjeta en el catálogo (`index.html`).

### 7.2 Contrato de módulo por problema

Cada `rep-visual/js/problems/<num>.js`:

```js
(function () {
  const P = window.PROBLEMS || (window.PROBLEMS = {});
  const L = (es, en) => ({ es, en });
  const C = VIS.code([
    ["anclaUno", "primera línea en prosa", "first line in prose"],
    ["anclaDos", "segunda línea", "second line"],
    // ...
  ]);
  const A = C.L; // A.anclaUno, A.anclaDos -> índices de línea

  P["<num>"] = {
    num: <num>, slug: "<slug>", title: "<Título LeetCode>",
    difficulty: "M" | "H",
    block: "<id-de-bloque-nuevo>",       // ver 7.4, debe existir en MANIFEST.blocks
    tags: [...],
    summary: L("resumen es", "summary en"),
    legend: [ { cls: "...", label: L(...) }, ... ],   // opcional
    code: C,
    cases: [ { name: L("caso 1", "case 1"), input: <shape que espera build()> }, ... ],
    editor: { ... },                      // opcional, ver 7.5
    build(input) {
      const steps = [];
      const snap = (note, line, extra) => steps.push({ note, line, ...extra });
      // ... correr el algoritmo real, llamando snap() en cada momento relevante ...
      return steps;
    },
  };
})();
```

Cada **step** debe tener `line` (índice o arreglo de índices en `code.es`/`code.en`, vía anclas `A.xxx`) y `note` (texto narrado, puede incluir `<b>`). El resto de las llaves (`grid`, `graph`/`tree`, `queue`/`stack`/`list`, `vars`, o `stage` como escape hatch) las ensambla `autoStage()` en `engine.js` automáticamente si están presentes.

### 7.3 Qué renderer usar para cada uno de los 15 problemas

Renderers que YA EXISTEN y no requieren tocar `engine.js`/`renderers.js`:
- `VIS.renderers.list`/`stack`/`queue` (los tres son la misma función `renderDS`): fila de casillas horizontales (o columna invertida para `stack`), cada item acepta `{v, cls}` — soporta colorear por índice via `cls`, ya usado así por el problema 128 (Longest Consecutive Sequence) para simular un arreglo/conjunto.
- `VIS.renderers.tree`/`graph`: SVG de nodos+aristas, reusable para representar un heap como árbol binario (constuir `{id,val,left,right}` sintético a partir de índices `2i+1`/`2i+2`, igual patrón que `VIS.treeFromArray`).
- `VIS.renderers.vars`: chips de variables/contadores, casi todos los problemas lo usan.

Renderer NUEVO recomendado (no existe todavía, sí se necesita):
- `VIS.renderers.array` — arreglo 1D con índices visibles debajo de cada celda, resaltado de un rango contiguo (`windowRange: [l, r]`) y marcadores de puntero flotantes (`markers: [{index, label, cls}]`, ej. "L"/"R"). Spec: `{ label, items:[{v,cls}], indices:true, windowRange:[l,r], markers:[...] }`. Necesario para Sliding Window/Two Pointers (3, 76) y útil para mostrar arreglos con índices en general (215, 973, 621).
- `VIS.renderers.bars` — histograma de barras verticales por altura, con resaltado de barra activa y (para 42) niveles de agua acumulada. Spec: `{ label, items:[{h, cls}], waterLevel?:[...] }`. Necesario para 42 (Trapping Rain Water) y 84 (Largest Rectangle in Histogram).

**Ninguno de estos dos requiere cambios en `engine.js`** gracias al escape hatch `step.stage: [{type:"array", ...}]` — `autoStage()` devuelve `step.stage` tal cual si está presente y `render()` despacha genéricamente por `type`. Solo si se quiere el azúcar sintáctico `step.array = {...}` (en vez de `step.stage=[{type:"array",...}]` siempre) hace falta una línea extra en `autoStage()` de `engine.js` por cada key nueva.

Mapeo problema → renderer:

| Problema | Renderer(s) | Notas |
|---|---|---|
| 56 Merge Intervals | `array` nuevo (o `list` simple con `cls` por solape) | items = intervalos como texto `"[a,b]"` |
| 253 Meeting Rooms II | `array`/`list` (intervalos) + `list` (heap de fin de reuniones) | heap mostrado como lista ordenada, no árbol |
| 2402 Meeting Rooms III | igual que 253, dos heaps (salas libres, salas ocupadas) | dos `list` lado a lado, o `vars` para conteos |
| 1094 Car Pooling | `array` nuevo con arreglo de diferencias (`diff[]`) por posición | patrón de "barrido" (sweep line) |
| 215 Kth Largest Element | `array`/`list` mostrando el heap de tamaño k | opcional: `tree` si se quiere vista de árbol binario |
| 347 Top K Frequent Elements | `vars` (mapa frecuencia) + `list` (buckets o heap) | |
| 973 K Closest Points to Origin | `list` (heap de puntos) + `vars` (distancias) | |
| 295 Find Median from Data Stream | dos `list` (max-heap izquierda, min-heap derecha) | |
| 23 Merge k Sorted Lists | `list` por cada lista enlazada + `list`/`tree` para el heap de cabezas | reusar patrón de listas múltiples como en problemas de grafos con `grids` |
| 621 Task Scheduler | `list` (heap de conteos) + `queue` (cooldown) | |
| 3 Longest Substring | `array` nuevo con `windowRange`+`markers` (L/R) | caso de uso principal del renderer nuevo |
| 76 Minimum Window Substring | `array` nuevo con `windowRange`+`markers` | igual que 3, más `vars` para conteo de faltantes |
| 42 Trapping Rain Water | `bars` nuevo | mostrar `waterLevel` acumulada por columna |
| 84 Largest Rectangle in Histogram | `bars` nuevo + `stack` (índices en la pila) | primer uso real del renderer `stack`, ya definido pero sin usar |
| 394 Decode String | `stack` (existente, sin uso hasta ahora) | pila de cadenas parciales/multiplicadores |

### 7.4 Registro en el catálogo (`rep-visual/js/manifest.js`)

Agregar un bloque nuevo por cada capítulo (o uno solo si se prefiere agrupar visualmente, a decidir en la implementación):

```js
blocks: [
  { id: "grafos",  title: { es: "Bloque 1 · Grafos",  en: "Block 1 · Graphs" } },
  { id: "arboles", title: { es: "Bloque 2 · Árboles", en: "Block 2 · Trees" } },
  { id: "intervalos", title: { es: "Bloque 3 · Intervalos", en: "Block 3 · Intervals" } },
  { id: "heaps-topk", title: { es: "Bloque 4 · Heaps y Top-K", en: "Block 4 · Heaps & Top-K" } },
  { id: "sliding-window-stack", title: { es: "Bloque 6 · Sliding Window y Pilas", en: "Block 6 · Sliding Window & Stacks" } },
],
```

Y una entrada por problema en `MANIFEST.problems`, mismo shape que las existentes:

```js
{ num: 56, title: "Merge Intervals", dif: "M", block: "intervalos", tags: ["sort", "intervals"], ready: true },
```

Usar `ready: false` mientras un problema está a medio implementar, para que el catálogo lo muestre como "próximamente" sin romper nada.

### 7.5 Modo editor (interactivo, opcional por problema)

Sistema ya genérico, no requiere cambios de núcleo. Dos sabores en `editor.kind`:

- **`kind:"text"`** (el relevante aquí — nada de `gridEditor`, que es solo para cuadrículas): uno o más campos de texto/select, con `parse(state)` y `previewSpec(input)`.
- Parsers reutilizables ya existentes en `js/editors.js`:
  - `VIS.parse.numberArray(text, maxNodes)` — ya usado por 128.js, sirve tal cual para 215, 347, 973, 621, 3, 76, 42, 84 (cualquier problema de entrada = arreglo de números).
  - `VIS.parse.edgeList(text)` — parsea `"[[a,b],[c,d]]"`; reinterpretado (o clonado con otro nombre, ej. `VIS.parse.intervalList`) sirve directo para 56, 253, 2402, 1094 (arreglos de intervalos).
  - Para 394 (Decode String) y 76 (Minimum Window Substring), el input es una cadena simple — un campo `type:"text"` sin parser especial, solo `sanitize` para longitud máxima.
- `previewSpec(input)` debe devolver `{type, ...spec}` acorde a la tabla de la sección 7.3 (ej. `{type:"array", items: arr.map(v=>({v,cls:""})), indices:true}`).

Ejemplo mínimo para un problema de arreglo simple (siguiendo el patrón ya usado por 128.js):

```js
editor: {
  kind: "text",
  fields: [{ id: "nums", type: "text", label: L("Arreglo", "Array"), placeholder: "[3,1,4,1,5]" }],
  initial() { return { nums: "[3,1,4,1,5]" }; },
  parse(state) {
    const r = VIS.parse.numberArray(state.nums, 50);
    if (!r.ok) return { ok: false, field: "nums", error: r.error };
    return { ok: true, input: r.arr };
  },
  previewSpec(input) {
    return { type: "array", items: input.map(v => ({ v, cls: "" })), indices: true };
  },
  hint: L("Escribe un arreglo de enteros", "Type an integer array"),
}
```

### 7.6 Cambios de código necesarios en la Fase 2

Resumen de todo lo que SÍ requiere tocar archivos existentes (todo lo demás es solo agregar archivos nuevos):

1. `rep-visual/js/renderers.js` — agregar `VIS.renderers.array` y `VIS.renderers.bars` (funciones puras spec→DOM, nuevas).
2. `rep-visual/css/styles.css` — clases nuevas para `.arr .item` (con índice debajo), `.arr .item.window`, `.arr .marker`, `.bars .bar`, `.bars .bar.water`.
3. `rep-visual/js/editors.js` — opcional: `VIS.parse.intervalList` (clon de `edgeList` con otro nombre) y `VIS.preview.array` (helper compartido, no estrictamente necesario ya que cada problema puede definir su `previewSpec` inline como hace 128.js).
4. `rep-visual/js/manifest.js` — 3 bloques nuevos + 15 entradas de problema (sección 7.4).
5. `rep-visual/js/engine.js` — **opcional**, una línea en `autoStage()` por cada key nueva (`step.array`/`step.bars`) si se quiere el azúcar sintáctico; si no, cada `build()` simplemente usa `step.stage:[{type:"array",...}]` sin tocar este archivo.
6. 15 archivos nuevos `rep-visual/js/problems/<num>.js` (uno por problema, contrato de la sección 7.2).
7. `macros.tex`, `main.tex`, `capitulos/*.tex` — sin cambios (los enlaces "Ver animación" ya apuntan al patrón correcto, solo hay que crear los archivos JS para que dejen de estar rotos).

### 7.7 Checklist de pruebas para la Fase 2 (`rep-visual/tools/`, ejecutar con `node` desde `rep-visual/`)

1. `node tools/validate-code.js <num>` por cada problema nuevo — detecta automáticamente el archivo (no requiere lista manual), valida que `code.es`/`code.en` tengan el mismo número de líneas, que cada `step.line` sea válido, sin anclas duplicadas.
2. Si el problema tiene `editor`: agregar su número (como string) al arreglo `NUMS` hardcodeado en `tools/test-editors.js`, luego correr `node tools/test-editors.js`.
3. Si se agregan parsers/preview helpers nuevos en `editors.js`: extender `tools/test-parsers.js` con casos para ellos.
4. Si se agregan renderers nuevos (`array`, `bars`): no existe test análogo a `test-grid-editor.js` para renderers no-grid — considerar crear `tools/test-array-renderer.js`/`tools/test-bars-renderer.js` siguiendo el mismo patrón de DOM falso, aunque ningún mecanismo obliga a esto (no hay CI configurado en el repo, son scripts de desarrollo).
5. Verificación manual en navegador: abrir `rep-visual/problem.html?p=<num>` para cada uno de los 15, probar play/pause/next/prev, cambiar de caso, y si tiene editor, probar el modo "✏️ Personalizado".

---

## Estado

Fase 1 (contenido): pendiente de implementar tras aprobación de este spec.
Fase 2 (visualizador): diseñada en detalle arriba, NO implementada — queda como trabajo futuro documentado para retomar sin research adicional.
