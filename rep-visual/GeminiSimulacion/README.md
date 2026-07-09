# Simulaciones de referencia

Prototipos en React/TypeScript generados con Gemini. **No forman parte del
visualizador**: nadie los carga, no se compilan y el sitio no los usa. Están aquí
como referencia de diseño, y los specs los citan por ruta.

## Los que aportaron algo

De los trece, solo cinco hacen editable la entrada. Son los únicos que
influyeron en el diseño del modo interactivo.

| Archivo | Problema | Qué aportó |
|---|---|---|
| `simulaci_n_shortest_path.tsx` | 1091 | La idea entera: dibujar los muros y luego correr el BFS. |
| `simulaci_n_word_search.tsx` | 79 | La solución al caso difícil: el tablero queda **fijo** y lo editable es la **palabra**. Sin esto, editar 79 habría exigido ciclar A→Z a golpe de toques. |
| `simulaci_n_lca_tree.tsx` | 236 | Los parámetros `p` y `q` se eligen de un `<select>` poblado con los nodos que existen, no se escriben. Imposible pedir un nodo inexistente. |
| `simulaci_n_lca_ii.tsx` | 1644 | Lo mismo, y además el caso didáctico de elegir un nodo que **no** está en el árbol. |
| `simulaci_n_distance_k.tsx` | 863 | `target` con `<select>`, `k` con un campo numérico acotado. |

## Los que no

Los ocho restantes —`pacific_atlantic`, `build_tree`, `dijkstra`,
`vuelos_k_stops`, `word_ladder`, `word_ladder_ii`, `alien_dictionary`,
`longest_consecutive_sequence`— son **animaciones de datos fijos**: la estructura
es una constante del archivo y no hay ningún campo editable. Pulsas «Iniciar» y
ves el algoritmo correr.

Eso es exactamente lo que el visualizador ya hacía antes de este trabajo, y con
más: pseudocódigo sincronizado, narración paso a paso y bilingüe. Se conservan
por completitud del expediente, no porque quede nada que incorporar de ellos.

## Qué se tomó y qué no

Del estilo de estos prototipos se adoptó **solo la interactividad**. El tema
claro, los emojis y la terminal de logs se descartaron: el visualizador tiene su
propio tema oscuro y su panel de narración.

El razonamiento completo está en:

- `docs/superpowers/specs/2026-07-08-modo-interactivo-1091-design.md`
- `docs/superpowers/specs/2026-07-08-modo-interactivo-resto-design.md`
- `docs/superpowers/specs/2026-07-08-modo-interactivo-grafos-arboles-design.md`
