# Modo interactivo — piloto en 1091 (Shortest Path in Binary Matrix)

Fecha: 2026-07-08
Estado: aprobado, pendiente de plan de implementación

## Contexto

El visualizador (`rep-visual/`) reproduce algoritmos paso a paso sobre **casos de
entrada predefinidos**. El usuario elige un caso de un desplegable y observa la
animación con play/pausa/paso.

Las simulaciones de Gemini (`rep-visual/GeminiSimulacion/*.tsx`) añaden algo que
el visualizador no tiene: **el usuario construye su propio input** (dibuja las
paredes de un laberinto) y luego corre el algoritmo sobre lo que él creó. Eso es
mucho más didáctico: dejas de mirar y empiezas a experimentar.

Este spec añade ese modo interactivo **conservando todo lo existente**. Piloto en
un solo problema, **1091 Shortest Path in Binary Matrix** — el mismo que Gemini
implementó. Si funciona, se replica al resto de problemas de cuadrícula.

## Objetivo

Que en 1091 el usuario pueda:
1. Elegir un modo "Personalizado" en el selector de casos.
2. Dibujar una cuadrícula 5×5 tocando celdas para alternar muro ↔ libre.
3. Pulsar "Ejecutar" y ver el **mismo** BFS animado que en los casos predefinidos.
4. Volver a "Editar" y correr otra configuración, cuantas veces quiera.

## No objetivos

- No se toca ningún `build()` de los 32 problemas.
- No se cambia el tema oscuro, el bilingüe ni los casos predefinidos.
- Sin tema claro, sin glow, sin emojis (eran otras opciones no elegidas).
- Sin selector de tamaño de cuadrícula ni arrastrar-para-pintar en el piloto
  (posibles extensiones futuras).
- Solo 1091. Los otros 6 de cuadrícula (200, 994, 542, 695, 417, 79) quedan para
  después, reusando el mismo mecanismo.

## Principio de diseño

El motor ya hace `build(input) → pasos` y el resto (play/pausa/paso, pseudocódigo
sincronizado, narración, idioma) trabaja sobre esos pasos. El modo interactivo
**solo cambia de dónde viene `input`**: en vez de un caso fijo, de una cuadrícula
que el usuario editó. Todo lo demás se reutiliza sin cambios.

## Arquitectura

Tres piezas nuevas, cada una con una responsabilidad clara.

### 1. `problem.editor` — descriptor de edición (en `js/problems/1091.js`)

Objeto opcional en el módulo del problema. Si existe, el problema soporta modo
interactivo. Diseñado genérico para replicarlo luego a otros problemas de rejilla.

```js
editor: {
  rows: 5,
  cols: 5,
  // Estado inicial editable: cuadrícula toda libre.
  initial() { return Array.from({length: 5}, () => Array(5).fill(0)); },
  // Clic sobre una celda: alterna su valor. Inicio (0,0) y meta (rows-1,cols-1)
  // son fijos: el toque no los cambia (coincide con "fijos" del hint).
  toggle(v, r, c) {
    if (r === 0 && c === 0) return v;
    if (r === this.rows - 1 && c === this.cols - 1) return v;
    return v === 0 ? 1 : 0;
  },
  // Cómo pintar una celda del editor: reutiliza las clases de celda existentes.
  // Se invoca como método (usa this.rows / this.cols), igual que toggle().
  cellView(v, r, c) {
    if (v === 1) return { v: "", cls: "wall" };
    if (r === 0 && c === 0) return { v: "A", cls: "current" };        // inicio
    if (r === this.rows - 1 && c === this.cols - 1) return { v: "B", cls: "target" }; // meta
    return { v: "", cls: "water" };
  },
  // Convierte lo editado en el input que espera build(). En 1091 build(input)
  // recibe la cuadrícula tal cual.
  toInput(grid) { return grid; },
  hint: {
    es: "Toca una celda para poner o quitar un muro. Inicio (A) y meta (B) fijos. Luego pulsa Ejecutar.",
    en: "Tap a cell to add or remove a wall. Start (A) and goal (B) are fixed. Then press Run.",
  },
}
```

### 2. `VIS.renderers.gridEditor` — cuadrícula editable (en `js/renderers.js`)

Función que dibuja una cuadrícula donde cada celda responde al clic/toque.

- Firma: `VIS.renderers.gridEditor(editState, editor, onToggle)`.
- Reutiliza la clase `.cell` y el `--cell` fluido (funciona igual en móvil).
- Cada celda: `onclick` → `onToggle(r, c)`. El motor actualiza `editState` y
  re-dibuja (re-render completo del editor; 5×5 es trivial).
- No participa en el `stage` de los pasos; es un render aparte que el motor
  coloca en `#stage` durante el modo edición.

