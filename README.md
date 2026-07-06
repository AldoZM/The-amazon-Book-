# The Amazon Book

Este proyecto consiste en un libro escrito en LaTeX que recopila los ejercicios de LeetCode más frecuentes en entrevistas técnicas de **Amazon**, resueltos en **C++** y explicados íntegramente en español.

Es una herramienta de estudio y preparación técnica diseñada por **Aldo Zetina**.

## 📖 Rasgo distintivo del proyecto

A diferencia de un libro tradicional, este proyecto está pensado para interactuar dinámicamente con tu editor de código. 

Cada vez que se compila el libro (`main.pdf`), los encabezados de los problemas generados funcionan como **enlaces interactivos** utilizando el protocolo `vscode://`. 
Al hacer clic sobre el título de un problema en el PDF, tu sistema abrirá automáticamente el código fuente (`.cpp`) correspondiente directo en **Visual Studio Code**, donde el código es 100% compilable e incluye casos de prueba integrados con `asserts`.

## 🛠️ Stack Técnico

- **Documento:** XeLaTeX (MiKTeX) + `latexmk`
- **Lenguaje:** C++17
- **Compilador C++:** `g++` (ej. WinLibs UCRT)
- **Automatización:** PowerShell (`build.ps1`) y Git Bash

## 🗂️ Estructura del Repositorio

- `main.tex`: Documento raíz del libro en LaTeX.
- `capitulos/`: Contiene los archivos `.tex` divididos por bloques (ej. `01-grafos/`, `02-arboles/`) con la explicación teórica, la intuición y la complejidad de cada problema.
- `src/`: Es la **única fuente de verdad** del código. Aquí viven todos los archivos `.cpp`. El código no se duplica en LaTeX, sino que se importa directamente desde aquí al compilar.
- `build.ps1`: Script de PowerShell que genera las rutas absolutas (`paths.tex`) necesarias para que los enlaces `vscode://` funcionen localmente en cualquier computadora.

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
   Se recomienda abrir el PDF resultante usando la extensión **vscode-pdf** (de *tomoki1207*) directamente en Visual Studio Code para disfrutar de la experiencia completa de los enlaces dinámicos.

---
*Este proyecto se encuentra actualmente en desarrollo activo. El contenido se ha dividido en más de 60 problemas estructurados en 7 bloques temáticos fundamentales (Grafos, Árboles, Intervalos, Heaps, Diseño, Sliding Window y DP).*
