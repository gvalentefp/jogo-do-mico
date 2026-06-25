"""
svg_animals.py - motor minimalista de composicao SVG para animais cartoon.

Conceito: este modulo e o "gerador" reutilizavel. Ele oferece primitivas
(formas, blobs organicos suaves, olhos de desenho, gradientes, padroes,
clipping) e uma Scene que coleta tudo e grava um arquivo .svg. Cada animal e
entao uma pequena receita que compoe essas primitivas - essa receita e o
"input" por animal (ver animals.py).
"""

import os
import math


# ------------------------------- core scene ---------------------------------

class Scene:
    def __init__(self, width=400, height=400, bg=None):
        self.width = width
        self.height = height
        self.bg = bg
        self._defs = []
        self._els = []
        self._uid = 0

    def add(self, *elements):
        for e in elements:
            if e:
                self._els.append(e)
        return self

    def uid(self, prefix="id"):
        self._uid += 1
        return f"{prefix}{self._uid}"

    def clip(self, clip_id, inner_shape):
        """Registra um clipPath e devolve a referencia clip-path."""
        self._defs.append(f'<clipPath id="{clip_id}">{inner_shape}</clipPath>')
        return f'url(#{clip_id})'

    def radial_gradient(self, grad_id, stops, cx=0.5, cy=0.4, r=0.6):
        s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
        self._defs.append(
            f'<radialGradient id="{grad_id}" cx="{cx}" cy="{cy}" r="{r}">'
            f'{s}</radialGradient>'
        )
        return f'url(#{grad_id})'

    def linear_gradient(self, grad_id, stops, x1=0, y1=0, x2=0, y2=1):
        s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
        self._defs.append(
            f'<linearGradient id="{grad_id}" x1="{x1}" y1="{y1}" '
            f'x2="{x2}" y2="{y2}">{s}</linearGradient>'
        )
        return f'url(#{grad_id})'

    def pattern(self, pat_id, tile_w, tile_h, inner_svg, opacity=None):
        """Registra um <pattern> ladrilhado e devolve a referencia fill."""
        op = f' opacity="{opacity}"' if opacity is not None else ""
        self._defs.append(
            f'<pattern id="{pat_id}" width="{tile_w}" height="{tile_h}" '
            f'patternUnits="userSpaceOnUse"><g{op}>{inner_svg}</g></pattern>'
        )
        return f'url(#{pat_id})'

    def soft_shadow(self, filt_id="softshadow", dx=0, dy=3, blur=4, opacity=0.28):
        self._defs.append(
            f'<filter id="{filt_id}" x="-30%" y="-30%" width="160%" height="160%">'
            f'<feDropShadow dx="{dx}" dy="{dy}" stdDeviation="{blur}" '
            f'flood-color="#000000" flood-opacity="{opacity}"/></filter>'
        )
        return f'url(#{filt_id})'

    def to_svg(self):
        defs = f"<defs>{''.join(self._defs)}</defs>" if self._defs else ""
        bg = (f'<rect width="{self.width}" height="{self.height}" '
              f'fill="{self.bg}"/>') if self.bg else ""
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {self.width} {self.height}" '
            f'width="{self.width}" height="{self.height}">'
            f'{defs}{bg}{"".join(self._els)}</svg>'
        )

    def save(self, path):
        d = os.path.dirname(os.path.abspath(path))
        os.makedirs(d, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(self.to_svg())
        return path


# ------------------------------- primitivas ---------------------------------

def _stroke(stroke, sw):
    if not stroke or not sw:
        return ""
    return f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"'

def _op(o):
    return f' opacity="{o}"' if o is not None else ""

def circle(cx, cy, r, fill, stroke=None, sw=0, opacity=None):
    return (f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" '
            f'fill="{fill}"{_stroke(stroke, sw)}{_op(opacity)}/>')

def ellipse(cx, cy, rx, ry, fill, stroke=None, sw=0, rotate=None, opacity=None):
    t = f' transform="rotate({rotate} {cx:.2f} {cy:.2f})"' if rotate is not None else ""
    return (f'<ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{rx:.2f}" ry="{ry:.2f}" '
            f'fill="{fill}"{_stroke(stroke, sw)}{_op(opacity)}{t}/>')

def rect(x, y, w, h, fill, rx=0, stroke=None, sw=0, opacity=None, rotate=None):
    r = f' rx="{rx:.2f}" ry="{rx:.2f}"' if rx else ""
    t = (f' transform="rotate({rotate} {x + w / 2:.2f} {y + h / 2:.2f})"'
         if rotate is not None else "")
    return (f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}"'
            f'{r} fill="{fill}"{_stroke(stroke, sw)}{_op(opacity)}{t}/>')

