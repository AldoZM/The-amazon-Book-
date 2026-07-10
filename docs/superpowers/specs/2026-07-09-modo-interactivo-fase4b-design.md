# Modo interactivo — Fase 4b: Estructuras con múltiples parámetros (105, 743, 787)

Fecha: 2026-07-09
Estado: propuesto
Antecede: `2026-07-09-modo-interactivo-grafos-design.md`

## Contexto

Siguiendo el roadmap de `context.txt`, la Fase 4b abarca problemas que no encajan en los editores estándar de "un solo árbol" o "un solo grafo", ya que requieren la entrada simultánea de múltiples parámetros y arreglos/grafos. 

| Problema | Formato de entrada |
|---|---|
| 105 Construct Binary Tree | Dos arreglos de números: `preorder` e `inorder`. |
| 743 Network Delay Time | Grafo dirigido con pesos (`times`), número de nodos (`n`), nodo origen (`k`). |
| 787 Cheapest Flights Within K Stops | Grafo dirigido con pesos (`flights`), nodos (`n`), origen (`src`), destino (`dst`), máximo de paradas (`k`). |

## Objetivo

Implementar un modo interactivo para los problemas 105, 743 y 787. Dado que involucran múltiples parámetros, cada uno utilizará un descriptor de editor de tipo `kind: "text"` con múltiples `fields`. Se crearán los parsers puros necesarios para listas de números y listas de aristas con peso.

## Arquitectura

### 1. Funciones de Parseo (en `js/editors.js`)

Se crearán las siguientes funciones puras, siguiendo la convención de no lanzar excepciones, limitando tamaños y retornando mensajes de error descriptivos.

- `VIS.parse.numberArray(texto, maxNodos)`: 
  Parsea un arreglo de números unidimensional (ej: `[3,9,20,15,7]`). 
  Se usará para los campos `preorder` e `inorder` de 105. Valida que sean números válidos enteros y que la cantidad no exceda `maxNodos`.

- `VIS.parse.weightedEdgeList(texto, maxNodos)`: 
  Parsea arreglos de aristas con pesos (ej: `[[2,1,1], [2,3,1]]`).
  Valida que cada elemento interno sea un arreglo de exactamente 3 números `[origen, destino, peso]`. También verifica que los nodos no excedan los rangos permitidos.

### 2. Implementación en 105 (Construct Binary Tree)

- **Campos**: `preorder` (text), `inorder` (text).
- **Parse**: Llama a `VIS.parse.numberArray` para ambos. Verifica que:
  - Tengan la misma longitud.
  - Tengan exactamente los mismos elementos (al ordenarlos o usar un set).
  - No haya elementos duplicados (LeetCode garantiza valores únicos para este problema).
- **Vista previa**: Dado que el objetivo del algoritmo es *construir* el árbol, no mostramos el árbol construido en la vista previa (sería hacer trampa). Podemos omitir el `previewSpec` o mostrar simplemente un `type: "list"` con los nodos.

### 3. Implementación en 743 y 787 (Grafos con parámetros extra)

- **Campos**:
  - `n` (text): Número total de nodos.
  - `edges` (text): Lista de aristas con peso (`times` en 743, `flights` en 787).
  - Campos adicionales según el caso (`k` en 743; `src`, `dst`, `k` en 787).
- **Parse**: 
  - `n` se parsea como número.
  - Los campos adicionales se parsean como números y se valida que estén dentro de los rangos lógicos (ej. `src` y `dst` entre `0` y `n-1` o `1` y `n` según el problema).
  - Llama a `VIS.parse.weightedEdgeList` y valida que los nodos en las aristas respeten `n`.
- **Vista previa**: 
  - Se puede extender o reutilizar `VIS.preview.graph` pasando los nodos (del `0` al `n-1` o `1` a `n` según el caso) y dibujando las aristas dirigidas. 
  - También podemos pasar un parámetro para resaltar los nodos importantes (como el `src` o el `dst`).

## Siguientes Pasos (una vez aprobado este spec)

1. Crear un plan técnico en `docs/superpowers/plans/` detallando el orden de desarrollo.
2. Implementar los parsers `numberArray` y `weightedEdgeList` usando TDD.
3. Definir los tres objetos `problem.editor` en `105.js`, `743.js` y `787.js`.
4. Añadirlos a `NUMS` en `tools/test-editors.js`.
5. Ejecutar la validación completa y saboteos.
