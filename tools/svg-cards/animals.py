"""
animals.py - receitas por animal (o "input" do motor).

Cada animal e uma funcao `art(scene, area, ctx)` que desenha dentro da area
central entregue por cards.render_card, mais alguns metadados (nome m/f, numero,
paleta). Para adicionar um animal novo, escreva uma receita e registre em
ANIMALS. Acessorios de genero vem de ctx["acc"]; cor de acento de ctx["accent"].
"""

from dataclasses import dataclass, field
from typing import Callable
from svg_animals import (
    circle, ellipse, polygon, path, line, group, blob, eye, text,
)


@dataclass
class AnimalSpec:
    key: str
    number: int
    name_m: str
    name_f: str
    art: Callable           # art(scene, area, ctx, fur=...)
    palette: dict = field(default_factory=dict)
    theme: str = "jungle"


# ------------------------------- GATO ---------------------------------------

def _cat(scene, area, ctx):
    cx = area.cx
    p = ctx["palette"]
    fur = p.get("fur", "#f0a24a")
    fur2 = p.get("fur2", "#d9852f")
    belly = p.get("belly", "#fff3df")
    inner_ear = p.get("inner_ear", "#f6b9c8")
    outline = "#5a3a1a"
    acc = ctx["acc"]
    accent = ctx["accent"]
    g = ctx["gender"]
    female = g == "female"

    hx, hy, hr = cx, area.top + 74, 58
    body_cx, body_cy = cx, hy + 150

    # --- cauda (atras) ---
    scene.add(path(
        f"M {body_cx + 52},{body_cy + 40} "
        f"C {body_cx + 140},{body_cy + 30} {body_cx + 128},{body_cy - 96} "
        f"{body_cx + 64},{body_cy - 78}",
        stroke=fur, sw=26, cap="round"))
    scene.add(circle(body_cx + 66, body_cy - 78, 13, fur2))

    # --- corpo ---
    scene.add(ellipse(body_cx, body_cy, 70, 94, fur, stroke=outline, sw=3))
    scene.add(ellipse(body_cx, body_cy + 14, 40, 66, belly))
    # patas traseiras
    for dx in (-1, 1):
        scene.add(ellipse(body_cx + dx * 40, body_cy + 82, 24, 16, fur,
                          stroke=outline, sw=3))
    # bracos
    for dx in (-1, 1):
        scene.add(ellipse(body_cx + dx * 58, body_cy - 6, 16, 42, fur,
                          stroke=outline, sw=3, rotate=dx * 18))

    # --- saia (femea) entre corpo e patas ---
    if female:
        scene.add(acc["skirt"](body_cx, body_cy + 36, 86, 46, accent))

    # --- orelhas ---
    for dx in (-1, 1):
        ex, ey = hx + dx * 38, hy - 44
        scene.add(polygon([(ex - 22, ey + 30), (ex + 22, ey + 30),
                           (ex + dx * 6, ey - 20)], fur, stroke=outline, sw=3))
        scene.add(polygon([(ex - 11, ey + 24), (ex + 11, ey + 24),
                           (ex + dx * 3, ey - 6)], inner_ear))

    # --- cabeca ---
    scene.add(circle(hx, hy, hr, fur, stroke=outline, sw=3))
    # bochechas
    scene.add(ellipse(hx - 26, hy + 20, 24, 20, belly))
    scene.add(ellipse(hx + 26, hy + 20, 24, 20, belly))
    # listras tabby na testa
    for i, dx in enumerate((-16, 0, 16)):
        scene.add(line(hx + dx, hy - hr + 8, hx + dx * 0.5, hy - hr + 26,
                       fur2, 5))

    # --- olhos ---
    scene.add(eye(hx - 22, hy - 2, 15, look=(0, 0.1), iris="#6cae3e",
                  lashes=female, outline=outline))
    scene.add(eye(hx + 22, hy - 2, 15, look=(0, 0.1), iris="#6cae3e",
                  lashes=female, outline=outline))
    # sobrancelhas (macho: mais marcadas)
    if not female:
        scene.add(line(hx - 32, hy - 20, hx - 12, hy - 16, outline, 4))
        scene.add(line(hx + 12, hy - 16, hx + 32, hy - 20, outline, 4))

    # --- focinho ---
    scene.add(polygon([(hx - 7, hy + 16), (hx + 7, hy + 16), (hx, hy + 24)],
                      "#d76b86"))
    scene.add(path(f"M {hx},{hy + 24} Q {hx - 10},{hy + 34} {hx - 18},{hy + 28} "
                   f"M {hx},{hy + 24} Q {hx + 10},{hy + 34} {hx + 18},{hy + 28}",
                   stroke=outline, sw=3))
    # bigodes
    for dx in (-1, 1):
        for k in (-1, 0, 1):
            scene.add(line(hx + dx * 12, hy + 22 + k * 2,
                           hx + dx * 54, hy + 14 + k * 9, outline, 2))

    # --- acessorios de genero ---
    if female:
        # laco numa orelha
        scene.add(acc["ribbon_loops"](hx - 38, hy - 58, 10, accent))
        # brincos
        scene.add(acc["hoop_earring"](hx - 54, hy + 16, 6))
        scene.add(acc["hoop_earring"](hx + 54, hy + 16, 6))
        # batom
        scene.add(acc["lips"](hx, hy + 34, 9, "#e23c6b"))
    else:
        # gravata borboleta no pescoco
        scene.add(acc["bowtie"](hx, hy + hr + 4, 14, accent))
        # bone
        scene.add(acc["cap"](hx, hy - hr + 6, 16, accent))


