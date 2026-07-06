#!/usr/bin/env pwsh
# Detecta la raíz del repo, genera paths.tex con la ruta absoluta y compila.
$ErrorActionPreference = "Stop"
$root = (git rev-parse --show-toplevel).Trim()
# git ya devuelve separadores '/'; asegurar formato para vscode://file/
$root = $root -replace '\\', '/'
# Codificar espacios: un URI vscode://file/ no admite espacios crudos (ej. "Codigo Abierto")
$rootUri = $root -replace ' ', '%20'
Set-Content -Path "paths.tex" -Value "\def\repopath{$rootUri}" -Encoding utf8
Write-Host "paths.tex -> \repopath{$rootUri}"
latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex
Write-Host "Listo: main.pdf"
