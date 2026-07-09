# Modo interactivo — árboles con parámetros (236, 1644, 863)

Fecha: 2026-07-09
Estado: aprobado
Antecede: `2026-07-08-modo-interactivo-grafos-arboles-design.md`

## Contexto

Dieciséis problemas ya tienen modo interactivo. Los ocho de árbol reciben un solo
arreglo y se escriben en un campo de texto, con vista previa en vivo.

Estos tres reciben **el árbol y además parámetros**:

| Problema | Entrada |
|---|---|
| 236 Lowest Common Ancestor | `{tree, p, q}` |
| 1644 Lowest Common Ancestor II | `{tree, p, q}` |
| 863 All Nodes Distance K | `{tree, target, k}` |

`p`, `q` y `target` son **valores de nodo**, no ids: `build()` compara con
`nd.val === input.p`.

Las simulaciones de referencia (`GeminiSimulacion/simulaci_n_lca_tree.tsx`,
`simulaci_n_lca_ii.tsx`, `simulaci_n_distance_k.tsx`) resuelven esto con un
`<select>` poblado con los nodos que existen. Adoptamos ese enfoque, con una
diferencia: en ellas el árbol es una constante; aquí lo escribe el usuario, así
que **las opciones dependen de lo que se está tecleando en otro campo**.

## Dos hechos medidos que fijan el diseño

**`863` lanza una excepción si el `target` no existe** en el árbol:
`Cannot read properties of null (reading 'id')`. Un desplegable que solo ofrece
nodos reales no es una comodidad: evita un fallo. Y la regla de reconciliación
(qué pasa cuando editas el árbol y el nodo elegido desaparece) es lo que impide
que quede un `target` huérfano.

**Un `k` sin resultados no es un error.** `863` responde `No hay nodos a
distancia 5. Respuesta [].` Es un caso didáctico legítimo. Por eso `k` va de `0`
al **diámetro del árbol** (la distancia máxima entre dos nodos cualesquiera), y
no a la excentricidad del objetivo: ofrecer un `k` que no da nodos enseña algo.

Medido sobre el árbol por defecto `[3,5,1,6,2,0,8,null,null,7,4]`: altura 4,
diámetro 5. Limitar `k` a `altura - 1 = 3` escondería `k = 4` y `k = 5`, que sí
devuelven nodos.

## Objetivo

Modo interactivo en 236, 1644 y 863: se escribe el árbol, se eligen los
parámetros de un desplegable, y el árbol se dibuja con los nodos elegidos
resaltados.

## No objetivos

- No se toca ningún `build()`.
- No se editan `105`, `743` ni `787` (la otra mitad de la fase 4): sus entradas
  son dos arreglos y grafos con pesos. Otro spec.
- Sin campo numérico libre: `k` también es un desplegable, para no inventar dos
  tipos de campo cuando uno basta.

## Cambio 1 — el tipo de campo `select`

`editor.fields[i]` gana un `type`, con `"text"` por defecto (lo que hay hoy):

```js
fields: [
  { id: "tree", type: "text", label, placeholder },
  { id: "p",    type: "select", label, options(state) },
]
```

- `options(state): [{ value: string, label: string }]` — el campo calcula sus
  propias opciones a partir del estado completo. Parsea el árbol por su cuenta;
  si está roto, devuelve `[]`.
- `editState[id]` sigue siendo **texto** (el `value` de la opción). `parse` lo
  convierte a número.

Es el único tipo nuevo. `k` lo usa igual que `p`.

## Cambio 2 — reconciliación de campos dependientes

Las opciones de `p` dependen del árbol, que está en otro campo. Al teclear, el
nodo elegido puede desaparecer.

En cada pulsación, **antes** de `parse`, el motor reconcilia:

```
para cada campo de tipo select:
    opciones ← field.options(editState)
    si opciones está vacía            → dejar el valor como está
    si el valor actual no está en opciones → tomar el value de la primera opción
```

La primera opción es la raíz del árbol, así que nunca se queda en un estado
inválido y `Ejecutar` sigue habilitado. Es silencioso pero predecible: escribir
un árbol nuevo deja `p` y `q` apuntando a su raíz.

## Cambio 3 — solo se repintan los `select`

`refreshPreview()` recalcula opciones y las vuelca en los `<select>`. **No toca
los `<input type=text>`**: recrearlos en cada tecla mataría el foco del cursor.

Es el mismo motivo por el que la vista previa no borra el escenario cuando la
entrada es inválida.

## Flujo de datos

```
usuario teclea o elige
  └─ editState[id] ← valor
       └─ refreshPreview()
            1. reconciliar los select (Cambio 2) y repintar sus opciones
            2. parse(editState) → {ok, input} | {ok:false, error, field}
            3. ok    → dibujar previewSpec(input); Ejecutar habilitado
               error → campo en rojo, mensaje, Ejecutar deshabilitado,
                       se conserva el último dibujo válido
```

`Ejecutar` → `build(parse(editState).input)`. El motor de siempre.

## Los tres editores

Todos comparten el campo `tree` con `VIS.parse.treeArray(texto, 15)`.

