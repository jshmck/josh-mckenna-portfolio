"""Transparent iPhone frame with the screen punched out (psd-tools), for videos
that play behind it. Same crop as composite-iphone.py (1500,450,2470,2250).
Screen hole in the output, as fractions: left .0990 top .0378 w .7990 h .9206.
Run: python make-phone-frame.py out.webp
"""
import sys
import numpy as np
from PIL import Image
from psd_tools import PSDImage

psd = PSDImage.open("/Users/josh/Documents/Mock Up Folder/MD834_iPhone_Mockup/iPhone_Mockup_1.psd")
mock = next(l for l in psd if l.name == "Mockup")
grp = next(l for l in mock if l.name == "Screen")
pix = next(l for l in grp if l.kind == "pixel" and l.name == "Screen")
x0, y0, x1, y1 = pix.bbox
mask = pix.composite().getchannel("A")
hide = {"Podium", "Delete this layer", "Colors", "Shadows"}
base = psd.composite(layer_filter=lambda l: l.kind != "smartobject" and l.name not in hide).convert("RGBA")
case = next(l for l in next(l for l in mock if l.name == "Case") if l.kind == "pixel")
alpha = Image.new("L", base.size, 0)
alpha.paste(case.composite().getchannel("A"), case.bbox[:2])
full = Image.new("L", base.size, 0)
full.paste(mask, (x0, y0))
a = np.where(np.array(full) > 0, 255 - np.array(full), np.array(alpha))
base.putalpha(Image.fromarray(a.astype("uint8")))
arr = np.array(base).astype(float)
edge = (arr[..., 3] > 0) & (arr[..., 3] < 255)
arr[edge, :3] = np.minimum(arr[edge, :3], 40)  # no light studio fringe at the edge
out = Image.fromarray(arr.astype("uint8")).crop((1500, 450, 2470, 2250))
out.thumbnail((700, 1300))
out.save(sys.argv[1], quality=85)
print(out.size)
