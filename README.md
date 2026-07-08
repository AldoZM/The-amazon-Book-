# The Amazon Book

Este proyecto consiste en un libro escrito en LaTeX que recopila los ejercicios de LeetCode más frecuentes en entrevistas técnicas de **Amazon**, resueltos en **C++** y explicados íntegramente en español.

Es una herramienta de estudio y preparación técnica diseñada por **Aldo Zetina**.

## 📖 Rasgo distintivo del proyecto

A diferencia de un libro tradicional, este proyecto está pensado para interactuar dinámicamente con tu editor de código y tu navegador.

- **Enlace al código (`vscode://`).** El título de cada problema en el PDF abre automáticamente el archivo `.cpp` correspondiente en **Visual Studio Code**, donde el código es 100% compilable e incluye casos de prueba integrados con `asserts`. Justo bajo el título se muestra además la ruta exacta del archivo dentro de `src/`, por si quieres consultarlo directamente.
- **Animación paso a paso (`local` | `web`).** Cada problema incluye el enlace *▷ Ver animación* con dos accesos:
  - **local** → abre el visualizador del repositorio descargado (`rep-visual/`), funciona **sin internet**.
  - **web** → abre la versión publicada en **GitHub Pages**, accesible desde **cualquier equipo**, aunque el PDF se haya compilado en otra computadora.

El visualizador (HTML/CSS/JS sin dependencias) muestra cómo evoluciona el algoritmo —la cuadrícula se pinta, la cola del BFS avanza, el árbol se recorre— y es bilingüe (español/inglés).

🔗 **Visualizador en línea:** https://aldozm.github.io/The-amazon-Book-/rep-visual/

## 🌙 Tema oscuro

El PDF usa un **tema oscuro estilo VS Code** (fondo `#1E1E1E`, sintaxis Dark+) pensado para lectura nocturna y menor fatiga visual.

## 🛠️ Stack Técnico

- **Documento:** XeLaTeX (MiKTeX) + `latexmk`
- **Lenguaje:** C++17
- **Compilador C++:** `g++` (ej. WinLibs UCRT)
- **Visualizador:** HTML + CSS + JavaScript (sin build ni dependencias)
- **Publicación web:** GitHub Pages vía **GitHub Actions** (`.github/workflows/deploy-pages.yml`); cada push a `main` redespliega el sitio
- **Automatización:** PowerShell (`build.ps1`) y Git Bash

## 🗂️ Estructura del Repositorio

- `main.tex`: Documento raíz del libro en LaTeX.
- `preambulo.tex`: Paquetes, tema oscuro (VS Code) y estilo de los listados de código.
- `macros.tex`: Macro `\problema` (título, enlaces `vscode://`, `local` y `web`) y `\pubbase` (base pública del visualizador).
- `capitulos/`: Archivos `.tex` divididos por bloques (ej. `01-grafos/`, `02-arboles/`) con la explicación teórica, la intuición y la complejidad de cada problema.
- `src/`: Es la **única fuente de verdad** del código. Aquí viven todos los archivos `.cpp`, organizados por bloque (`src/01-grafos/`, `src/02-arboles/`, …). El código no se duplica en LaTeX, sino que se importa directamente desde aquí al compilar.
- `rep-visual/`: Visualizador interactivo de los algoritmos (se publica en GitHub Pages).
- `.github/workflows/deploy-pages.yml`: Despliegue automático del sitio en GitHub Pages.
- `build.ps1`: Script de PowerShell que genera `paths.tex` con la ruta absoluta del repositorio, necesaria para que los enlaces `vscode://` y `local` funcionen en cualquier computadora.

## 🚀 Cómo compilar y ejecutar

1. **Generar las rutas locales:**
   Ejecuta el script `build.ps1` desde PowerShell. Esto creará un archivo `paths.tex` con la ruta absoluta de tu repositorio.

2. **Compilar el código fuente (C++):**
   Puedes probar cualquier solución entrando a la carpeta `src/` y utilizando `g++`. Por ejemplo:
   ```bash
   g++ -std=c++17 src/01-grafos/200-number-of-islands.cpp -o out.exe
   ./out.exe
   ```
   *(Todos los archivos están autocontenidos y ejecutarán pruebas automatizadas integradas en el `main()`)*.

3. **Compilar el libro (PDF):**
   Abre una terminal de **Git Bash** (es necesario para que `latexmk` encuentre `perl` correctamente en Windows) y ejecuta:
   ```bash
   latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex
   ```

4. **Visualizar e interactuar:**
   Se recomienda abrir el PDF con la extensión **vscode-pdf** (de *tomoki1207*) directamente en Visual Studio Code, o con un lector de escritorio. Así los enlaces abren el navegador en una **ventana separada** y no reemplazan la vista del PDF. Si lees el PDF dentro del navegador, usa **Ctrl+clic** sobre un enlace para abrirlo en una pestaña nueva.

---
*Este proyecto se encuentra actualmente en desarrollo activo. El contenido se ha dividido en más de 60 problemas estructurados en 7 bloques temáticos fundamentales (Grafos, Árboles, Intervalos, Heaps, Diseño, Sliding Window y DP).*
