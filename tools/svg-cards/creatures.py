"""
creatures.py - builder parametrico de animais.

Em vez de uma receita manual por animal, descrevemos cada especie como um
dicionario de parametros (cor, tipo de orelha, focinho, cauda, features...) e o
builder compoe as pecas. Assim cobrimos as 24 especies do baralho reaproveitando
as mesmas primitivas. Aves usam um corpo proprio.
"""

import math
from svg_animals import circle, ellipse, polygon, path, line, group, blob, eye
from cards import ACCESSORIES, GENDER

OUTLINE = "#4a3420"


# ------------------------------- orelhas ------------------------------------

def _ears(hx, hy, hr, kind, fur, fur2, inner):
    out = []
    for dx in (-1, 1):
        ex, ey = hx + dx * hr * 0.66, hy - hr * 0.72
        if kind == "pointy":
            out.append(polygon([(ex - 22, ey + 30), (ex + 22, ey + 30),
                               (ex + dx * 6, ey - 22)], fur, stroke=OUTLINE, sw=3))
            out.append(polygon([(ex - 10, ey + 24), (ex + 10, ey + 24),
                               (ex + dx * 3, ey - 4)], inner))
        elif kind == "round":
            out.append(circle(ex, ey + 6, 20, fur, stroke=OUTLINE, sw=3))
            out.append(circle(ex, ey + 6, 11, inner))
        elif kind == "long":
            out.append(ellipse(ex, ey - 6, 12, 34, fur, stroke=OUTLINE, sw=3,
                              rotate=dx * 12))
            out.append(ellipse(ex, ey - 6, 6, 24, inner, rotate=dx * 12))
        elif kind == "floppy":
            out.append(ellipse(ex + dx * 6, ey + 30, 15, 34, fur,
                              stroke=OUTLINE, sw=3, rotate=dx * 18))
        elif kind == "small":
            out.append(polygon([(ex - 14, ey + 24), (ex + 14, ey + 24),
                               (ex + dx * 8, ey + 2)], fur, stroke=OUTLINE, sw=3))
        elif kind == "fan":
            out.append(ellipse(ex + dx * 14, ey + 30, 40, 46, fur,
                              stroke=OUTLINE, sw=3))
            out.append(ellipse(ex + dx * 14, ey + 30, 26, 32, inner))
    return "".join(out)


# ------------------------------- focinhos -----------------------------------

def _muzzle(hx, hy, hr, kind, fur, belly, nose="#3a2a22", lips=None):
    out = []
    my = hy + hr * 0.28
    if kind == "cat":
        out.append(polygon([(hx - 7, my), (hx + 7, my), (hx, my + 9)], "#d76b86"))
        out.append(path(f"M {hx},{my + 9} Q {hx - 10},{my + 19} {hx - 18},{my + 13} "
                        f"M {hx},{my + 9} Q {hx + 10},{my + 19} {hx + 18},{my + 13}",
                        stroke=OUTLINE, sw=3))
        for dx in (-1, 1):
            for k in (-1, 0, 1):
                out.append(line(hx + dx * 12, my + 7 + k * 2,
                               hx + dx * 50, my - 1 + k * 8, OUTLINE, 1.6))
    elif kind == "dog":
        out.append(ellipse(hx, my + 8, 22, 18, belly))
        out.append(ellipse(hx, my + 2, 8, 6, nose))
        out.append(path(f"M {hx},{my + 10} Q {hx - 10},{my + 20} {hx - 16},{my + 14} "
                        f"M {hx},{my + 10} Q {hx + 10},{my + 20} {hx + 16},{my + 14}",
                        stroke=OUTLINE, sw=3))
    elif kind == "pig":
        out.append(ellipse(hx, my + 8, 20, 15, "#f2a8bb", stroke=OUTLINE, sw=2.5))
        out.append(ellipse(hx - 7, my + 8, 3.4, 5, "#b5607a"))
        out.append(ellipse(hx + 7, my + 8, 3.4, 5, "#b5607a"))
    elif kind == "cow":
        out.append(ellipse(hx, my + 10, 28, 20, "#f3c9d4", stroke=OUTLINE, sw=2.5))
        out.append(ellipse(hx - 11, my + 8, 4, 6, "#c98aa0"))
        out.append(ellipse(hx + 11, my + 8, 4, 6, "#c98aa0"))
    elif kind == "horse":
        out.append(ellipse(hx, my + 14, 22, 26, fur, stroke=OUTLINE, sw=3))
        out.append(ellipse(hx - 9, my + 20, 3.6, 6, OUTLINE))
        out.append(ellipse(hx + 9, my + 20, 3.6, 6, OUTLINE))
    elif kind == "snout_short":
        out.append(ellipse(hx, my + 8, 16, 13, belly))
        out.append(ellipse(hx, my + 3, 7, 5, nose))
    if lips:
        out.append(ACCESSORIES["lips"](hx, my + 18, 9, lips))
    return "".join(out)


