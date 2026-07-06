# The Amazon Book — Diseño

Fecha: 2026-07-05
Repo: https://github.com/AldoZM/The-amazon-Book-
Ruta local: D:\Codigo Abierto\AmazonEjercicios

## Objetivo

Libro LaTeX (PDF) de ejercicios LeetCode resueltos, enfocado en preguntas
frecuentes de entrevistas Amazon (Med-Hard). Prosa en español, código C++.
Cada encabezado de problema en el PDF es clickeable y abre el archivo `.cpp`
correspondiente en VS Code. El código se explica para todo público.

## Principio central: fuente única de verdad

El código vive **solo** en archivos `.cpp`. El libro LaTeX lo incluye con
`\lstinputlisting`. No hay copias duplicadas del código: se edita el `.cpp`,
se recompila, el libro refleja el cambio. El encabezado del problema enlaza
con `vscode://file/...` al mismo `.cpp`.

## Estructura del repositorio

```
The-amazon-Book-/
├── main.tex                 # documento maestro (\include por capítulo)
├── preambulo.tex            # paquetes, colores, estilo listings C++, hyperref
├── macros.tex               # \problema{titulo}{numLC}{rutaRelativaCpp}{dificultad}
├── build.ps1                # detecta raíz repo, genera paths.tex, compila
├── paths.tex                # GENERADO por build.ps1 (\repopath) — gitignored
├── capitulos/
│   ├── 00-intro.tex
│   └── 01-grafos/
│       ├── 200-number-of-islands.tex
│       └── 994-rotting-oranges.tex
├── src/
│   └── 01-grafos/
│       ├── 200-number-of-islands.cpp
│       └── 994-rotting-oranges.cpp
├── docs/superpowers/specs/  # este spec
├── .gitignore
└── LICENSE
```

Numeración de capítulos por bloque temático:
`01-grafos`, `02-arboles`, `03-intervalos`, `04-heaps`, `05-design`,
`06-sliding-stack`, `07-dp`. Solo `01-grafos` tiene contenido en la entrega 1.

## Enlace vscode:// portable

El problema: `vscode://file/` requiere ruta **absoluta**, que cambia entre
máquinas al clonar el repo en distinta ubicación.

Solución: `build.ps1` obtiene la raíz del repo con
`git rev-parse --show-toplevel`, normaliza separadores a `/`, y escribe:

```latex
\def\repopath{D:/Codigo Abierto/AmazonEjercicios}
```

en `paths.tex`. La macro `\problema` construye el enlace:

```latex
\href{vscode://file/\repopath/src/01-grafos/200-number-of-islands.cpp}{...}
```

`paths.tex` está en `.gitignore` (es específico de cada máquina). Al clonar
en otra computadora, correr `build.ps1` regenera rutas correctas sin editar
nada. Requiere lector PDF que permita URIs externos (SumatraPDF, Chrome,
Edge, navegadores). Adobe puede pedir confirmación al primer click.

## Formato del archivo `.cpp`

Compilable y ejecutable: `g++ -std=c++17 archivo.cpp -o out && ./out`.
Estructura fija:

1. Bloque de comentario con enunciado resumido en español.
2. Diagrama ASCII del ejemplo (grid, árbol, cola BFS según aplique).
3. Idea/enfoque y complejidad temporal/espacial.
4. `class Solution { ... }` comentada línea por línea, en lenguaje accesible.
5. `int main()` con casos de prueba usando `assert`, imprimiendo resultados.

## Formato del capítulo `.tex`

Cada `.tex` de problema, en orden:

1. Encabezado clickeable vía `\problema` (abre el `.cpp` en VS Code) con
   número LeetCode, título y etiqueta de dificultad (M/H).
2. Enunciado e intuición en prosa clara, para todo público.
3. Diagrama visual: TikZ cuando aporta, o el mismo ASCII en verbatim.
4. `\lstinputlisting` del `.cpp` con resaltado de sintaxis C++.
5. Análisis de complejidad.
6. Notas de entrevista Amazon (casos borde, variantes reportadas).

## Sistema de compilación

- `build.ps1`: `git rev-parse` → genera `paths.tex` → corre
  `latexmk -xelatex -interaction=nonstopmode main.tex`.
- MiKTeX ya instalado (pdflatex/xelatex/lualatex/latexmk presentes).
- xelatex para buen soporte de acentos español y fuentes.
- `main.tex` usa `\include` por capítulo para agregar problemas fácilmente.

## Índice de problemas

`main.tex` genera tabla de contenido con los 60+ problemas objetivo listados
por bloque, marcando cuáles están resueltos. En la entrega 1 solo 2 tienen
capítulo real; el resto aparece como pendiente en una lista/tabla de ruta.

## Entrega 1 (alcance de esta iteración)

Andamiaje completo funcionando de punta a punta más 2 problemas molde:

- **200. Number of Islands** (M) — DFS/BFS en grid.
- **994. Rotting Oranges** (M) — BFS multi-fuente con casos borde.

Ambos del Bloque 1 (Grafos/Grid). Sirven de plantilla para replicar el resto
bloque por bloque en iteraciones siguientes.

## Fuera de alcance (entrega 1)

- Los otros ~58 problemas (iteraciones futuras, bloque por bloque).
- Diagramas TikZ complejos más allá de lo necesario para los 2 problemas.
- CI/compilación automática en GitHub Actions.

## Lista completa de problemas objetivo (ruta futura)

Bloque 1 Grafos: 200*, 994*, 695, 542, 1091, 417, 79, 207*, 210, 269, 127,
126, 261, 323, 128, 547, 743, 787, 133, 1192.
Bloque 2 Árboles: 236, 1644, 103, 199, 987, 124, 543, 863, 98, 105, 337, 297.
Bloque 3 Intervalos: 56, 253, 2402, 1094.
Bloque 4 Heaps/Top-K: 215, 347, 973, 295, 23, 621.
Bloque 5 Design: 146, 348, 642.
Bloque 6 Sliding/Stack: 3, 76, 42, 84, 394.
Bloque 7 DP: 322, 139, 55, 5.

(* = incluido en entrega 1)
