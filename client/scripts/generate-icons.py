"""Régénère les icônes du client à partir du logo source.

Usage : python3 scripts/generate-icons.py [chemin/logo.jpeg]   (nécessite Pillow)
"""
import base64
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "logo-todo.jpeg"
PUBLIC = ROOT / "public"
ASSETS = ROOT / "src" / "assets"

RADIUS = 0.22  # rayon des coins, en proportion de la taille
SIZES = [16, 32, 48, 72, 96, 120, 128, 144, 152, 192, 256, 384, 512]
SCALE = 4  # suréchantillonnage du masque pour des bords lisses

logo = Image.open(SRC).convert("RGB")
BG = logo.getpixel((10, 10))
# Recentre le contenu du logo (légèrement décalé dans la source).
base = logo.crop((20, 2, 1910, 1892))


def rounded_mask(size):
    big = Image.new("L", (size * SCALE,) * 2, 0)
    r = int(size * SCALE * RADIUS)
    ImageDraw.Draw(big).rounded_rectangle((0, 0, big.width - 1, big.height - 1), r, fill=255)
    return big.resize((size, size), Image.LANCZOS)


def padded(factor):
    canvas = Image.new("RGB", (int(base.width * factor),) * 2, BG)
    off = (canvas.width - base.width) // 2
    canvas.paste(base, (off, off))
    return canvas


def rounded(size):
    # Léger retrait pour que le contenu ne frôle pas les coins arrondis.
    img = padded(1.12).resize((size, size), Image.LANCZOS).convert("RGBA")
    img.putalpha(rounded_mask(size))
    return img


def square(size):
    return base.resize((size, size), Image.LANCZOS)


def maskable(size):
    # Marge de sécurité : le contenu doit tenir dans le cercle central (80 %).
    return padded(1.5).resize((size, size), Image.LANCZOS)


for s in SIZES:
    rounded(s).save(PUBLIC / f"icon-{s}x{s}.png", optimize=True)
# iOS applique son propre masque : pas de transparence pour l'apple-touch-icon.
square(180).save(PUBLIC / "icon-180x180.png", optimize=True)
for s in (192, 512):
    maskable(s).save(PUBLIC / f"icon-maskable-{s}x{s}.png", optimize=True)

rounded(256).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# favicon.svg : PNG arrondi embarqué (reste utilisable par vite-pwa-assets).
buf = io.BytesIO()
rounded(128).save(buf, "PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
(PUBLIC / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
    'viewBox="0 0 128 128" width="128" height="128">'
    f'<image width="128" height="128" xlink:href="data:image/png;base64,{b64}"/></svg>\n'
)

# Logo de la barre de navigation (affiché à 40 px de haut).
for d in (PUBLIC, ASSETS):
    rounded(160).save(d / "logo-head.webp", quality=92, method=6)
print("OK, fond", BG)