### 236 — `{tree, p, q}`

- `p`, `q`: desplegable con los nodos del árbol, ordenados.
- `parse` devuelve `{ tree: arr, p: Number(state.p), q: Number(state.q) }`.
- Árbol de partida `[3,5,1,6,2,0,8,null,null,7,4]`, `p = 5`, `q = 1` → `LCA = 3`.

### 1644 — `{tree, p, q}`

Igual que 236, **más una opción declarada por el problema**:
`{ value: "99", label: "99 (no existe)" }`, añadida al final de las de `q`.

Es la lección entera de 1644: si uno de los dos nodos no está, la respuesta es
`null`. `build()` lo maneja (`Solo encontramos 1/2. Respuesta null.`).

**La trampa solo se añade si el árbol no contiene un 99.** Si el usuario escribe
un árbol con un nodo 99, ese nodo aparece como opción normal y la trampa se
omite: dos opciones con el mismo `value` serían un desplegable ambiguo, y una
etiqueta «no existe» sobre un nodo que sí existe sería mentira.

La opción extra la declara **el problema**, no el motor.

### 863 — `{tree, target, k}`

- `target`: desplegable con los nodos del árbol. **Nunca una opción inexistente**:
  `build()` lanzaría.
- `k`: desplegable de `0` al **diámetro del árbol**, calculado del árbol parseado.
- `parse` devuelve `{ tree: arr, target: Number(state.target), k: Number(state.k) }`.
- Árbol de partida `[3,5,1,6,2,0,8,null,null,7,4]`, `target = 5`, `k = 2` →
  `[7, 4, 1]`.

## Vista previa

El árbol se dibuja con los nodos elegidos resaltados (clase `target`, la que ya
usa `build()` para lo mismo). Así se ve a quién se busca **antes** de ejecutar.

Se añade a `js/editors.js`:

- `VIS.preview.treeConNodos(arr, resaltados, label)` — como `VIS.preview.tree`,
  pero marca los nodos cuyo valor está en `resaltados`.
- `VIS.arbol.valores(arr): number[]` — los valores del árbol, ordenados.
- `VIS.arbol.diametro(arr): number` — la distancia máxima entre dos nodos.

Son funciones puras, sin DOM.

## Cambios en el motor (`js/engine.js`)

- `paintEditor()`: crea un `<select>` cuando `field.type === "select"`, con
  `id = "editor-field-<id>"` (el mismo esquema que los `<input>`). El `onchange`
  guarda el valor y llama a `refreshPreview()`.
- `refreshPreview()`: antes de `parse`, ejecuta la reconciliación y vuelca las
  opciones nuevas en cada `<select>`. Sigue siendo el único sitio que habilita o
  deshabilita `#btn-run`.
- `hideEditorUI()` no cambia: oculta la barra entera.

## Cambios en la interfaz

- `problem.html`: nada. Los campos los crea el motor dentro de `#editor-fields`.
- `css/styles.css`: `.editor-field select`, con el mismo aspecto que
  `.editor-field input`.

## Casos límite

- **Árbol inválido mientras se teclea** (`[3,5,`): las opciones quedan vacías, los
  `select` conservan su valor, `parse` devuelve el error del árbol y `Ejecutar` se
  deshabilita. El dibujo anterior se conserva.
- **El nodo elegido desaparece al editar**: cae a la raíz (Cambio 2).
- **`k` mayor que las distancias que existen**: se permite. `build()` responde
  `No hay nodos a distancia N. Respuesta [].`
- **`q = 99` en 1644**: se permite, es su caso didáctico. En 236 y 863 no existe
  esa opción.
- **Árbol de un solo nodo** `[7]`: `p = q = 7`, `k` solo ofrece `0`. `build()` lo
  maneja.
- **Cambio de idioma en modo edición**: `relang()` re-entra a `enterEditMode`, que
  repinta etiquetas y opciones. Los valores elegidos se conservan.

## Riesgo conocido

El motor soporta varios campos desde que existe `kind: "text"`, pero **ningún
test lo ha ejercitado con más de uno**: los dieciséis editores actuales tienen un
solo campo. Estos tres son los primeros. Si hay un fallo en ese camino, sale aquí.

## Verificación

1. `node tools/validate-code.js` → `32 correctos · 0 con errores`.
2. Los siete tests existentes siguen pasando.
3. Test de los ayudantes nuevos (`VIS.arbol.valores`, `VIS.arbol.diametro`,
   `VIS.preview.treeConNodos`), incluidos árbol de un nodo y árbol inválido.
4. Test de los tres descriptores: `options` devuelve los nodos correctos, la
   reconciliación cae a la raíz, y **`build(parse(initial()))` produce el
   resultado exacto** (`LCA = 3`, `Respuesta null`, `[7, 4, 1]`), no solo pasos.
5. Test del motor con **varios campos**: teclear el árbol, ver los `select`
   repoblarse, comprobar que el `<input type=text>` **no se recrea** (conserva su
   identidad), y ejecutar.
6. Test de que `863` con un `target` inexistente **lanzaría**, y que el editor lo
   hace imposible.
7. Checklist manual en el navegador.
