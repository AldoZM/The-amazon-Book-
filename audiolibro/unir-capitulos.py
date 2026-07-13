"""Une los .mp3 de cada capitulo en un solo archivo, en el orden del libro (main.tex)."""

import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).parent
FFMPEG = r"C:\Users\aldo-\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.exe"

ORDEN_GRAFOS = [
    "200-number-of-islands",
    "994-rotting-oranges",
    "695-max-area-of-island",
    "542-01-matrix",
    "1091-shortest-path-binary-matrix",
    "417-pacific-atlantic",
    "79-word-search",
    "207-course-schedule",
    "210-course-schedule-ii",
    "269-alien-dictionary",
    "127-word-ladder",
    "126-word-ladder-ii",
    "261-graph-valid-tree",
    "323-connected-components",
    "128-longest-consecutive",
    "547-number-of-provinces",
    "743-network-delay-time",
    "787-cheapest-flights-k-stops",
    "133-clone-graph",
    "1192-critical-connections",
]

ORDEN_ARBOLES = [
    "236-lowest-common-ancestor",
    "1644-lca-ii",
    "103-zigzag-level-order",
    "199-right-side-view",
    "987-vertical-order",
    "124-max-path-sum",
    "543-diameter-of-binary-tree",
    "863-all-nodes-distance-k-in-binary-tree",
    "98-validate-binary-search-tree",
    "105-construct-binary-tree-from-preorder-and-inorder-traversal",
    "337-house-robber-iii",
    "297-serialize-and-deserialize-binary-tree",
]

CAPITULOS = [
    ("01-grafos", ORDEN_GRAFOS, "audiolibro-grafos.mp3"),
    ("02-arboles", ORDEN_ARBOLES, "audiolibro-arboles.mp3"),
]


def unir_capitulo(carpeta: str, orden: list[str], salida: str) -> None:
    dir_cap = RAIZ / carpeta
    lista_path = dir_cap / "_lista.txt"
    faltantes = [slug for slug in orden if not (dir_cap / f"{slug}.mp3").exists()]
    if faltantes:
        print(f"  FALTAN mp3 en {carpeta}: {faltantes}")
        return

    with lista_path.open("w", encoding="utf-8") as f:
        for slug in orden:
            mp3 = (dir_cap / f"{slug}.mp3").resolve()
            f.write(f"file '{mp3.as_posix()}'\n")

    salida_path = dir_cap / salida
    cmd = [
        FFMPEG, "-y", "-f", "concat", "-safe", "0",
        "-i", str(lista_path),
        "-c", "copy",
        str(salida_path),
    ]
    resultado = subprocess.run(cmd, capture_output=True, text=True)
    lista_path.unlink()

    if resultado.returncode != 0:
        print(f"  ERROR uniendo {carpeta}:\n{resultado.stderr[-1500:]}")
    else:
        tam_mb = salida_path.stat().st_size / (1024 * 1024)
        print(f"  OK: {salida_path.name} ({tam_mb:.1f} MB, {len(orden)} problemas)")


def main() -> None:
    for carpeta, orden, salida in CAPITULOS:
        print(f"Uniendo capitulo {carpeta} ({len(orden)} problemas)...")
        unir_capitulo(carpeta, orden, salida)


if __name__ == "__main__":
    main()
