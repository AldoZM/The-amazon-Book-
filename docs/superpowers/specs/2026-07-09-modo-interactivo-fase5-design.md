# Diseño de Implementación: Fase 5 (Modo Interactivo)

## Problemas Cubiertos
Esta fase cubre los problemas basados en arreglos de cadenas (palabras) y arreglos numéricos planos.
- **126. Word Ladder II** (Grafo implícito de palabras)
- **127. Word Ladder** (Grafo implícito de palabras)
- **269. Alien Dictionary** (Deducción de alfabeto alienígena)
- **128. Longest Consecutive Sequence** (Búsqueda en conjunto numérico)

---

## 1. Parsers Genéricos

### `VIS.parse.stringArray`
Para procesar las listas de palabras de 126, 127 y 269 (ej. `["hot","dot","dog"]`).
**Flujo y Validación:**
1. Remueve espacios al inicio y fin. Comprueba balanceo de corchetes `[` y `]`.
2. Divide el interior por comas.
3. Para cada token, le aplica `trim()` y remueve las comillas dobles o simples perimetrales si las tiene.
4. Devuelve `{ok: true, arr: [...]}`.
5. Emite error si excede el número máximo de elementos configurado (ej. 15 palabras para evitar saturar el Layout).

*(Nota: El problema 128 reusará `VIS.parse.numberArray` creado exitosamente en la fase 4b).*

---

## 2. Editores Interactivos por Problema

### A. Word Ladder (126 y 127)
Ambos comparten la misma estructura topológica y de entrada.
- **Campos**:
  - `begin`: Tipo `text` (una palabra, sin comillas).
  - `end`: Tipo `text` (una palabra, sin comillas).
  - `words`: Tipo `text` (arreglo de palabras como `["hot","dot","dog"]`).
- **Validaciones en `parse()`**:
  - `begin`, `end` y cada elemento de `words` deben tener exactamente la misma longitud.
- **Vista Previa (`previewSpec`)**:
  - En lugar de una simple lista, expondremos el **grafo implícito**. 
  - Usaremos `VIS.circleLayout` donde los nodos son `begin` y las palabras de `words`.
  - Calcularemos allí mismo las aristas: si dos palabras difieren en **exactamente una letra**, se añade una arista al preview. ¡Esto dará a la vista previa un enorme valor didáctico!

### B. Alien Dictionary (269)
- **Campos**:
  - `words`: Tipo `text` (arreglo de palabras alienígenas, ej. `["wrt","wrf","er","ett","rftt"]`).
- **Validaciones en `parse()`**:
  - Uso de `stringArray`. Si bien el problema tradicional usa caracteres alfabéticos, un simple chequeo de que no hay espacios sirve.
- **Vista Previa (`previewSpec`)**:
  - `type: "list"` que muestra las palabras ingresadas. Construir el grafo de caracteres desde la vista previa opacaría la explicación progresiva del algoritmo, por lo tanto, una lista basta.

### C. Longest Consecutive Sequence (128)
- **Campos**:
  - `nums`: Tipo `text` (ej. `[100,4,200,1,3,2]`).
- **Validaciones en `parse()`**:
  - Uso de `numberArray` (hasta 15 elementos).
- **Vista Previa (`previewSpec`)**:
  - `type: "list"` mostrando los números del arreglo, tal y como fueron insertados.

---

## 3. Plan de Pruebas (TDD)
En `test-parsers.js`:
- Crear pruebas para `VIS.parse.stringArray` (asegurando limpieza de comillas y límite de elementos).

En `test-editors.js`:
- Añadir sección de la Fase 5 con pruebas que fallen para:
  - 126/127: Longitudes de palabras asimétricas.
  - 128: Rechazo por elementos mal formados o más de los permitidos.
  - Ejecutar tests (fallarán), implementar `stringArray` y editores, y confirmar el verde en `validate-code.js`.
