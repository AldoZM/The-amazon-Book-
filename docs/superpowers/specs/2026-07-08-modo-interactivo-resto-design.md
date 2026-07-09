# Modo interactivo — resto de problemas de cuadrícula

Fecha: 2026-07-08
Estado: aprobado
Antecede: `2026-07-08-modo-interactivo-1091-design.md` (piloto, ya implementado y verificado)

## Contexto

El piloto en 1091 funciona: el usuario dibuja su cuadrícula y el motor reutiliza
`build(input)`. Toca replicarlo a los demás problemas de cuadrícula.

Al inspeccionarlos aparecen **dos hechos que el spec del piloto no anticipó**:

1. **No todos son binarios.** 994 cicla `vacío → fresca → podrida` y 417 cicla
   alturas `1..9`. El método se llama `toggle`, pero su firma
   (`(v, r, c) → v'`) siempre fue "dame el siguiente valor". El nombre miente.

2. **79 (Word Search) no es un editor de rejilla.** Su `build()` recibe
   `{board, word}`: hay un segundo dato que no es la cuadrícula. Y sus celdas
   son letras — ciclar A→Z con toques serían 26 toques por celda.

   La simulación de referencia (`GeminiSimulacion/simulaci_n_word_search.tsx`)
   resuelve esto dejando el **tablero fijo** y haciendo editable **solo la
   palabra**, con un campo de texto. Adoptamos ese enfoque.

## Objetivo

Modo interactivo en los seis problemas restantes de cuadrícula: 200, 695, 542,
994, 417 (rejilla) y 79 (palabra).

## No objetivos

- No se toca ningún `build()`. El motor sigue reutilizándolos tal cual.
- Sin tema claro, sin glow, sin terminal de logs.
- Sin editar el tablero de 79 (solo la palabra), ni el tamaño de las rejillas.

## Cambio 1 — `toggle` pasa a llamarse `cycle`

Renombrar en `problem.editor` y en la única llamada del motor. Motivo: 994 y 417
devuelven el siguiente valor de un ciclo de 3 y de 9 estados, no un booleano.
Un nombre que miente en la plantilla se copia seis veces.

Afecta: `js/engine.js` (una línea), `js/problems/1091.js`, y los tests que lo
nombran. Sin cambio de comportamiento.

## Cambio 2 — `editor.kind`

El descriptor gana un discriminante opcional:

```
kind: "grid" (por defecto) | "word"
```

### `kind: "grid"` — sin cambios respecto al piloto

```js
{ rows, cols, initial(): T[][], cycle(v, r, c): T,
  cellView(v, r, c): {v: string, cls: string},
  toInput(grid): any, hint: {es, en} }
```

`T` es `number` o `string` según el problema: 200 usa `"1"`/`"0"` (strings,
porque su `build()` los compara con `===`), el resto usa números.

### `kind: "word"` — nuevo

```js
{ kind: "word", board: string[][],
  initial(): string,
  sanitize(raw): string,          // mayúsculas, solo A-Z, tope de longitud
  validate(word): boolean,        // opcional; si es falso, Ejecutar no hace nada
  previewSpec(): gridSpec,        // tablero fijo, pintado con VIS.renderers.grid
  toInput(word): any,
  placeholder: {es, en}, hint: {es, en} }
```

El escenario muestra el tablero **de solo lectura** con el pintor `grid` que ya
existe (no hace falta un pintor nuevo). El campo de texto vive en la barra del
editor.

## Cambios en el motor (`js/engine.js`)

- `enterEditMode()` bifurca según `ed.kind || "grid"`:
  - `"grid"`: comportamiento actual (`VIS.renderers.gridEditor` + `redraw`).
  - `"word"`: pinta `VIS.renderers.grid(ed.previewSpec())` en `#stage`, muestra
    `#editor-word` con el valor actual y su `placeholder`, y en cada pulsación
    guarda `ed.sanitize(input.value)` en `editState`.
- La inicialización pasa de `if (!this.editState)` a `if (this.editState == null)`.
  Motivo: la cadena vacía es un `editState` legítimo en modo palabra, y `!""` es
  `true` — el usuario que borra la palabra vería reaparecer la de por defecto.
- `runCustom()`: `if (ed.validate && !ed.validate(this.editState)) return;`
- `hideEditorUI()` oculta también `#editor-word`.

## Cambios en la interfaz

- `problem.html`: `<input id="editor-word">` dentro de `#editor-bar`, oculto por
  defecto.
- `css/styles.css`: estilo del campo, coherente con `.filters input`.
- Sin cadenas i18n nuevas: el `placeholder` y el `hint` salen del descriptor.

## Los seis descriptores

| Problema | `kind` | Celda | `cycle` | Estado inicial |
|---|---|---|---|---|
| 200 | grid | `"1"`/`"0"` | alterna | 5×5 de agua |
| 695 | grid | `1`/`0` | alterna | 5×5 de agua |
| 542 | grid | `0` fuente / `1` por calcular | alterna | 5×5 de unos, una fuente al centro |
| 994 | grid | `0`/`1`/`2` | `(v+1) % 3` | 5×5 de frescas, una podrida en (0,0) |
| 417 | grid | altura `1..9` | `v >= 9 ? 1 : v+1` | las alturas del ejemplo clásico |
| 79 | word | — | — | palabra `"ABCCED"`, tablero fijo 3×4 |

Clases de celda: se reutilizan las que ya usa el `build()` de cada problema
(`land`/`water` en 200 y 695; `fresh`/`water` en 542; `water`/`fresh`/`rotten`
en 994; `water` en 417 y 79), para que el editor y la animación se vean iguales.

## Casos límite

- **542 sin ninguna fuente**: se permite. `build()` deja todas las distancias en
  infinito; es un resultado correcto y didáctico ("sin fuente no hay distancias").
- **994 sin ninguna podrida**: `build()` devuelve `-1` si quedan frescas, o `0`
  si tampoco hay frescas. Ambos son caminos reales del algoritmo.
- **79 con palabra vacía**: `validate` devuelve `false` y Ejecutar no hace nada.
- **79 con palabra que no está**: `build()` la anima hasta agotar los inicios y
  responde "no existe". Es un caso didáctico.
- **Cambio de idioma en modo edición**: `relang()` re-entra a edición; en modo
  palabra debe conservar lo escrito y refrescar `placeholder` y `hint`.

## Verificación

1. `node tools/validate-code.js` → `32 correctos · 0 con errores`.
2. Los tests existentes siguen pasando tras el renombrado.
3. Un test nuevo recorre los seis descriptores: `cycle` avanza como toca,
   `cellView` devuelve las clases esperadas, `toInput` produce el `input` que
   `build()` acepta, y `build(toInput(initial()))` genera pasos sin lanzar.
4. Un test del flujo en modo palabra: `enterEditMode` → escribir → `runCustom`.
5. Checklist manual en el navegador, por problema.
