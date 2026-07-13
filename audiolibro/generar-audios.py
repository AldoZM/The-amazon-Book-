"""Genera un .mp3 por cada .txt en audiolibro/, usando edge-tts (voz en espanol)."""

import asyncio
import sys
from pathlib import Path

import edge_tts

VOZ = "es-MX-DaliaNeural"
RAIZ = Path(__file__).parent


async def generar(txt_path: Path) -> None:
    mp3_path = txt_path.with_suffix(".mp3")
    if mp3_path.exists():
        print(f"  ya existe, se omite: {mp3_path.name}")
        return
    texto = txt_path.read_text(encoding="utf-8")
    comunicador = edge_tts.Communicate(texto, VOZ)
    await comunicador.save(str(mp3_path))
    print(f"  generado: {mp3_path.name}")


async def main() -> None:
    archivos = sorted(RAIZ.glob("*/*.txt"))
    if not archivos:
        print("No se encontraron archivos .txt en audiolibro/.")
        return

    print(f"Voz: {VOZ}")
    print(f"Archivos a procesar: {len(archivos)}\n")

    for i, txt_path in enumerate(archivos, start=1):
        print(f"[{i}/{len(archivos)}] {txt_path.relative_to(RAIZ)}")
        await generar(txt_path)

    print("\nListo.")


if __name__ == "__main__":
    asyncio.run(main())
