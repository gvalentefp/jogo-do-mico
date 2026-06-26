"""
animals.py - registro das especies do Jogo do Mico (o "input" do motor).

24 especies (par macho/femea cada) + o Mico (carta impar, sem femea). Quase
todas sao descritas por parametros e desenhadas por creatures.draw_creature; o
Mico tem receita propria. Para um animal novo: acrescente um dict em SPECIES.
"""

from dataclasses import dataclass, field
from typing import Callable
from svg_animals import circle, ellipse, polygon, path, line, group, blob, eye
from creatures import draw_creature


@dataclass
class AnimalSpec:
    key: str
    number: int
    name_m: str
    name_f: str
    art: Callable
    palette: dict = field(default_factory=dict)
    theme: str = "jungle"


# --------- 24 especies (numero do par compartilhado macho/femea) ------------

SPECIES = [
    {"key": "leao", "n": 1, "m": "Leão", "f": "Leoa",
     "fur": "#e0a955", "fur2": "#c98a32", "ear": "round", "muzzle": "cat",
     "tail": "tuft", "mane": True, "mane_color": "#b9772e", "iris": "#caa12f",
     "head_r": 54, "cheeks": False},
    {"key": "tigre", "n": 2, "m": "Tigre", "f": "Tigresa",
     "fur": "#f0922e", "fur2": "#3a2a22", "ear": "round", "muzzle": "cat",
     "tail": "long", "stripes": True, "iris": "#6cae3e"},
    {"key": "gato", "n": 3, "m": "Gato", "f": "Gata",
     "fur": "#f0a24a", "fur2": "#d9852f", "ear": "pointy", "muzzle": "cat",
     "tail": "long", "iris": "#6cae3e", "inner_ear": "#f6b9c8"},
    {"key": "cao", "n": 4, "m": "Cão", "f": "Cadela",
     "fur": "#bb8748", "fur2": "#8f6531", "ear": "floppy", "muzzle": "dog",
     "tail": "long", "iris": "#5a3a1a"},
    {"key": "touro", "n": 5, "m": "Touro", "f": "Vaca",
     "fur": "#9aa0a8", "fur2": "#6f7680", "belly": "#e9ecef", "ear": "small",
     "muzzle": "cow", "tail": "tuft", "horns": "bull", "iris": "#3a2a22",
     "cheeks": False},
    {"key": "cavalo", "n": 6, "m": "Cavalo", "f": "Égua",
     "fur": "#a9743c", "fur2": "#7c5026", "ear": "long", "muzzle": "horse",
     "tail": "long", "iris": "#3a2a22", "cheeks": False},
    {"key": "porco", "n": 7, "m": "Porco", "f": "Porca",
     "fur": "#f1a8bc", "fur2": "#dd8aa1", "belly": "#fbd7e0", "ear": "small",
     "muzzle": "pig", "tail": "curl", "iris": "#5a3a1a"},
    {"key": "bode", "n": 8, "m": "Bode", "f": "Cabra",
     "fur": "#d8c8a8", "fur2": "#b3a079", "ear": "floppy", "muzzle": "snout_short",
     "tail": "short", "horns": "goat", "iris": "#7a6a3a"},
    {"key": "carneiro", "n": 9, "m": "Carneiro", "f": "Ovelha",
     "fur": "#efe9dc", "fur2": "#ccc3ad", "belly": "#fffdf6", "ear": "floppy",
     "muzzle": "snout_short", "tail": "short", "horns": "goat", "iris": "#5a3a1a"},
    {"key": "coelho", "n": 10, "m": "Coelho", "f": "Coelha",
     "fur": "#c9c4bd", "fur2": "#a8a29a", "belly": "#fbf7f0", "ear": "long",
     "muzzle": "snout_short", "tail": "short", "iris": "#6cae3e"},
    {"key": "rato", "n": 11, "m": "Rato", "f": "Rata",
     "fur": "#9c9690", "fur2": "#736d68", "belly": "#e7e2db", "ear": "round",
     "muzzle": "snout_short", "tail": "long", "iris": "#3a2a22"},
    {"key": "elefante", "n": 12, "m": "Elefante", "f": "Elefanta",
     "fur": "#a7a9b4", "fur2": "#83858f", "belly": "#c7c8cf", "ear": "fan",
     "muzzle": "snout_short", "tail": "short", "trunk": True, "tusks": True,
     "iris": "#3a2a22", "head_r": 52, "cheeks": False},
    {"key": "urso", "n": 13, "m": "Urso", "f": "Ursa",
     "fur": "#9c6b3f", "fur2": "#744f2d", "belly": "#d8b890", "ear": "round",
     "muzzle": "dog", "tail": "short", "iris": "#3a2a22"},
    {"key": "lobo", "n": 14, "m": "Lobo", "f": "Loba",
     "fur": "#8b8f96", "fur2": "#5f636a", "belly": "#d7d9dd", "ear": "pointy",
     "muzzle": "dog", "tail": "bushy", "iris": "#caa12f"},
    {"key": "raposa", "n": 15, "m": "Raposo", "f": "Raposa",
     "fur": "#e07d3a", "fur2": "#bd5f24", "belly": "#fbeede", "ear": "pointy",
     "muzzle": "dog", "tail": "bushy", "iris": "#caa12f"},
    {"key": "veado", "n": 16, "m": "Veado", "f": "Corça",
     "fur": "#c89456", "fur2": "#a06f36", "belly": "#f0dcc0", "ear": "long",
     "muzzle": "snout_short", "tail": "short", "horns": "antler",
     "horns_male_only": True, "horn_color": "#9c7b4f", "iris": "#5a3a1a"},
    {"key": "camelo", "n": 17, "m": "Camelo", "f": "Camela",
     "fur": "#cda368", "fur2": "#a8814a", "ear": "small", "muzzle": "horse",
     "tail": "tuft", "iris": "#5a3a1a", "cheeks": False},
    {"key": "burro", "n": 18, "m": "Burro", "f": "Burra",
     "fur": "#9b9aa0", "fur2": "#6f6e75", "belly": "#dad9de", "ear": "long",
     "muzzle": "horse", "tail": "tuft", "iris": "#3a2a22", "cheeks": False},
    {"key": "galo", "n": 19, "m": "Galo", "f": "Galinha", "body": "bird",
     "fur": "#b5532e", "fur2": "#e0a020", "belly": "#e9c98f", "beak": "#f3a72e",
     "comb": True},
    {"key": "pato", "n": 20, "m": "Pato", "f": "Pata", "body": "bird",
     "fur": "#f3f1ea", "fur2": "#cfcabb", "belly": "#ffffff", "beak": "#f3a72e",
     "iris": "#3a2a22"},
    {"key": "peru", "n": 21, "m": "Peru", "f": "Perua", "body": "bird",
     "fur": "#6b5a4a", "fur2": "#473b30", "belly": "#9c8a76", "beak": "#e0a020",
     "comb": True, "comb_color": "#d4584e"},
    {"key": "pavao", "n": 22, "m": "Pavão", "f": "Pavoa", "body": "bird",
     "fur": "#1f7a8c", "fur2": "#2e8b8b", "belly": "#7ec8c8", "beak": "#caa019",
     "fantail": True, "eye_feather": "#2e8b8b"},
    {"key": "hipopotamo", "n": 23, "m": "Hipopótamo", "f": "Hipopótama",
     "fur": "#a48aa0", "fur2": "#7e667a", "belly": "#cdb8c9", "ear": "small",
     "muzzle": "cow", "tail": "short", "iris": "#3a2a22", "head_r": 58,
     "cheeks": False},
    {"key": "zebra", "n": 24, "m": "Zebra", "f": "Zebra",
     "fur": "#f2f0ea", "fur2": "#2e2a26", "belly": "#ffffff", "ear": "long",
     "muzzle": "horse", "tail": "tuft", "stripes": True, "iris": "#3a2a22",
     "cheeks": False},
]


