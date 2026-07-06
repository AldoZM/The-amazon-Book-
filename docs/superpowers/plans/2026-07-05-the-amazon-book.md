# The Amazon Book — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el andamiaje de un libro LaTeX de ejercicios LeetCode (enfoque Amazon) con enlaces `vscode://` desde cada encabezado al `.cpp`, más 2 problemas molde resueltos.

**Architecture:** El código C++ vive solo en `src/`; el libro lo incluye con `\lstinputlisting` (fuente única de verdad). `build.ps1` inyecta la ruta absoluta del repo en `paths.tex` para que los enlaces `vscode://file/...` funcionen en cualquier máquina. `main.tex` agrega capítulos vía `\include`.

**Tech Stack:** XeLaTeX (MiKTeX), latexmk, paquetes `hyperref`/`listings`/`fontspec`/`xcolor`; C++17 (g++); PowerShell para build.

## Global Constraints

- Prosa del libro en **español**; código C++ estándar con comentarios en español.
- Código C++ compilable con `g++ -std=c++17` y ejecutable (main con `assert`).
- Sin duplicar código: el libro usa `\lstinputlisting` del `.cpp` real.
- Rutas de enlace: `\href{vscode://file/\repopath/<ruta-rel>}{...}`.
- `paths.tex` es generado y va en `.gitignore` (específico por máquina).
- Commits en español, **sin** firma ni Co-Authored-By de IA.
- Compilar con `build.ps1` (usa `latexmk -xelatex -interaction=nonstopmode`).

---

### Task 1: Andamiaje del libro (compila vacío con enlaces)

**Files:**
- Create: `.gitignore`
- Create: `paths.tex.example`
- Create: `preambulo.tex`
- Create: `macros.tex`
- Create: `main.tex`
- Create: `capitulos/00-intro.tex`
- Create: `build.ps1`

**Interfaces:**
- Produces: macro `\problema{titulo}{numLC}{rutaRelCpp}{dificultad}` — encabezado clickeable que abre el `.cpp` en VS Code y lo agrega al TOC.
- Produces: macro `\repopath` (definida en `paths.tex`, con fallback a `.`).
- Produces: `build.ps1` que genera `paths.tex` y compila `main.pdf`.

- [ ] **Step 1: Crear `.gitignore`**

```gitignore
# LaTeX build
*.aux
*.log
*.out
*.toc
*.fls
*.fdb_latexmk
*.synctex.gz
*.pdf
# Ruta específica de máquina (generada por build.ps1)
paths.tex
# C++ binarios
src/**/out
src/**/*.exe
a.out
```

- [ ] **Step 2: Crear `paths.tex.example` (plantilla versionada de referencia)**

```latex
% Este archivo lo GENERA build.ps1 como paths.tex (no editar paths.tex a mano).
% Ejemplo del contenido esperado:
\def\repopath{D:/Codigo Abierto/AmazonEjercicios}
```

- [ ] **Step 3: Crear `preambulo.tex`**