def polygon(points, fill, stroke=None, sw=0, opacity=None):
    pts = " ".join(f"{x:.2f},{y:.2f}" for x, y in points)
    return (f'<polygon points="{pts}" fill="{fill}"'
            f'{_stroke(stroke, sw)}{_op(opacity)}/>')

def path(d, fill="none", stroke=None, sw=0, opacity=None, cap="round"):
    c = f' stroke-linecap="{cap}"' if stroke else ""
    return (f'<path d="{d}" fill="{fill}"{_stroke(stroke, sw)}{c}{_op(opacity)}/>')

def line(x1, y1, x2, y2, stroke, sw, cap="round", opacity=None):
    return (f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" '
            f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"'
            f'{_op(opacity)}/>')

def text(x, y, s, size, fill, family="'Baloo 2','Comic Sans MS',sans-serif",
         weight=700, anchor="middle", rotate=None, stroke=None, sw=0,
         letter=None, opacity=None):
    t = f' transform="rotate({rotate} {x:.2f} {y:.2f})"' if rotate is not None else ""
    ls = f' letter-spacing="{letter}"' if letter is not None else ""
    st = (f' stroke="{stroke}" stroke-width="{sw}" '
          f'paint-order="stroke" stroke-linejoin="round"') if stroke else ""
    esc = (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    return (f'<text x="{x:.2f}" y="{y:.2f}" font-family="{family}" '
            f'font-size="{size:.2f}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}"{ls}{st}{t}{_op(opacity)}>{esc}</text>')

def group(*elements, transform=None, clip=None, opacity=None, filt=None):
    attrs = ""
    if transform: attrs += f' transform="{transform}"'
    if clip: attrs += f' clip-path="{clip}"'
    if opacity is not None: attrs += f' opacity="{opacity}"'
    if filt: attrs += f' filter="{filt}"'
    return f"<g{attrs}>{''.join(e for e in elements if e)}</g>"


# --------------------------- formas organicas -------------------------------

def smooth_closed_path(points):
    """Catmull-Rom pelos pontos -> path fechado em curvas cubicas de Bezier."""
    n = len(points)
    d = f"M {points[0][0]:.2f},{points[0][1]:.2f} "
    for i in range(n):
        p0 = points[(i - 1) % n]
        p1 = points[i]
        p2 = points[(i + 1) % n]
        p3 = points[(i + 2) % n]
        c1x = p1[0] + (p2[0] - p0[0]) / 6.0
        c1y = p1[1] + (p2[1] - p0[1]) / 6.0
        c2x = p2[0] - (p3[0] - p1[0]) / 6.0
        c2y = p2[1] - (p3[1] - p1[1]) / 6.0
        d += (f"C {c1x:.2f},{c1y:.2f} {c2x:.2f},{c2y:.2f} "
              f"{p2[0]:.2f},{p2[1]:.2f} ")
    return d + "Z"

def blob_path(cx, cy, radii, start_deg=-90):
    """Path fechado e suave a partir de raios amostrados em angulos iguais."""
    n = len(radii)
    start = math.radians(start_deg)
    pts = []
    for i, r in enumerate(radii):
        a = start + 2 * math.pi * i / n
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return smooth_closed_path(pts)

def blob(cx, cy, radii, fill, start_deg=-90, stroke=None, sw=0, opacity=None):
    return path(blob_path(cx, cy, radii, start_deg), fill=fill,
                stroke=stroke, sw=sw, opacity=opacity)


# ------------------------------ olho cartoon --------------------------------

def eye(cx, cy, r, look=(0.0, 0.0), iris=None, iris_ratio=0.72,
        pupil_ratio=0.46, highlight=True, outline="#3a2a22", lashes=False):
    ox, oy = look[0] * r * 0.35, look[1] * r * 0.35
    parts = [circle(cx, cy, r, "#ffffff", stroke=outline, sw=max(1.5, r * 0.12))]
    if iris:
        parts.append(circle(cx + ox, cy + oy, r * iris_ratio, iris))
    pr = r * pupil_ratio
    parts.append(circle(cx + ox, cy + oy, pr, "#241a16"))
    if highlight:
        parts.append(circle(cx + ox - pr * 0.35, cy + oy - pr * 0.45,
                            pr * 0.5, "#ffffff", opacity=0.95))
    if lashes:
        for k in (-1, 0, 1):
            a = math.radians(-60 + k * 26)
            x1 = cx + math.cos(a) * r * 0.95
            y1 = cy - abs(math.sin(a)) * r * 0.95
            x2 = cx + math.cos(a) * r * 1.5
            y2 = cy - abs(math.sin(a)) * r * 1.5
            parts.append(line(x1, y1, x2, y2, outline, max(1.5, r * 0.16)))
    return "".join(parts)