def _make_art(sp):
    return lambda scene, area, ctx, sp=sp: draw_creature(scene, area, ctx, sp)


ANIMALS = {
    s["key"]: AnimalSpec(key=s["key"], number=s["n"], name_m=s["m"],
                         name_f=s["f"], art=_make_art(s))
    for s in SPECIES
}


# ------------------------------- MICO ---------------------------------------

def _mico(scene, area, ctx):
    cx = area.cx
    fur = "#c8772e"; face = "#f1c79a"; belly = "#f6dcbf"; outline = "#5a3a1a"
    hx, hy, hr = cx, area.top + 70, 54
    bx, by = cx, hy + 140

    scene.add(path(
        f"M {bx - 50},{by + 30} C {bx - 150},{by + 60} {bx - 140},{by - 70} "
        f"{bx - 60},{by - 40} C {bx - 20},{by - 24} {bx - 30},{by + 6} "
        f"{bx - 54},{by}", stroke=fur, sw=18, cap="round"))
    scene.add(ellipse(bx, by, 60, 84, fur, stroke=outline, sw=3))
    scene.add(ellipse(bx, by + 10, 36, 58, belly))
    for dx in (-1, 1):
        scene.add(ellipse(bx + dx * 60, by - 18, 14, 44, fur, stroke=outline,
                          sw=3, rotate=dx * 40))
        scene.add(circle(bx + dx * 82, by - 44, 12, face))
        scene.add(ellipse(bx + dx * 28, by + 78, 16, 30, fur, stroke=outline, sw=3))
    for dx in (-1, 1):
        scene.add(circle(hx + dx * 52, hy, 20, fur, stroke=outline, sw=3))
        scene.add(circle(hx + dx * 52, hy, 11, face))
    scene.add(circle(hx, hy, hr, fur, stroke=outline, sw=3))
    scene.add(ellipse(hx, hy + 8, 40, 42, face))
    scene.add(eye(hx - 18, hy - 2, 13, iris="#7a4a1f", outline=outline))
    scene.add(eye(hx + 18, hy - 2, 13, iris="#7a4a1f", outline=outline))
    scene.add(ellipse(hx, hy + 22, 16, 12, "#e7b489"))
    scene.add(circle(hx - 5, hy + 20, 2.4, outline))
    scene.add(circle(hx + 5, hy + 20, 2.4, outline))
    scene.add(path(f"M {hx - 12},{hy + 28} Q {hx},{hy + 38} {hx + 12},{hy + 28}",
                   stroke=outline, sw=3))


MICO = AnimalSpec(key="mico", number=0, name_m="Mico", name_f="Mico",
                  art=_mico, theme="mico")