### 3. Lógica de modo en `js/engine.js`

Un estado nuevo: el motor está **en edición** o **reproduciendo**.

- `buildCaseSelect()`: si `problem.editor` existe, añade una opción final al
  desplegable con valor centinela `"custom"` y etiqueta "✏️ Personalizado" /
  "✏️ Custom".
- `loadCase(idx)`: si la opción elegida es `"custom"` → `enterEditMode()`; si no,
  comportamiento actual.
- `enterEditMode()`:
  - `this.editState = problem.editor.initial()` (la primera vez; conserva la
    última al re-editar).
  - Dibuja `gridEditor` en `#stage`.
  - Muestra la barra del editor (`#editor-bar`): texto `editor.hint` + botón
    "▶ Ejecutar".
  - Deshabilita prev/next/play/reset (no hay pasos todavía).
- `runCustom()`:
  - `input = problem.editor.toInput(this.editState)`.
  - `this.steps = problem.build(input)` dentro de try/catch (igual que
    `loadCase`); si lanza, un paso de error.
  - Oculta la barra del editor; muestra el botón "✏️ Editar".
  - Reactiva los controles; `this.i = 0; render()`. A partir de aquí es un caso
    normal.
- Botón "✏️ Editar" → `enterEditMode()` conservando `this.editState`.
- `relang()`: si está en modo edición, re-entra a edición para refrescar el texto
  de `hint` y las etiquetas de los botones en el nuevo idioma.

### Flujo de datos

```
usuario toca celda → onToggle(r,c) → editState[r][c] = editor.toggle(...)
                                    → re-render gridEditor
usuario pulsa Ejecutar → editor.toInput(editState) → build(input) → pasos
                       → motor existente (play/pausa/paso, pseudocódigo, narración)
```

## Cambios en la interfaz (`problem.html`)

- Nueva barra `#editor-bar` dentro del panel del escenario, oculta por defecto:
  contiene el texto de instrucción (`#editor-hint`) y el botón `#btn-run`
  ("▶ Ejecutar").
- Botón `#btn-edit` ("✏️ Editar") en la zona de controles, oculto por defecto;
  visible solo tras ejecutar un caso personalizado.
- Cadenas i18n nuevas en `js/i18n.js`: `custom` ("Personalizado"/"Custom"),
  `run` ("▶ Ejecutar"/"▶ Run"), `edit` ("✏️ Editar"/"✏️ Edit").

## Casos límite

- **Inicio y meta**: fijos, no se pueden amurallar (`editor.toggle` los ignora).
  El caso -1 sigue alcanzable amurallando alrededor de la meta.
- **Cuadrícula toda libre**: BFS normal, camino diagonal mínimo.
- **Cambio de idioma en modo edición**: `relang()` re-entra a edición.
- **Volver a un caso predefinido tras editar**: elegir otra opción del desplegable
  llama a `loadCase` normal; el editor se descarta (se recrea al re-elegir
  "Personalizado", conservando `editState` en memoria del motor durante la sesión).
- **Móvil**: el editor usa `--cell` fluido y el `#stage` con scroll; el toque
  dispara `onclick`. Sin cambios extra.

## Verificación

1. **Regresión (automática)**: `node tools/validate-code.js` sigue en
   32 correctos · 0 errores (el editor no toca `build()` ni `code`).
2. **Sintaxis**: `node --check js/engine.js js/renderers.js js/problems/1091.js`.
3. **Manual en navegador** (`problem.html?p=1091`):
   - El desplegable muestra "✏️ Personalizado" como último caso.
   - Al elegirlo: rejilla 5×5 editable, A en (0,0), B en (4,4), instrucción visible,
     controles de reproducción deshabilitados.
   - Tocar celdas alterna muro ↔ libre.
   - "Ejecutar": corre el BFS, se anima con play/pausa/paso, el pseudocódigo se
     resalta como en cualquier caso.
   - "Editar": vuelve a la rejilla con lo que había; re-ejecutar funciona.
   - Amurallar (0,0): al ejecutar, respuesta -1 con su mensaje.
   - Cambiar ES/EN en cada estado mantiene la coherencia.
4. **Móvil** (DevTools responsive o teléfono vía Pages): tocar celdas y ejecutar
   funciona; la rejilla cabe o hace scroll dentro del panel.

## Extensión futura (fuera de este spec)

El `problem.editor` es genérico. Replicar a los otros de cuadrícula es, por
problema: definir `initial`, `toggle` (semántica de celda), `cellView`, `toInput`
y `hint`. Ej.: 200 alterna tierra/agua; 994 cicla vacío→fresca→podrida; 417 sube
alturas. El motor y el render no cambian.
