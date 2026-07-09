# Modo interactivo — grafos, árboles y el resto

Fecha: 2026-07-08
Estado: aprobado
Antecede: `2026-07-08-modo-interactivo-1091-design.md` (piloto) y
`2026-07-08-modo-interactivo-resto-design.md` (los 7 de cuadrícula)

## Contexto

Los 7 problemas de cuadrícula ya tienen modo interactivo: el usuario construye la
entrada y el motor la pasa al `build(input)` de siempre. Faltan los 25 restantes:
grafos, árboles y unos cuantos que no son ni una cosa ni otra.

La intuición inicial —"hace falta un lienzo para dibujar nodos y aristas"— es
errónea y cara. **La entrada natural de estos problemas ya es texto**: un árbol
se escribe `[3,9,20,null,null,15,7]` (la notación de LeetCode) y un grafo, como
lista de aristas. Escribirlos es más rápido que dibujarlos, funciona en móvil sin
gestos, y es exactamente la notación que el lector verá en LeetCode.

Eso convierte el trabajo en una **generalización del editor de texto** que ya
existe para 79 (Word Search), no en una funcionalidad nueva.

Además, `547` (Number of Provinces) recibe una **matriz de adyacencia** `n×n` de
ceros y unos: encaja en el editor de rejilla que ya funciona.

## Objetivo

Modo interactivo en los 25 problemas restantes.

## No objetivos

- No se toca ningún `build()`.
- Sin lienzo de nodos y aristas, sin arrastrar, sin tema claro.
- Sin editar el tamaño de las rejillas.

## Las cinco familias

| Fase | Familia | Problemas | Entrada |
|---|---|---|---|
| 1 | Nueva firma de `cycle` + matriz de adyacencia | 547 | rejilla `n×n` de 0/1 |
| 2 | Editor de texto + árbol de un arreglo | 98, 103, 124, 199, 297, 337, 543, 987 | `[3,9,20,null,null,15,7]` |
| 3 | Grafo | 207, 210, 261, 323, 1192, 133 | `n` + aristas (133: listas de adyacencia) |
| 4 | Con parámetros | 105, 236, 863, 1644, 743, 787 | árbol/grafo + `p`, `q`, `k`, pesos |
| 5 | Listas | 126, 127, 269, 128 | palabras o números |

La fase 1 incluye el cambio de firma de `cycle` (Cambio 1), porque `547` no se
puede escribir sin él. La fase 2 incluye la generalización a `kind: "text"`
(Cambio 2) y la vista previa (Cambio 3), porque los árboles son su primer uso
real con varios problemas.

Cada fase termina con los tests en verde antes de empezar la siguiente. Si el
editor de texto falla, se descubre en la fase 2, no con 25 archivos tocados.

Ojo con la fase 3: los seis problemas no comparten forma de entrada.
`261`, `323` y `1192` reciben `{n, edges}` con aristas no dirigidas; `207` y
`210` reciben `{n, prereqs}` con parejas dirigidas; `133` recibe `{n, adj}`,
listas de adyacencia. Cada uno lleva su propio `parse`; lo que comparten es el
mecanismo, no el formato.

## Cambio 1 — `cycle` recibe la cuadrícula, no la celda

Hoy: `cycle(v, r, c) → v'`. Devuelve **una** celda.

`547` es una matriz de adyacencia **simétrica**: tocar `(i,j)` obliga a tocar
`(j,i)`, y la diagonal vale siempre 1 (toda ciudad está conectada consigo misma).
Una función que solo devuelve una celda no puede expresarlo.

Nueva firma: `cycle(grid, r, c) → grid`. El caso simple sigue siendo una línea:

```js
cycle(g, r, c) { g[r][c] = g[r][c] === 0 ? 1 : 0; return g; }
```

y el de 547 también se escribe honestamente:

```js
cycle(g, r, c) {
  if (r === c) return g;                 // la diagonal no se toca
  const v = g[r][c] === 0 ? 1 : 0;
  g[r][c] = v; g[c][r] = v;              // simétrica, siempre
  return g;
}
```

Afecta a los 7 editores de rejilla existentes, a la llamada del motor y a los
tests. Es mecánico y los tests lo cazan. Sin este cambio, `547` podría dibujar
una matriz asimétrica, que el libro dice explícitamente que no existe.

## Cambio 2 — `kind: "word"` se generaliza a `kind: "text"`

Hoy 79 usa `sanitize` + `validate` + `toInput` + `previewSpec()`: tres funciones
que pueden contradecirse entre sí. Se funden en **un solo `parse`**.

```js
editor: {
  kind: "text",
  fields: [
    { id: "tree", label: {es,en}, placeholder: {es,en}, sanitize?(raw): string },
    { id: "p",    label: {es,en}, placeholder: {es,en} },
  ],
  initial(): { [fieldId]: string },              // el estado es un objeto de textos
  parse(state): { ok: true, input: any }
              | { ok: false, error: {es,en}, field?: fieldId },
  previewSpec(input): { type: "tree"|"graph"|"grid", ...spec },
  hint: {es,en},
}
```

- `editState` pasa a ser un objeto `{fieldId: texto}`.
- `sanitize` por campo es opcional y solo reescribe lo tecleado (79 pasa a
  mayúsculas). La validación **no** vive ahí: vive en `parse`.
- `parse` es la única fuente de verdad: o devuelve el `input` que `build()` acepta,
  o devuelve el error que se le muestra al usuario.