# ------------------------------- MICO ---------------------------------------

def _mico(scene, area, ctx):
    cx = area.cx
    fur = "#c8772e"
    face = "#f1c79a"
    belly = "#f6dcbf"
    outline = "#5a3a1a"

    hx, hy, hr = cx, area.top + 70, 54
    body_cx, body_cy = cx, hy + 140

    # cauda enrolada
    scene.add(path(
        f"M {body_cx - 50},{body_cy + 30} "
        f"C {body_cx - 150},{body_cy + 60} {body_cx - 140},{body_cy - 70} "
        f"{body_cx - 60},{body_cy - 40} "
        f"C {body_cx - 20},{body_cy - 24} {body_cx - 30},{body_cy + 6} "
        f"{body_cx - 54},{body_cy}",
        stroke=fur, sw=18, cap="round"))

    # corpo
    scene.add(ellipse(body_cx, body_cy, 60, 84, fur, stroke=outline, sw=3))
    scene.add(ellipse(body_cx, body_cy + 10, 36, 58, belly))
    # bracos abertos
    for dx in (-1, 1):
        scene.add(ellipse(body_cx + dx * 60, body_cy - 18, 14, 44, fur,
                          stroke=outline, sw=3, rotate=dx * 40))
        scene.add(circle(body_cx + dx * 82, body_cy - 44, 12, face))
    # pernas
    for dx in (-1, 1):
        scene.add(ellipse(body_cx + dx * 28, body_cy + 78, 16, 30, fur,
                          stroke=outline, sw=3))

    # orelhas grandes
    for dx in (-1, 1):
        scene.add(circle(hx + dx * 52, hy, 20, fur, stroke=outline, sw=3))
        scene.add(circle(hx + dx * 52, hy, 11, face))

    # cabeca + face
    scene.add(circle(hx, hy, hr, fur, stroke=outline, sw=3))
    scene.add(ellipse(hx, hy + 8, 40, 42, face))
    # olhos
    scene.add(eye(hx - 18, hy - 2, 13, iris="#7a4a1f", outline=outline))
    scene.add(eye(hx + 18, hy - 2, 13, iris="#7a4a1f", outline=outline))
    # focinho
    scene.add(ellipse(hx, hy + 22, 16, 12, "#e7b489"))
    scene.add(circle(hx - 5, hy + 20, 2.4, outline))
    scene.add(circle(hx + 5, hy + 20, 2.4, outline))
    scene.add(path(f"M {hx - 12},{hy + 28} Q {hx},{hy + 38} {hx + 12},{hy + 28}",
                   stroke=outline, sw=3))


# ------------------------------ registro ------------------------------------

ANIMALS = {
    "gato": AnimalSpec(
        key="gato", number=7, name_m="Gato", name_f="Gata", art=_cat,
        palette={"fur": "#f0a24a", "fur2": "#d9852f",
                 "belly": "#fff3df", "inner_ear": "#f6b9c8"}),
}

MICO = AnimalSpec(key="mico", number=0, name_m="Mico", name_f="Mico",
                  art=_mico, theme="mico")
