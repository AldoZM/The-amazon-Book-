# Audiolibro — .md narrables por ejercicio (piloto)

## Contexto

El libro tiene 32 ejercicios LeetCode (20 Grafos + 12 Árboles) con solución en C++ y explicación en español nivel principiante en `capitulos/`. Se agrega una versión audiolibro: un `.md` independiente por ejercicio, escrito desde cero (no copiado del `.tex`), pensado para entenderse solo escuchándolo, con el algoritmo explicado en pseudocódigo narrado en prosa. Piloto de 2 problemas (200, 994) antes de escalar a los 32.

## Ubicación y estructura de archivos

Carpeta `audiolibro/`, espejo de `capitulos/` y `src/`:

```
audiolibro/
  01-grafos/
    200-number-of-islands.md
    994-rotting-oranges.md
  02-arboles/        (se crea al escalar)
```

Mismo slug que `capitulos/<cap>/<slug>.tex` y `src/<cap>/<slug>.cpp`.

## Plantilla de cada .md (6 secciones)

1. Encabezado — número LeetCode, nombre, dificultad.
2. El problema, en palabras simples.
3. La idea central — analogía de vida real, redactada de cero.
4. Cómo funciona el algoritmo, paso a paso — pseudocódigo narrativo (ver abajo).
5. Por qué esta complejidad — tiempo/espacio en prosa llana.
6. Errores comunes / tips de entrevista.

## Pseudocódigo narrativo (estilo nuevo, solo para audio)

Prosa pura: sin indexación (`grid[r][c]`), sin símbolos de comparación/asignación, sin bloques de código. Frases completas con transiciones habladas ("primero...", "luego, por cada...", "cuando esto pasa..."). Deliberadamente más simple que la convención de `rep-visual/js/renderers.js` (esa sí conserva indexación) — el oído no puede "releer" una expresión indexada.

## Herramienta de texto a voz — recomendación

1. **Edge TTS vía Audiobook Maker** (`audiobook-maker.com`) — gratis, sin límite, sin registro. Voces en español: Elvira (femenina), Álvaro (masculino). Lee el guion literal.
2. **ElevenLabs** — si la calidad de Edge TTS no convence. Mejor naturalidad, buen soporte de español, también narra el guion literal. Tier gratuito alcanza para el piloto.
3. **NotebookLM** queda fuera como narrador principal: su "Audio Overview" genera su propia conversación de dos voces sobre el documento, no lee el guion palabra por palabra — puede distorsionar pasos técnicos del pseudocódigo narrado. Solo sirve como resumen conversacional aparte, no como reemplazo.

## Estado

Piloto completo: `audiolibro/01-grafos/200-number-of-islands.md` y `audiolibro/01-grafos/994-rotting-oranges.md` escritos siguiendo la plantilla. Pendiente: el usuario prueba con Edge TTS/Audiobook Maker y decide si escalar a los 32 problemas.