79 migra a esta forma con un solo campo. Su `parse` devuelve
`{board: <tablero fijo>, word}`; su `previewSpec` sigue pintando el tablero. La
migración obliga a actualizar `tools/test-word-flow.js`, que hoy busca el campo
por el id `#editor-word`; pasará a buscarlo dentro de `#editor-fields`.

`kind: "word"` desaparece. Dejar los dos sería mantener dos caminos casi iguales
en el motor.

## Cambio 3 — vista previa en vivo

En cada pulsación:

```
sanitize por campo → parse(editState)
  ├── ok    → pinta previewSpec(input) en #stage
  │           la instrucción vuelve a su color normal
  │           Ejecutar habilitado
  └── error → el campo señalado (`field`) se marca en rojo
              el mensaje sustituye a la instrucción
              Ejecutar deshabilitado
              se conserva el último dibujo válido (o el escenario vacío)
```

`Ejecutar` llama a `build(parse(editState).input)`.

La vista previa es barata porque los ayudantes ya existen:

```js
// árbol
const root = VIS.treeFromArray(arr);
const layout = VIS.binaryLayout(root);
return { type: "tree", label: …, r: 18, nodes: layout.nodes, edges: layout.edges };

// grafo
const pos = VIS.circleLayout(n, 160, 150, Math.min(120, 40 + n * 12));
return { type: "graph", label: …, r: 20, nodes: …, edges: … };
```

El motor despacha con `VIS.renderers[spec.type](spec)`.

## Cambios en el motor (`js/engine.js`)

- `paintEditor()`:
  - `kind "grid"`: como hoy, salvo la nueva firma de `cycle`.
  - `kind "text"`: pinta un campo por cada `fields[i]` dentro de `#editor-fields`,
    engancha `oninput` → `sanitize` → `refreshPreview()`.
- `refreshPreview()` (nuevo): corre `parse`, y según el resultado pinta la vista
  previa o el error. Es el único sitio que decide si Ejecutar está habilitado.
- `runCustom()`: `const r = ed.parse(this.editState); if (!r.ok) return;` y
  `build(r.input)`.
- `hideEditorUI()` sigue haciendo lo de hoy: ocultar `#editor-bar` entero. No hace
  falta limpiar los campos, porque `paintEditor()` los reconstruye desde
  `editState` cada vez que se entra a editar.
- `relang()` en modo edición ya re-entra a `enterEditMode`, que repinta etiquetas,
  marcadores de posición y el mensaje de error en el idioma nuevo.

## Cambios en la interfaz

- `problem.html`: `#editor-word` se sustituye por `#editor-fields` (contenedor
  vacío; el motor crea los campos). Se conserva `#editor-hint` y `#btn-run`.
- `css/styles.css`: `.editor-field` (etiqueta + campo), `.editor-field input.invalid`
  (borde rojo), `.editor-hint.error` (texto en rojo).
- Sin cadenas i18n nuevas: etiquetas, marcadores y errores salen del descriptor.

## Errores que `parse` debe reconocer

Bilingües, concretos, y señalando el campo.

**Árbol** (`[3,9,20,null,null,15,7]`):
- corchete sin cerrar; token que no es número ni `null`; arreglo vacío;
- raíz `null` con más elementos detrás;
- más de 31 nodos (el dibujo deja de caber).

**Grafo** (`n` + `0-1, 1-2`):
- `n` no es un entero entre 1 y 12;
- pareja mal formada (`0-`, `1-2-3`);
- arista que menciona un nodo `>= n` — el mensaje dice cuál y cuántos hay;
- bucle `2-2` en los problemas donde no tiene sentido.

**Listas** (126, 127, 269, 128):
- lista vacía; palabras de largos distintos donde el problema lo exige (127, 126);
- números repetidos o no enteros (128).

En todos los casos el mensaje dice **qué** está mal, no solo que algo lo está.

## Casos límite

- **Campo vacío**: `parse` devuelve error; Ejecutar deshabilitado. No es un fallo,
  es el estado inicial de alguien que borró todo.
- **Entrada válida pero degenerada** (árbol de un nodo, grafo sin aristas): se
  permite. Son casos didácticos; `build()` los maneja.
- **Cambio de idioma con un error en pantalla**: el mensaje se repinta traducido.
- **Vista previa con entrada inválida**: se conserva el último dibujo válido. No
  se borra el escenario a cada tecla, que sería un parpadeo molesto.
- **Móvil**: los campos ocupan el ancho completo bajo los 600px, como el botón.

## Verificación

1. `node tools/validate-code.js` → `32 correctos · 0 con errores`, en cada fase.
2. Los tests existentes siguen pasando tras el cambio de firma de `cycle`.
3. Un test por familia que, para cada problema:
   - `parse(initial())` devuelve `ok`, y `build(input)` genera pasos;
   - las entradas inválidas de la lista de arriba devuelven `ok: false` con el
     campo señalado;
   - `previewSpec` devuelve un `type` que `VIS.renderers` sabe pintar.
4. Un test del flujo en el motor: escribir → vista previa → error → corregir →
   Ejecutar.
5. Como en `test-editors.js`, las aserciones comprueban el **resultado** de
   `build()`, no solo que genere pasos: un `parse` que devuelve la forma
   equivocada no siempre lanza.
6. Checklist manual en el navegador, por fase.
