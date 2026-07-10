# Plan de Implementación: Fase 5 (Modo Interactivo)

**Objetivo:** Añadir editores interactivos a los problemas de arreglos de cadenas y secuencias numéricas (126, 127, 269 y 128) siguiendo estrictamente TDD, tal como se define en el documento de diseño.

## Paso 1: Pruebas para `stringArray`
1. Modificar `tools/test-parsers.js` añadiendo una suite para `VIS.parse.stringArray`.
2. Incluir pruebas que verifiquen:
   - Formato válido con comillas dobles y simples.
   - Eliminación de comillas y espacios (`trim`).
   - Rechazo de más de 15 elementos.
   - Rechazo de corchetes asimétricos o arreglos inválidos.
3. Correr `node tools/test-parsers.js` y confirmar que fallan (TDD).

## Paso 2: Implementar `stringArray`
1. Escribir `VIS.parse.stringArray` en `js/editors.js` cumpliendo con las condiciones.
2. Correr `test-parsers.js` y lograr el verde.

## Paso 3: Pruebas para Editores (126, 127, 269, 128)
1. Modificar `tools/test-editors.js` añadiendo los ID a la variable `NUMS`.
2. Agregar aserciones específicas de sabotaje en `test-editors.js`:
   - **126 / 127**: Arreglo de palabras donde una palabra tenga longitud distinta a `begin`.
   - **269**: Arreglo con elementos vacíos.
   - **128**: Arreglo que excede el límite numérico o contiene elementos inválidos.
3. Correr `test-editors.js` y verificar que los tests fallan.

## Paso 4: Implementar Editores
1. **128.js**: Configurar `editor` con un único campo numérico y `previewSpec` de tipo `list`.
2. **269.js**: Configurar `editor` con arreglo de cadenas y `previewSpec` de tipo `list`.
3. **126.js y 127.js**: Configurar `editor` con 3 campos (`begin`, `end`, `words`), usando `stringArray`.
4. En 126 y 127, configurar `previewSpec` de tipo `graph` deduciendo aristas a partir de la distancia (diferencia de 1 carácter) entre cada par de palabras.

## Paso 5: Verificación Final
1. Ejecutar `node tools/test-editors.js` y verificar 0 fallos.
2. Ejecutar `node tools/validate-code.js` para asegurar que ningún script haya sido roto.
3. Confirmar funcionalidad de los 4 archivos actualizados, enviar cambios por Git y dar por concluida la Fase 5.