# -------------------------------- caudas ------------------------------------

def _tail(bx, by, kind, fur, fur2):
    if kind == "long":
        return (path(f"M {bx + 52},{by + 40} C {bx + 140},{by + 30} "
                     f"{bx + 128},{by - 96} {bx + 64},{by - 78}",
                     stroke=fur, sw=24, cap="round")
                + circle(bx + 66, by - 78, 12, fur2))
    if kind == "curl":
        return path(f"M {bx + 50},{by + 30} C {bx + 120},{by + 50} "
                    f"{bx + 110},{by - 30} {bx + 70},{by - 14} "
                    f"C {bx + 50},{by - 6} {bx + 58},{by + 16} {bx + 74},{by + 10}",
                    stroke=fur, sw=14, cap="round")
    if kind == "tuft":
        return (path(f"M {bx + 48},{by + 44} C {bx + 120},{by + 40} "
                     f"{bx + 122},{by - 40} {bx + 78},{by - 30}",
                     stroke=fur, sw=14, cap="round")
                + blob(bx + 78, by - 34, [16, 12, 18, 13, 17, 12], fur2))
    if kind == "bushy":
        return blob(bx + 70, by - 6, [46, 38, 50, 40, 52, 40], fur,
                    stroke=OUTLINE, sw=3)
    if kind == "short":
        return circle(bx + 58, by + 40, 16, fur2)
    return ""


# ----------------------------- head features --------------------------------

def _mane(hx, hy, hr, color):
    spikes = []
    n = 16
    for i in range(n):
        a = 2 * math.pi * i / n
        r1 = hr + 4
        r2 = hr + 26 + (8 if i % 2 else 0)
        spikes.append(blob(hx + math.cos(a) * (r1 + 8),
                           hy + math.sin(a) * (r1 + 8),
                           [14, 9, 13, 8], start_deg=math.degrees(a), fill=color))
    return group(*spikes)


def _horns(hx, hy, hr, kind, color="#e8e0cf"):
    out = []
    for dx in (-1, 1):
        bx, by = hx + dx * hr * 0.55, hy - hr * 0.55
        if kind == "bull":
            out.append(path(f"M {bx},{by} Q {bx + dx * 34},{by - 6} "
                            f"{bx + dx * 40},{by - 26}",
                            stroke=color, sw=11, cap="round"))
        elif kind == "goat":
            out.append(path(f"M {bx},{by} Q {bx + dx * 16},{by - 34} "
                            f"{bx + dx * 4},{by - 52}",
                            stroke=color, sw=9, cap="round"))
        elif kind == "antler":
            out.append(line(bx, by, bx + dx * 12, by - 40, color, 7))
            out.append(line(bx + dx * 8, by - 26, bx + dx * 26, by - 34, color, 5))
            out.append(line(bx + dx * 11, by - 38, bx + dx * 24, by - 54, color, 5))
    return "".join(out)


