# Simulaciones de referencia

Prototipos en React/TypeScript generados con Gemini. **No forman parte del
visualizador**: nadie los carga, no se compilan y el sitio no los usa. Están aquí
como referencia de diseño, y los specs los citan por ruta.

| Archivo | Problema | Qué aportó |
|---|---|---|
| `simulaci_n_shortest_path.tsx` | 1091 | La idea del modo interactivo: dibujar los muros y luego correr el BFS. |
| `simulaci_n_pacific_atlantic.tsx` | 417 | Fases por botón y etiquetas de océano alrededor del mapa. |
| `simulaci_n_word_search.tsx` | 79 | La solución al caso difícil: el tablero queda **fijo** y lo editable es la **palabra**, con un campo de texto. Sin esto, editar 79 habría exigido ciclar A→Z a golpe de toques. |

Lo que se adoptó y lo que no está razonado en:

- `docs/superpowers/specs/2026-07-08-modo-interactivo-1091-design.md`
- `docs/superpowers/specs/2026-07-08-modo-interactivo-resto-design.md`

Del estilo de estos prototipos se tomó **solo la interactividad**. El tema claro,
los emojis y la terminal de logs se descartaron: el visualizador tiene su propio
tema oscuro y su panel de narración.
