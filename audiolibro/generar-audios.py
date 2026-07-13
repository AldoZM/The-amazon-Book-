"""Genera un .mp3 en mp3/<capitulo>/ por cada .txt en txt/<capitulo>/, usando edge-tts (voz en espanol)."""

import asyncio
from pathlib import Path

import edge_tts

VOZ = "es-MX-DaliaNeural"
RAIZ = Path(__file__).parent
DIR_TXT = RAIZ / "txt"
DIR_MP3 = RAIZ / "mp3"


async def generar(txt_path: Path) -> None:
    capitulo = txt_path.parent.name
    mp3_path = DIR_MP3 / capitulo / txt_path.with_suffix(".mp3").name
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    if mp3_path.exists():
        print(f"  ya existe, se omite: {mp3_path.relative_to(RAIZ)}")
        return
    texto = txt_path.read_text(encoding="utf-8")
    comunicador = edge_tts.Communicate(texto, VOZ)
    await comunicador.save(str(mp3_path))
    print(f"  generado: {mp3_path.relative_to(RAIZ)}")


async def main() -> None:
    archivos = sorted(DIR_TXT.glob("*/*.txt"))
    if not archivos:
        print("No se encontraron archivos .txt en txt/.")
        return

    print(f"Voz: {VOZ}")
    print(f"Archivos a procesar: {len(archivos)}\n")

    for i, txt_path in enumerate(archivos, start=1):
        print(f"[{i}/{len(archivos)}] {txt_path.relative_to(RAIZ)}")
        await generar(txt_path)

    print("\nListo.")


if __name__ == "__main__":
    asyncio.run(main())
