"""Put a rendered screen (3410x2146) into 'Macbook Pro Mockup.psd' (psd-tools).
The screen is the smart object 'Edit Here' (bbox 1322,917,4732,3063); hide it and
paste the image there using that layer's own alpha as the mask.
Run: python composite-macbook.py screen.png out.jpg
"""
import sys
from PIL import Image
from psd_tools import PSDImage

PSD = "/Users/josh/Documents/Mock Up Folder/Macbook Pro Mockup/Macbook Pro Mockup.psd"
screen_path, out_path = sys.argv[1], sys.argv[2]
psd = PSDImage.open(PSD)
edit = next(l for l in psd if l.name == "Edit Here")
x0, y0, x1, y1 = edit.bbox
mask = edit.composite().getchannel("A")
screen = Image.open(screen_path).convert("RGBA").resize((x1 - x0, y1 - y0), Image.LANCZOS)
base = psd.composite(layer_filter=lambda l: l.name != "Edit Here").convert("RGBA")
base.paste(screen, (x0, y0), mask)
base = base.convert("RGB"); base.thumbnail((1800, 1800)); base.save(out_path, quality=88)
