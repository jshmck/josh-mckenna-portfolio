"""Put a rendered screen into the MD834 iPhone mockup PSD (psd-tools).

Setup (once):  python3 -m venv /tmp/mockvenv && /tmp/mockvenv/bin/pip install psd-tools pillow
Run:           /tmp/mockvenv/bin/python scripts/mockups/composite-iphone.py screen.png out.jpg

Layers in iPhone_Mockup_1.psd that matter: hide 'Podium' (the blue circle),
the 'Colors' group, 'Shadows' and 'Delete this layer'; the screen is a
smart object, replaced by pasting the image into the pixel layer 'Screen'
(bbox 1596,518,2371,2175 = 775x1657) using that layer's alpha as the mask.
The screen image must be 775x1657 (render-story-screen.js does that).
"""
import sys
from PIL import Image
from psd_tools import PSDImage

PSD = "/Users/josh/Documents/Mock Up Folder/MD834_iPhone_Mockup/iPhone_Mockup_1.psd"
screen_path, out_path = sys.argv[1], sys.argv[2]
psd = PSDImage.open(PSD)
mock = next(l for l in psd if l.name == "Mockup")
grp = next(l for l in mock if l.name == "Screen")
pix = next(l for l in grp if l.kind == "pixel" and l.name == "Screen")
x0, y0, x1, y1 = pix.bbox
mask = pix.composite().getchannel("A")
screen = Image.open(screen_path).convert("RGBA").resize((x1 - x0, y1 - y0), Image.LANCZOS)
hide = {"Podium", "Delete this layer", "Colors", "Shadows"}
# A .webp/.png output is a cut-out: the studio background is removed by building
# an alpha from the 'Case' (phone body) and 'Screen' layers, not by hiding it.
cutout = out_path.lower().endswith((".webp", ".png"))
base = psd.composite(layer_filter=lambda l: l.kind != "smartobject" and l.name not in hide).convert("RGBA")
base.paste(screen, (x0, y0), mask)
if cutout:
    alpha = Image.new("L", base.size, 0)
    case = next(l for l in next(l for l in mock if l.name == "Case") if l.kind == "pixel")
    alpha.paste(case.composite().getchannel("A"), case.bbox[:2])
    alpha.paste(255, (x0, y0), mask)
    base.putalpha(alpha)
out = base.crop((1500, 450, 2470, 2250))
out = out if cutout else out.convert("RGB")
out.thumbnail((700, 1300))
out.save(out_path, quality=88)
