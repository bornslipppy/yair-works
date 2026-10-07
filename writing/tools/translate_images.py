"""Create English versions of the three post images that contain Hebrew text.
Sources: writing/img/tabN.jpeg (originals). Output: writing/img/tabN-en.jpg
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "img")
F = "/Library/Fonts/HelveticaNeueLTStd-%s.otf"
S = 1.024  # coordinates below were read at 2000px display width

def font(w, size): return ImageFont.truetype(F % w, int(size))

def dark_bbox(im, box, thr):
    x0, y0, x1, y1 = [int(v * S) for v in box]
    a = np.asarray(im.convert("L"))[y0:y1, x0:x1]
    ys, xs = np.where(a < thr)
    if len(xs) == 0: return None
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)

def text_w(d, t, f): return d.textlength(t, font=f)

# ---------------------------------------------------------------- tab4
def tab4():
    im = Image.open(os.path.join(IMG, "tab4.jpeg")).convert("RGB"); d = ImageDraw.Draw(im)
    bg = im.getpixel((20, 20))
    labels = [  # (search box in display px, English, centre x)
        ((900, 435, 1130, 485), "Framing"),
        ((1590, 590, 1840, 640), "Prototype"),
        ((1120, 885, 1520, 935), "Real, usable code"),
        ((540, 885, 890, 935), "Learning from the logs"),
        ((120, 590, 510, 640), "Improve & optimize"),
    ]
    f = font("Bd", 42)
    for box, en in labels:
        bb = dark_bbox(im, box, 110)
        cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
        d.rectangle((bb[0] - 12, bb[1] - 12, bb[2] + 12, bb[3] + 12), fill=bg)
        w = text_w(d, en, f)
        d.text((cx - w / 2, cy), en, font=f, fill=(20, 20, 20), anchor="lm")
    im.save(os.path.join(IMG, "tab4-en.jpg"), quality=92)

# ---------------------------------------------------------------- tab8
def tab8():
    im = Image.open(os.path.join(IMG, "tab8.jpeg")).convert("RGB"); d = ImageDraw.Draw(im)
    boxes = [  # inner-left x, box right edge, text, dark box?
        (98, 380, "What is true, and what counts as good", False),
        (487, 770, "Produces a solution", False),
        (875, 1157, "What was produced, and what happened along the way", False),
        (1262, 1545, "What's the gap against the definition of success", False),
        (1650, 1932, "What in the system needs to change", True),
    ]
    f = font("Roman", 27)
    for x0, x1, text, dark in boxes:
        reg = (int(x0 * S) - 20, int(612 * S), int((x1 - 6) * S), int(735 * S))
        bgc = im.getpixel((int(x0 * S), int(750 * S)))
        d.rectangle(reg, fill=bgc)
        col = (150, 150, 150) if dark else (105, 105, 105)
        words, lines, cur = text.split(), [], ""
        maxw = (x1 - 28 - x0) * S
        for w in words:
            t = (cur + " " + w).strip()
            if text_w(d, t, f) <= maxw: cur = t
            else: lines.append(cur); cur = w
        lines.append(cur)
        y = 633 * S
        for ln in lines:
            d.text((x0 * S, y), ln, font=f, fill=col, anchor="lm"); y += 39 * S
    # bottom label (black on cream)
    reg = (int(770 * S), int(988 * S), int(1230 * S), int(1030 * S))
    bgc = im.getpixel((int(780 * S), int(1020 * S))); d.rectangle(reg, fill=bgc)
    f2 = font("Roman", 25); t = "Updates knowledge, skills, rules, or evals"
    d.text((1000 * S - text_w(d, t, f2) / 2, 1007 * S), t, font=f2, fill=(15, 15, 15), anchor="lm")
    im.save(os.path.join(IMG, "tab8-en.jpg"), quality=92)

# ---------------------------------------------------------------- tab11
def tab11():
    im = Image.open(os.path.join(IMG, "tab11.jpeg")).convert("RGB")
    arr = np.asarray(im).copy(); H, W = arr.shape[:2]
    # clean paper texture used as patch source (no text/dots here)
    sx0, sy0 = int(1000 * S), int(780 * S)
    rng = np.random.default_rng(3)
    items = [  # search box (display px), English, align ('c' centre / 'r' right)
        ((1500, 55, 1915, 110), "The process is also in process.", "r"),
        ((1010, 165, 1290, 215), "Explore alternatives", "c"),
        ((1460, 270, 1900, 325), "Understand and provide context", "c"),
        ((430, 445, 840, 500), "Define and check quality", "c"),
        ((1255, 605, 1490, 660), "Implement in code", "c"),
        ((745, 950, 1005, 1005), "Learn and improve", "c"),
    ]
    f = font("Lt", 41)
    spots = []
    for box, en, al in items:
        bb = dark_bbox(im, box, 120)
        spots.append((bb, en, al))
        x0, y0, x1, y1 = bb[0] - 26, bb[1] - 22, bb[2] + 26, bb[3] + 22
        w, h = x1 - x0, y1 - y0
        ox = sx0 + int(rng.integers(0, max(1, int(880 * S) - w - 20)))
        oy = sy0 + int(rng.integers(0, max(1, int(380 * S) - h - 20)))
        patch = arr[oy:oy + h, ox:ox + w].astype(float)
        # match brightness to the ring just outside the box (ignoring dark text)
        ring = arr[max(0, y0 - 14):y1 + 14, max(0, x0 - 14):x1 + 14].astype(float)
        ring = ring[ring.mean(axis=2) > 200]
        shift = ring.mean() - patch.mean()
        patch = np.clip(patch + shift, 0, 255)
        m = Image.new("L", (w, h), 0)
        ImageDraw.Draw(m).rectangle((10, 10, w - 10, h - 10), fill=255)
        m = np.asarray(m.filter(ImageFilter.GaussianBlur(7)), dtype=float)[..., None] / 255
        arr[y0:y1, x0:x1] = (patch * m + arr[y0:y1, x0:x1] * (1 - m)).astype(np.uint8)
    im = Image.fromarray(arr); d = ImageDraw.Draw(im)
    for bb, en, al in spots:
        cy = (bb[1] + bb[3]) / 2 + 2
        w = text_w(d, en, f)
        x = (bb[2] - w) if al == "r" else (bb[0] + bb[2]) / 2 - w / 2
        x = min(x, W - 60 - w)
        d.text((x, cy), en, font=f, fill=(48, 48, 50), anchor="lm")
    im.save(os.path.join(IMG, "tab11-en.jpg"), quality=92)

if __name__ == "__main__":
    tab4(); tab8(); tab11(); print("done")