```latex
\usepackage{fontspec}
\usepackage{polyglossia}
\setmainlanguage{spanish}
\usepackage{xcolor}
\usepackage[colorlinks=true,linkcolor=azulLC,urlcolor=azulLC,
            allbordercolors={1 1 1}]{hyperref}
\usepackage{listings}
\usepackage{geometry}
\geometry{margin=2.5cm}

% Colores
\definecolor{azulLC}{HTML}{1F6FEB}
\definecolor{fondoCodigo}{HTML}{F6F8FA}
\definecolor{comentario}{HTML}{6A737D}
\definecolor{palabraClave}{HTML}{D73A49}
\definecolor{cadena}{HTML}{032F62}

% Estilo de listado C++
\lstdefinestyle{cpp}{
  language=C++,
  backgroundcolor=\color{fondoCodigo},
  basicstyle=\ttfamily\small,
  keywordstyle=\color{palabraClave}\bfseries,
  commentstyle=\color{comentario}\itshape,
  stringstyle=\color{cadena},
  numbers=left,
  numberstyle=\tiny\color{comentario},
  numbersep=8pt,
  showstringspaces=false,
  breaklines=true,
  frame=single,
  rulecolor=\color{comentario},
  tabsize=2,
  extendedchars=true,
  literate=%
    {á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1
    {ñ}{{\~n}}1 {Á}{{\'A}}1 {É}{{\'E}}1 {Í}{{\'I}}1 {Ó}{{\'O}}1
    {Ú}{{\'U}}1 {Ñ}{{\~N}}1 {¿}{{?`}}1 {¡}{{!`}}1
}
\lstset{style=cpp}
```

- [ ] **Step 4: Crear `macros.tex`**

```latex
% \problema{titulo}{numLC}{rutaRelativaCpp}{dificultad}
\newcommand{\problema}[4]{%
  \clearpage
  \phantomsection
  \addcontentsline{toc}{section}{#2. #1 \textnormal{(#4)}}%
  \section*{\href{vscode://file/\repopath/#3}{#2.\ #1}%
    \hfill\normalsize\textnormal{(#4)}}%
}

% Etiqueta de complejidad
\newcommand{\complejidad}[2]{%
  \par\medskip\noindent\textbf{Complejidad:} tiempo #1, espacio #2.\par
}
```

- [ ] **Step 5: Crear `capitulos/00-intro.tex`**

```latex
\chapter*{Introducción}
\addcontentsline{toc}{chapter}{Introducción}

Este libro reúne ejercicios de LeetCode frecuentes en entrevistas de Amazon,
resueltos en C++ y explicados para todo público. Cada encabezado de problema
es un enlace: al hacer clic se abre el archivo \texttt{.cpp} correspondiente
en Visual Studio Code, donde el código es compilable y trae casos de prueba.

\paragraph{Cómo compilar.} Ejecuta \texttt{build.ps1} en PowerShell. El script
detecta la ruta del repositorio e inyecta las rutas de los enlaces, luego
compila con \texttt{latexmk -xelatex}.
```

- [ ] **Step 6: Crear `main.tex`**

```latex
\documentclass[11pt,oneside]{book}
\input{preambulo}
\input{macros}
% Ruta del repo (generada por build.ps1); fallback a ruta relativa
\InputIfFileExists{paths.tex}{}{\def\repopath{.}}

\title{The Amazon Book\\\large Ejercicios LeetCode para entrevistas}
\author{Aldo Zetina}
\date{\today}

\begin{document}
\maketitle
\tableofcontents

\include{capitulos/00-intro}

% ── Bloque 1: Grafos ──
\chapter{Grafos}
% (los problemas se agregan aquí con \include)

\end{document}
```

- [ ] **Step 7: Crear `build.ps1`**

```powershell
#!/usr/bin/env pwsh
# Detecta la raíz del repo, genera paths.tex con la ruta absoluta y compila.
$ErrorActionPreference = "Stop"
$root = (git rev-parse --show-toplevel).Trim()
# git ya devuelve separadores '/'; asegurar formato para vscode://file/
$root = $root -replace '\\', '/'
Set-Content -Path "paths.tex" -Value "\def\repopath{$root}" -Encoding utf8
Write-Host "paths.tex -> \repopath{$root}"
latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex
Write-Host "Listo: main.pdf"
```

- [ ] **Step 8: Compilar y verificar el andamiaje**

Run: `pwsh -File build.ps1` (o `powershell -ExecutionPolicy Bypass -File build.ps1`)
Expected: genera `paths.tex`, compila sin error, produce `main.pdf` con portada, TOC e Introducción. Sin secciones de problema aún.

- [ ] **Step 9: Commit**

```bash
git add .gitignore paths.tex.example preambulo.tex macros.tex main.tex capitulos/00-intro.tex build.ps1
git commit -m "feat: andamiaje del libro con build.ps1 y enlaces vscode"
```

---

### Task 2: `src/01-grafos/200-number-of-islands.cpp`

**Files:**
- Create: `src/01-grafos/200-number-of-islands.cpp`

**Interfaces:**
- Produces: `class Solution { int numIslands(vector<vector<char>>& grid); }` consumido por el `.tex` vía `\lstinputlisting`.

- [ ] **Step 1: Escribir el `.cpp` compilable con pruebas**

```cpp
// ============================================================================
// 200. Number of Islands  (Medium)
// ----------------------------------------------------------------------------
// Dada una cuadrícula de '1' (tierra) y '0' (agua), cuenta cuántas islas hay.
// Una isla se forma conectando tierras adyacentes en horizontal o vertical
// (no en diagonal). Los bordes de la cuadrícula son todos agua.
//
// Ejemplo:
//   grid =
//     1 1 0 0 0          Aquí hay 3 islas:
//     1 1 0 0 0            - bloque 2x2 arriba-izquierda
//     0 0 1 0 0            - celda central
//     0 0 0 1 1            - bloque de 2 abajo-derecha
//
// Diagrama de la exploración DFS desde una celda de tierra:
//
//        (r-1,c)
//           |
//   (r,c-1)-(r,c)-(r,c+1)      Visitamos las 4 vecinas; cada tierra
//           |                  visitada la marcamos como '0' (hundida)
//        (r+1,c)               para no contarla otra vez.
//
// Idea: recorremos la cuadrícula. Cuando encontramos un '1' no visitado,
// sumamos una isla y "hundimos" (marcamos como agua) toda su tierra conectada
// con DFS. Así cada isla se cuenta exactamente una vez.
//
// Complejidad: tiempo O(m*n) (cada celda se visita una vez),
//              espacio O(m*n) peor caso por la pila de recursión.
// ============================================================================
#include <vector>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;
        int m = grid.size(), n = grid[0].size();
        int islas = 0;
        for (int r = 0; r < m; ++r) {
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == '1') {   // tierra sin visitar => nueva isla
                    ++islas;
                    hundir(grid, r, c, m, n);
                }
            }
        }
        return islas;
    }

private:
    // Marca como agua toda la tierra conectada a (r,c).
    void hundir(vector<vector<char>>& grid, int r, int c, int m, int n) {
        if (r < 0 || r >= m || c < 0 || c >= n) return;  // fuera de límites
        if (grid[r][c] != '1') return;                    // agua o ya visitada
        grid[r][c] = '0';                                 // hundir esta celda
        hundir(grid, r - 1, c, m, n);   // arriba
        hundir(grid, r + 1, c, m, n);   // abajo
        hundir(grid, r, c - 1, m, n);   // izquierda
        hundir(grid, r, c + 1, m, n);   // derecha
    }
};

int main() {
    Solution s;

    vector<vector<char>> g1 = {
        {'1','1','0','0','0'},
        {'1','1','0','0','0'},
        {'0','0','1','0','0'},
        {'0','0','0','1','1'},
    };
    assert(s.numIslands(g1) == 3);

    vector<vector<char>> g2 = {
        {'1','1','1','1','0'},
        {'1','1','0','1','0'},
        {'1','1','0','0','0'},
        {'0','0','0','0','0'},
    };
    assert(s.numIslands(g2) == 1);

    vector<vector<char>> g3 = {{'0','0'},{'0','0'}};
    assert(s.numIslands(g3) == 0);

    vector<vector<char>> vacio = {};
    assert(s.numIslands(vacio) == 0);

    cout << "200 Number of Islands: todas las pruebas pasaron.\n";
    return 0;
}
```

- [ ] **Step 2: Compilar y ejecutar**

Run:
```bash
g++ -std=c++17 "src/01-grafos/200-number-of-islands.cpp" -o "src/01-grafos/out" && "src/01-grafos/out"
```
Expected: `200 Number of Islands: todas las pruebas pasaron.` (código de salida 0).

- [ ] **Step 3: Commit**

```bash
git add src/01-grafos/200-number-of-islands.cpp
git commit -m "feat: solución 200 Number of Islands en C++"
```

---

### Task 3: Capítulo `200` en el libro (enlace + listado)

**Files:**
- Create: `capitulos/01-grafos/200-number-of-islands.tex`
- Modify: `main.tex` (agregar `\include` bajo el capítulo Grafos)

**Interfaces:**
- Consumes: `\problema` (Task 1), `src/01-grafos/200-number-of-islands.cpp` (Task 2).

- [ ] **Step 1: Crear `capitulos/01-grafos/200-number-of-islands.tex`**

```latex
\problema{Number of Islands}{200}{src/01-grafos/200-number-of-islands.cpp}{M}

Nos dan una cuadrícula de caracteres donde \texttt{'1'} es tierra y
\texttt{'0'} es agua. Una \emph{isla} es un grupo de tierras conectadas en
horizontal o vertical. Queremos contar cuántas islas hay.

\paragraph{Intuición.} Imagina que sobrevuelas el mapa. Cada vez que ves un
pedazo de tierra que aún no has pisado, plantas una bandera (una isla nueva)
y luego caminas por toda la tierra conectada hundiéndola en el mapa, para no
volver a contarla. Repites hasta que no quede tierra nueva.

\begin{center}
\ttfamily
\begin{tabular}{ccccc}
1 & 1 & 0 & 0 & 0\\
1 & 1 & 0 & 0 & 0\\
0 & 0 & 1 & 0 & 0\\
0 & 0 & 0 & 1 & 1\\
\end{tabular}
\end{center}

\noindent En esta cuadrícula hay \textbf{3} islas: el bloque $2\times2$ de
arriba a la izquierda, la celda central, y el par de abajo a la derecha.

\paragraph{Solución.} Recorremos la cuadrícula; al encontrar tierra nueva
sumamos una isla y usamos DFS (\texttt{hundir}) para marcar como agua toda su
tierra conectada. El código completo (abre el archivo con clic en el título):

\lstinputlisting{src/01-grafos/200-number-of-islands.cpp}

\complejidad{$O(m\cdot n)$}{$O(m\cdot n)$}

\paragraph{Notas de entrevista (Amazon).} Es el clásico de Amazon. Menciona
que modificar la cuadrícula in situ evita el arreglo \texttt{visited}; si no
puedes mutar la entrada, usa un conjunto de visitados o BFS con cola. Casos
borde: cuadrícula vacía, toda agua, toda tierra (una isla).
```

- [ ] **Step 2: Enlazar el capítulo en `main.tex`**

Reemplazar la línea comentada bajo `\chapter{Grafos}`:

```latex
\chapter{Grafos}
\include{capitulos/01-grafos/200-number-of-islands}
```

- [ ] **Step 3: Compilar el libro**

Run: `pwsh -File build.ps1`
Expected: `main.pdf` compila sin error; aparece la sección "200. Number of Islands (M)" con el listado C++ y el título como enlace.

- [ ] **Step 4: Verificar que el enlace vscode:// está en el PDF**

Run:
```bash
grep -a "vscode://file" main.pdf | head -1 || pdftotext main.pdf - 2>/dev/null | grep -i "number of islands"
```
Expected: se detecta la URI `vscode://file/.../200-number-of-islands.cpp` (o el título en el texto extraído).

- [ ] **Step 5: Commit**

```bash
git add capitulos/01-grafos/200-number-of-islands.tex main.tex
git commit -m "feat: capítulo 200 Number of Islands con enlace al .cpp"
```

---

### Task 4: `src/01-grafos/994-rotting-oranges.cpp`

**Files:**
- Create: `src/01-grafos/994-rotting-oranges.cpp`

**Interfaces:**
- Produces: `class Solution { int orangesRotting(vector<vector<int>>& grid); }`.

- [ ] **Step 1: Escribir el `.cpp` compilable con pruebas**

```cpp
// ============================================================================
// 994. Rotting Oranges  (Medium)
// ----------------------------------------------------------------------------
// Cuadrícula con valores: 0 = vacío, 1 = naranja fresca, 2 = naranja podrida.
// Cada minuto, toda naranja fresca adyacente (4 direcciones) a una podrida
// se pudre. Devuelve los minutos hasta que ninguna naranja quede fresca, o
// -1 si es imposible (queda alguna fresca aislada).
//
// Ejemplo:
//   minuto 0        minuto 1        minuto 2
//     2 1 1           2 2 1           2 2 2
//     1 1 0    =>     2 1 0    =>     2 2 0
//     0 1 1           0 1 1           0 2 1   ... hasta minuto 4
//
// Diagrama del BFS multi-fuente (todas las podridas empiezan en la cola):
//
//   cola inicial: [todas las (r,c) con valor 2]
//   por cada nivel (minuto): sacamos la capa actual y pudrimos vecinas
//   frescas, que entran al siguiente nivel. El número de niveles-1 = minutos.
//
// Idea: BFS por niveles desde TODAS las podridas a la vez (multi-fuente).
// Contamos cuántas frescas hay; cada vez que pudrimos una, la restamos.
// Si al final quedan frescas => -1. Si no había frescas al inicio => 0.
//
// Complejidad: tiempo O(m*n), espacio O(m*n) por la cola.
// ============================================================================
#include <vector>
#include <queue>
#include <cassert>
#include <iostream>
using namespace std;

class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        queue<pair<int,int>> cola;   // naranjas podridas (fuentes del BFS)
        int frescas = 0;
        for (int r = 0; r < m; ++r)
            for (int c = 0; c < n; ++c) {
                if (grid[r][c] == 2) cola.push({r, c});
                else if (grid[r][c] == 1) ++frescas;
            }

        if (frescas == 0) return 0;   // nada que pudrir

        int minutos = 0;
        int dr[] = {-1, 1, 0, 0};
        int dc[] = {0, 0, -1, 1};
        while (!cola.empty() && frescas > 0) {
            int capa = cola.size();   // naranjas podridas en este minuto
            for (int i = 0; i < capa; ++i) {
                auto [r, c] = cola.front(); cola.pop();
                for (int d = 0; d < 4; ++d) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
                    if (grid[nr][nc] != 1) continue;   // vacío o ya podrida
                    grid[nr][nc] = 2;                  // se pudre
                    --frescas;
                    cola.push({nr, nc});
                }
            }
            ++minutos;   // pasó un minuto completo
        }
        return frescas == 0 ? minutos : -1;
    }
};

int main() {
    Solution s;

    vector<vector<int>> g1 = {{2,1,1},{1,1,0},{0,1,1}};
    assert(s.orangesRotting(g1) == 4);

    // Imposible: la naranja de abajo-izquierda nunca se pudre.
    vector<vector<int>> g2 = {{2,1,1},{0,1,1},{1,0,1}};
    assert(s.orangesRotting(g2) == -1);

    // Sin naranjas frescas => 0 minutos.
    vector<vector<int>> g3 = {{0,2}};
    assert(s.orangesRotting(g3) == 0);

    // Todo vacío => 0.
    vector<vector<int>> g4 = {{0,0},{0,0}};
    assert(s.orangesRotting(g4) == 0);

    cout << "994 Rotting Oranges: todas las pruebas pasaron.\n";
    return 0;
}
```

- [ ] **Step 2: Compilar y ejecutar**

Run:
```bash
g++ -std=c++17 "src/01-grafos/994-rotting-oranges.cpp" -o "src/01-grafos/out" && "src/01-grafos/out"
```
Expected: `994 Rotting Oranges: todas las pruebas pasaron.`

- [ ] **Step 3: Commit**

```bash
git add src/01-grafos/994-rotting-oranges.cpp
git commit -m "feat: solución 994 Rotting Oranges en C++"
```

---

### Task 5: Capítulo `994` en el libro

**Files:**
- Create: `capitulos/01-grafos/994-rotting-oranges.tex`
- Modify: `main.tex` (agregar `\include`)

**Interfaces:**
- Consumes: `\problema`, `\complejidad` (Task 1), `src/01-grafos/994-rotting-oranges.cpp` (Task 4).

- [ ] **Step 1: Crear `capitulos/01-grafos/994-rotting-oranges.tex`**

```latex
\problema{Rotting Oranges}{994}{src/01-grafos/994-rotting-oranges.cpp}{M}

Tenemos una cuadrícula donde \texttt{0} es una celda vacía, \texttt{1} es una
naranja fresca y \texttt{2} una naranja podrida. Cada minuto, toda naranja
fresca adyacente (arriba, abajo, izquierda, derecha) a una podrida se pudre.
Queremos el número de minutos hasta que no quede ninguna fresca, o
\texttt{-1} si alguna nunca se pudre.

\paragraph{Intuición.} La podredumbre se expande como una onda desde todas
las naranjas podridas \emph{al mismo tiempo}. Eso es exactamente un BFS
\emph{multi-fuente}: metemos todas las podridas en la cola y expandimos por
capas; cada capa es un minuto. Contamos las frescas al inicio y las restamos
conforme se pudren; si al final queda alguna, es imposible.

\begin{center}
\ttfamily
minuto 0\quad
\begin{tabular}{ccc}2&1&1\\1&1&0\\0&1&1\end{tabular}
\;$\rightarrow$\;
minuto 4\quad
\begin{tabular}{ccc}2&2&2\\2&2&0\\0&2&2\end{tabular}
\end{center}

\paragraph{Solución.} BFS por niveles desde todas las podridas. La clave del
manejo de casos borde: si no hay frescas al inicio, la respuesta es
\texttt{0}; si terminan las capas y aún quedan frescas, es \texttt{-1}.

\lstinputlisting{src/01-grafos/994-rotting-oranges.cpp}

\complejidad{$O(m\cdot n)$}{$O(m\cdot n)$}

\paragraph{Notas de entrevista (Amazon).} El error típico es empezar
\texttt{minutos} en $-1$ o contar un minuto de más cuando la última capa no
pudre nada. Aquí sólo incrementamos \texttt{minutos} mientras haya frescas
que pudrir. Casos borde a mencionar: sin frescas ($0$), fresca aislada
($-1$), todo vacío ($0$).
```

- [ ] **Step 2: Enlazar en `main.tex`**

Bajo `\chapter{Grafos}`, dejar:

```latex
\chapter{Grafos}
\include{capitulos/01-grafos/200-number-of-islands}
\include{capitulos/01-grafos/994-rotting-oranges}
```

- [ ] **Step 3: Compilar**

Run: `pwsh -File build.ps1`
Expected: compila; aparecen ambas secciones (200 y 994) con sus listados y enlaces.

- [ ] **Step 4: Commit**

```bash
git add capitulos/01-grafos/994-rotting-oranges.tex main.tex
git commit -m "feat: capítulo 994 Rotting Oranges con enlace al .cpp"
```

---

### Task 6: Ruta de problemas pendientes (índice de los 60+)

**Files:**
- Create: `capitulos/99-ruta.tex`
- Modify: `main.tex` (agregar `\include` al final)

**Interfaces:**
- Consumes: nada nuevo; sólo texto.

- [ ] **Step 1: Crear `capitulos/99-ruta.tex`**

```latex
\chapter{Ruta de problemas}
\addcontentsline{toc}{chapter}{Ruta de problemas}

Lista objetivo por bloque. Los marcados con \checkmark\ ya tienen capítulo;
el resto son las siguientes iteraciones.

\paragraph{Bloque 1 — Grafos.}
\checkmark\ 200 Number of Islands \textbullet{}
\checkmark\ 994 Rotting Oranges \textbullet{}
695 Max Area of Island \textbullet{} 542 01 Matrix \textbullet{}
1091 Shortest Path in Binary Matrix \textbullet{} 417 Pacific Atlantic \textbullet{}
79 Word Search \textbullet{} 207 Course Schedule \textbullet{}
210 Course Schedule II \textbullet{} 269 Alien Dictionary \textbullet{}
127 Word Ladder \textbullet{} 126 Word Ladder II \textbullet{}
261 Graph Valid Tree \textbullet{} 323 Connected Components \textbullet{}
128 Longest Consecutive \textbullet{} 547 Number of Provinces \textbullet{}
743 Network Delay Time \textbullet{} 787 Cheapest Flights K Stops \textbullet{}
133 Clone Graph \textbullet{} 1192 Critical Connections.

\paragraph{Bloque 2 — Árboles.}
236 LCA \textbullet{} 1644 LCA II \textbullet{} 103 Zigzag Level Order \textbullet{}
199 Right Side View \textbullet{} 987 Vertical Order \textbullet{}
124 Max Path Sum \textbullet{} 543 Diameter \textbullet{} 863 Distance K \textbullet{}
98 Validate BST \textbullet{} 105 Build Tree Pre+In \textbullet{}
337 House Robber III \textbullet{} 297 Serialize/Deserialize.

\paragraph{Bloque 3 — Intervalos.}
56 Merge Intervals \textbullet{} 253 Meeting Rooms II \textbullet{}
2402 Meeting Rooms III \textbullet{} 1094 Car Pooling.

\paragraph{Bloque 4 — Heaps / Top-K.}
215 Kth Largest \textbullet{} 347 Top K Frequent \textbullet{}
973 K Closest Points \textbullet{} 295 Find Median \textbullet{}
23 Merge k Sorted Lists \textbullet{} 621 Task Scheduler.

\paragraph{Bloque 5 — Design.}
146 LRU Cache \textbullet{} 348 Design Tic-Tac-Toe \textbullet{}
642 Search Autocomplete.

\paragraph{Bloque 6 — Sliding Window / Stack.}
3 Longest Substring \textbullet{} 76 Minimum Window \textbullet{}
42 Trapping Rain Water \textbullet{} 84 Largest Rectangle \textbullet{}
394 Decode String.

\paragraph{Bloque 7 — DP.}
322 Coin Change \textbullet{} 139 Word Break \textbullet{}
55 Jump Game \textbullet{} 5 Longest Palindromic Substring.
```

- [ ] **Step 2: Enlazar en `main.tex`** (antes de `\end{document}`)

```latex
\include{capitulos/99-ruta}
```

- [ ] **Step 3: Compilar**

Run: `pwsh -File build.ps1`
Expected: compila; nuevo capítulo "Ruta de problemas" con los 60+ listados, 200 y 994 marcados.

- [ ] **Step 4: Commit**

```bash
git add capitulos/99-ruta.tex main.tex
git commit -m "feat: capítulo de ruta con índice de problemas objetivo"
```

---

## Self-Review

**Spec coverage:** fuente única de verdad (Tasks 3/5 `\lstinputlisting`) ✓;
estructura de repo (Task 1) ✓; enlace vscode:// portable (Task 1 build.ps1 + macro) ✓;
formato .cpp compilable con tests+ASCII (Tasks 2/4) ✓; formato capítulo (Tasks 3/5) ✓;
compilación latexmk/xelatex (Task 1) ✓; índice de problemas (Task 6) ✓;
2 problemas molde 200 y 994 ✓.

**Placeholder scan:** sin TBD/TODO; todo el código y LaTeX están completos.

**Type consistency:** `\problema` firma `{titulo}{numLC}{rutaRelCpp}{dif}` usada
igual en Tasks 3 y 5; `\repopath` definido en Task 1, usado por la macro;
nombres de archivo `.cpp` coinciden entre Tasks 2/3 y 4/5.
