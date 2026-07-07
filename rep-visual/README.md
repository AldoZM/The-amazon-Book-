# Visualizador de algoritmos — The Amazon Book

Visualizaciones interactivas paso a paso de los 32 problemas de LeetCode del libro
(20 de Grafos + 12 de Árboles). HTML + CSS + JavaScript **sin dependencias ni build**:
se abre con doble clic (protocolo `file://`).

**Bilingüe ES/EN:** switch en la barra superior. Recuerda tu elección (localStorage) y
traduce todo: interfaz, resumen, pseudocódigo, narración paso a paso, leyendas y etiquetas.
Se puede forzar con `?lang=en` en la URL. Al añadir problemas nuevos, usa objetos
`{ es, en }` en `summary`, `code`, `legend.label`, `cases.name`, `note` y las etiquetas
de panel (`label`). Helper sugerido dentro del módulo: `const L = (es, en) => ({ es, en });`.

## Cómo usar

1. Abre `index.html` con doble clic. Verás las tarjetas de los problemas por bloque.
2. Haz clic en un problema → se abre `problem.html?p=NUM`.
3. Controles: **▶ Reproducir**, **Siguiente/Anterior**, **Reiniciar**, velocidad,
   y un selector de casos de entrada. Atajos: `←` `→` cambian de paso, `espacio` reproduce.

## Estructura

```
rep-visual/
├── index.html            # portada con las tarjetas
├── problem.html          # página genérica de un problema (?p=NUM)
├── css/styles.css        # tema oscuro
└── js/
    ├── manifest.js       # lista de problemas (num, título, dificultad, ready)
    ├── renderers.js      # pintores: grid, grafo, árbol, cola/pila/lista, código
    ├── engine.js         # reproductor (play/pausa/paso/velocidad)
    └── problems/NUM.js    # un módulo por problema: código + casos + build(input)
```

## Añadir un problema nuevo

1. Crea `js/problems/NUM.js` con la forma:
   ```js
   window.PROBLEMS["NUM"] = {
     num, slug, title, difficulty, block, tags, summary,
     code: [...],        // líneas de pseudocódigo (se resaltan por índice)
     cases: [{ name, input }],
     legend: [{ cls, label }],
     build(input) { /* devuelve [ { line, note, grid|graph|tree|queue|... , vars } ] */ }
   };
   ```
2. Marca `ready: true` en `js/manifest.js`.

Cada paso (`step`) puede llevar: `grid`/`grids`, `graph`, `tree`, `queue`, `stack`,
`list`, `vars`, y `line` (índice de código) + `note` (narración). El motor los pinta
automáticamente. Helpers útiles en `VIS`: `treeFromArray`, `binaryLayout`, `circleLayout`.