def _trunk(hx, hy, hr, fur):
    my = hy + hr * 0.2
    return path(f"M {hx - 14},{my} Q {hx - 22},{my + 60} {hx + 6},{my + 78} "
                f"Q {hx + 22},{my + 86} {hx + 18},{my + 64}",
                stroke=fur, sw=26, cap="round")


def _tusks(hx, hy, hr, color="#fbf3df"):
    my = hy + hr * 0.5
    return (path(f"M {hx - 12},{my} Q {hx - 18},{my + 24} {hx - 8},{my + 30}",
                 stroke=color, sw=7, cap="round")
            + path(f"M {hx + 12},{my} Q {hx + 18},{my + 24} {hx + 8},{my + 30}",
                   stroke=color, sw=7, cap="round"))


def _comb(hx, hy, hr, color="#e8403a"):
    out = [blob(hx + i * 12 - 12, hy - hr - 4, [10, 7, 11, 7], color)
           for i in range(3)]
    out.append(blob(hx, hy + hr * 0.55, [8, 6, 9, 6], color))  # barbela
    return group(*out)


def _stripes(hx, hy, hr, color):
    out = []
    for dx in (-1, 1):
        for k in range(3):
            x = hx + dx * (12 + k * 12)
            out.append(line(x, hy - hr * 0.5, x - dx * 4, hy + hr * 0.2,
                           color, 5))
    return "".join(out)


# ------------------------------- mamifero -----------------------------------

def _draw_mammal(scene, area, ctx, sp):
    cx = area.cx
    fur = sp["fur"]; fur2 = sp.get("fur2", fur); belly = sp.get("belly", "#fff3df")
    inner = sp.get("inner_ear", "#f4b8c6"); iris = sp.get("iris", "#6cae3e")
    g = ctx["gender"]; female = g == "female"; accent = ctx["accent"]
    acc = ctx["acc"]
    hr = sp.get("head_r", 56)
    hx, hy = cx, area.top + 74
    bx, by = cx, hy + 150

    # cauda + features atras
    scene.add(_tail(bx, by, sp.get("tail", "long"), fur, fur2))
    if sp.get("mane") and (g != "female"):
        scene.add(_mane(hx, hy, hr, sp.get("mane_color", "#c9882f")))

    # corpo
    scene.add(ellipse(bx, by, 68, 92, fur, stroke=OUTLINE, sw=3))
    scene.add(ellipse(bx, by + 14, 38, 64, belly))
    for dx in (-1, 1):
        scene.add(ellipse(bx + dx * 38, by + 80, 23, 15, fur, stroke=OUTLINE, sw=3))
        scene.add(ellipse(bx + dx * 57, by - 6, 15, 40, fur, stroke=OUTLINE, sw=3,
                          rotate=dx * 18))
    if female:
        scene.add(acc["skirt"](bx, by + 36, 84, 44, accent))

    # orelhas + cabeca
    scene.add(_ears(hx, hy, hr, sp.get("ear", "pointy"), fur, fur2, inner))
    scene.add(circle(hx, hy, hr, fur, stroke=OUTLINE, sw=3))
    if sp.get("cheeks", True):
        scene.add(ellipse(hx - 24, hy + 18, 22, 18, belly))
        scene.add(ellipse(hx + 24, hy + 18, 22, 18, belly))
    if sp.get("stripes"):
        scene.add(_stripes(hx, hy, hr, fur2))

    # features na cabeca
    if sp.get("horns") and not (sp.get("horns_male_only") and female):
        scene.add(_horns(hx, hy, hr, sp["horns"], sp.get("horn_color", "#e8e0cf")))
    if sp.get("trunk"):
        scene.add(_trunk(hx, hy, hr, fur))
    if sp.get("tusks"):
        scene.add(_tusks(hx, hy, hr))

    # olhos + focinho
    scene.add(eye(hx - 22, hy - 2, 14, iris=iris, lashes=female, outline=OUTLINE))
    scene.add(eye(hx + 22, hy - 2, 14, iris=iris, lashes=female, outline=OUTLINE))
    if not female and sp.get("brows", True):
        scene.add(line(hx - 32, hy - 20, hx - 12, hy - 16, OUTLINE, 4))
        scene.add(line(hx + 12, hy - 16, hx + 32, hy - 20, OUTLINE, 4))
    if not sp.get("trunk"):
        scene.add(_muzzle(hx, hy, hr, sp.get("muzzle", "cat"), fur, belly,
                          lips="#e23c6b" if female else None))

    # acessorios de genero
    if female:
        scene.add(acc["ribbon_loops"](hx - hr * 0.66, hy - hr * 0.95, 10, accent))
        scene.add(acc["hoop_earring"](hx - hr - 2, hy + 14, 6))
        scene.add(acc["hoop_earring"](hx + hr + 2, hy + 14, 6))
    else:
        scene.add(acc["bowtie"](hx, hy + hr + 2, 13, accent))
        if sp.get("hat", True):
            scene.add(acc["cap"](hx, hy - hr + 6, 15, accent))


