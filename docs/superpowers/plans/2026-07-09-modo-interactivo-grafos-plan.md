# Modo interactivo en Grafos (Fase 3) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el modo interactivo para los 6 problemas de grafos (207, 210, 261, 323, 1192, 133) usando una fábrica común `VIS.graphEditor` y parsers específicos según la forma de entrada, con validaciones estrictas y vista previa interactiva.

**Architecture:** El motor usará funciones puras de parseo en `js/editors.js` que no lanzarán excepciones sino que devolverán objetos de error detallados si el grafo está malformado o si un nodo no existe (basado en `n`). Se agrega una función `VIS.preview.graph` que renderiza el grafo para la vista previa y una fábrica `VIS.graphEditor` para no duplicar código en los problemas de grafos.

**Tech Stack:** JavaScript vanilla, `window.VIS`.

## Global Constraints

- Sin dependencias nuevas ni frameworks.
- Todo texto visible va en `{es, en}`.
- No tocar la lógica principal de `build()` en los problemas.
- Sabotear tests para verificar que realmente fallan.
- Regla 15: Mensajes de commit y documentación en español, sin firma de IA.
- `node tools/validate-code.js` debe dar verde tras cada task.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `js/editors.js` | Funciones puras de parseo (`VIS.parse.edgeList`, etc.), `VIS.preview.graph`, y la fábrica `VIS.graphEditor`. |
| `js/problems/{207,210,261,323,1192,133}.js` | Uso de `VIS.graphEditor` en cada descriptor. |
| `tools/test-graph-editors.js` (o `test-editors.js`) | Pruebas de los parsers y fábrica. |

---

### Task 1: Parsers de grafos (`edgeList`, `prereqList`, `adjList`)

Funciones puras en `js/editors.js` para transformar cadenas de texto en objetos de configuración y validarlos.

- [ ] **Step 1: Escribir pruebas que fallan para los parsers**
Añadir a `tools/test-parsers.js` casos para:
- `VIS.parse.edgeList("[[0,1]]", 5)` -> ok.
- `VIS.parse.edgeList("[[0,99]]", 5)` -> error de nodo inexistente.
- `VIS.parse.prereqList("[[1,0]]", 5)` -> formato adecuado para 207 y 210.
- `VIS.parse.adjList("[[2],[1]]", 5)` -> formato de lista de adyacencia (problema 133).

- [ ] **Step 2: Ejecutar y verificar que falla**
Debería lanzar error porque los métodos no existen.

- [ ] **Step 3: Implementar los parsers**
Implementar en `js/editors.js` (dentro del objeto `VIS.parse` o equivalente) las lógicas puras. Asegurarse de retornar `{ok: false, error: {es, en}, field}` cuando haya fallos en el array, nodos fuera del rango `[0, n-1]`, o formato incorrecto.

- [ ] **Step 4: Ejecutar pruebas y verificar éxito**
Validar con `node tools/test-parsers.js`.

- [ ] **Step 5: Commit**
`git add ...` y `git commit -m "Parsers puros para listas de grafos y adyacencia"`

---

### Task 2: Vista previa de grafo y `VIS.graphEditor`

Crear el generador visual y la fábrica para no duplicar lógica de campos en los 6 problemas.

- [ ] **Step 1: Escribir la prueba que falla**
En `tools/test-editors.js`, crear una aserción que intente invocar a `VIS.graphEditor` y a `VIS.preview.graph` con un grafo simple.

- [ ] **Step 2: Verificar fallo**
Correr `node tools/test-editors.js` -> `TypeError`.

- [ ] **Step 3: Implementar `VIS.preview.graph`**
En `js/editors.js`, crear `VIS.preview.graph({n, edges, directed, adj})` apoyándose en las rutinas visuales que ya existan en `renderers.js` (probablemente adaptando la topología de los grafos estáticos al preview interactivo).

- [ ] **Step 4: Implementar `VIS.graphEditor`**
Añadir la fábrica en `js/editors.js` que reciba `({ id, defaultN, defaultInput, parser, directed })`, retorne `fields` (`n` y `graph`), `initial()`, `parse(state)`, y `previewSpec(input)`.

- [ ] **Step 5: Verificar que la prueba pasa**
Ejecutar `node tools/test-editors.js`.

- [ ] **Step 6: Commit**
`git commit -m "Fábrica VIS.graphEditor y vista previa de grafos interactiva"`

---

### Task 3: Integración en los 6 problemas

- [ ] **Step 1: Problemas 207 y 210**
Asignar `problem.editor = VIS.graphEditor(...)` en `js/problems/207.js` y `210.js` usando `VIS.parse.prereqList` y `directed: true`.

- [ ] **Step 2: Problemas 261, 323, 1192**
Asignar `problem.editor` en `261.js`, `323.js`, `1192.js` usando `VIS.parse.edgeList` y `directed: false`.

- [ ] **Step 3: Problema 133**
Asignar `problem.editor` en `133.js` usando `VIS.parse.adjList` y `directed: false`.

- [ ] **Step 4: Verificación global**
Correr `node tools/validate-code.js` y todos los tests (`node tools/test-editors.js` etc.). Garantizar que `32 correctos · 0 con errores`.

- [ ] **Step 5: Sabotaje de prueba**
Probar temporalmente introducir un bug sutil en `VIS.graphEditor` o un parser (por ejemplo, omitir la validación de rango de nodos) y confirmar que algún test captura el error. Restaurar el código.

- [ ] **Step 6: Commit**
`git commit -m "Modo interactivo en 207, 210, 261, 323, 1192 y 133"`

---

### Task 4: Actualización de .superpowers/sdd/progress.md

- [ ] **Step 1: Modificar archivo**
Documentar que la fase 3 (Grafos) fue implementada siguiendo TDD y las especificaciones.
- [ ] **Step 2: Commit**
`git commit -m "docs: actualizar progreso tras fase de grafos"`
