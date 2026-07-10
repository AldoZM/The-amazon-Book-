# Plan de Implementación — Fase 4b (105, 743, 787)

## Task 1: Parsers base (TDD)
- **Modificar `tools/test-parsers.js`**:
  - Agregar pruebas que fallen para `VIS.parse.numberArray` y `VIS.parse.weightedEdgeList`.
- **Modificar `js/editors.js`**:
  - Implementar `VIS.parse.numberArray`: parsea un arreglo de enteros `[1,2,3]`, rechaza nulls y sintaxis inválida.
  - Implementar `VIS.parse.weightedEdgeList`: parsea arreglos `[[u,v,w], ...]`. Valida que el nodo origen y destino sean números enteros positivos y que no sobrepasen el `maxNodos` (si es aplicable) o que simplemente devuelva las aristas para que la lógica superior las valide. (LeetCode suele usar 1-indexed para 743 y 0-indexed para 787, así que el parser puede simplemente verificar que son enteros sin restar 1 por defecto, o hacerlo según lo que requiera cada problema).
- **Verificación**: Correr `node tools/test-parsers.js` hasta que esté verde.

## Task 2: Editores y Vistas Previas
- **Modificar `105.js`**:
  - Implementar `editor: { kind: "text", fields: [...], initial(), parse(state) }`.
  - El parse debe validar que `preorder` e `inorder` tengan los mismos números y la misma longitud.
- **Modificar `743.js`**:
  - Implementar `editor: { kind: "text", fields: [times, n, k], ... }`.
  - El parse debe convertir `n` y `k` a números y validarlos.
  - El `previewSpec` debe generar el grafo.
- **Modificar `787.js`**:
  - Implementar `editor: { kind: "text", fields: [n, flights, src, dst, K], ... }`.
  - El parse debe convertir `n`, `src`, `dst`, `K` a números y validarlos.
  - El `previewSpec` debe generar el grafo.

## Task 3: Integración y Sabotaje
- **Modificar `tools/test-editors.js`**:
  - Agregar "105", "743", "787" al arreglo `NUMS`.
- **Verificación**: Correr `node tools/test-editors.js` y `node tools/validate-code.js`.
- **Sabotaje**: Romper los `parse` intencionadamente para asegurar que los tests atrapen los fallos.

## Task 4: Commit
- Hacer el git add y commit.