# --------------------------------- ave --------------------------------------

def _draw_bird(scene, area, ctx, sp):
    cx = area.cx
    fur = sp["fur"]; fur2 = sp.get("fur2", fur); belly = sp.get("belly", "#fff7e6")
    beak = sp.get("beak", "#f3a72e"); iris = sp.get("iris", "#3a2a22")
    g = ctx["gender"]; female = g == "female"; accent = ctx["accent"]; acc = ctx["acc"]
    bx, by = cx, area.top + 188
    hx, hy, hr = cx, area.top + 96, 40

    # cauda de penas atras
    for i, ang in enumerate((-32, -16, 0, 16, 32)):
        scene.add(blob(bx - 66, by - 6, [40, 12, 44, 12], start_deg=180 + ang,
                       fill=fur2 if i % 2 else fur))
    if sp.get("fantail"):  # pavao
        for ang in range(-60, 61, 20):
            ex = bx + math.cos(math.radians(ang - 90)) * 92
            ey = by - 30 + math.sin(math.radians(ang - 90)) * 92
            scene.add(line(bx, by - 10, ex, ey, fur2, 6))
            scene.add(circle(ex, ey, 12, sp.get("eye_feather", "#2e8b8b")))
            scene.add(circle(ex, ey, 6, "#2b5fb0"))

    # corpo + asa
    scene.add(ellipse(bx, by, 58, 74, fur, stroke=OUTLINE, sw=3))
    scene.add(ellipse(bx, by + 10, 34, 52, belly))
    scene.add(ellipse(bx - 30, by, 22, 40, fur2, stroke=OUTLINE, sw=2.5, rotate=12))
    # pernas
    for dx in (-1, 1):
        scene.add(line(bx + dx * 16, by + 66, bx + dx * 16, by + 92, beak, 5))
        scene.add(line(bx + dx * 16, by + 92, bx + dx * 16 + dx * 10, by + 92, beak, 4))

    # pescoco + cabeca
    scene.add(ellipse(hx, (hy + by) / 2, 22, 40, fur))
    scene.add(circle(hx, hy, hr, fur, stroke=OUTLINE, sw=3))
    if sp.get("comb"):
        scene.add(_comb(hx, hy, hr, sp.get("comb_color", "#e8403a")))
    # bico
    scene.add(polygon([(hx + hr - 4, hy - 2), (hx + hr + 22, hy + 4),
                       (hx + hr - 4, hy + 12)], beak, stroke=OUTLINE, sw=2))
    scene.add(eye(hx + 8, hy - 4, 12, iris=iris, lashes=female, outline=OUTLINE))

    # acessorios
    if female:
        scene.add(acc["ribbon_loops"](hx - 10, hy - hr - 4, 9, accent))
        scene.add(acc["hoop_earring"](hx - 6, hy + hr - 6, 5))
    else:
        scene.add(acc["bowtie"](hx, hy + hr - 2, 11, accent))


def draw_creature(scene, area, ctx, sp):
    if sp.get("body") == "bird":
        _draw_bird(scene, area, ctx, sp)
    else:
        _draw_mammal(scene, area, ctx, sp)
