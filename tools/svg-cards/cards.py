"""
cards.py - moldura padronizada da carta do Jogo do Mico.

Aqui mora tudo que e *uniforme* entre as cartas: a borda branca arredondada, o
painel de fundo com padrao, o badge do numero, a aba vertical com o nome e os
marcadores/acessorios de genero. A arte de cada animal (animals.py) so precisa
desenhar dentro da area central que `render_card` entrega.
"""

import math
from svg_animals import (
    Scene, rect, circle, ellipse, polygon, path, line, text, group, blob,
)

# Proporcao de carta de baralho (~2.5:3.5).
CARD_W, CARD_H = 360, 504

# ------------------------------- temas --------------------------------------

THEMES = {
    "jungle": {
        "panel_top": "#9ed95b",
        "panel_bot": "#5fb135",
        "pattern": "#3f8f2e",
        "pattern_opacity": 0.35,
        "badge_fill": "#2f7d22",
        "badge_ring": "#ffffff",
        "tab_fill": "#2f7d22",
        "name_color": "#ffffff",
        "number_color": "#ffffff",
    },
    "mico": {
        "panel_top": "#ffd86b",
        "panel_bot": "#f3a72e",
        "pattern": "#e07d1c",
        "pattern_opacity": 0.32,
        "badge_fill": "#d9731a",
        "badge_ring": "#ffffff",
        "tab_fill": "#d9731a",
        "name_color": "#ffffff",
        "number_color": "#ffffff",
    },
}

# Cores de acento por genero (usadas em acessorios e no marcador).
GENDER = {
    "male":   {"accent": "#3f7fd6", "accent2": "#2b5fb0"},
    "female": {"accent": "#ff5fa0", "accent2": "#e23c83"},
    "none":   {"accent": "#b9772e", "accent2": "#8a560f"},
}


class Area:
    """Regiao central onde a arte do animal e desenhada."""
    def __init__(self, cx, cy, w, h):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h
    @property
    def top(self): return self.cy - self.h / 2
    @property
    def bottom(self): return self.cy + self.h / 2


# --------------------------- padrao de fundo --------------------------------

def _paw_tile(color):
    """Uma patinha pequena para ladrilhar o fundo (vibe selva)."""
    s = 7
    cx, cy = 24, 24
    pad = ellipse(cx, cy + s * 0.5, s, s * 0.8, color)
    toes = "".join(
        circle(cx + dx * s, cy - s * 0.7 + dy, s * 0.42, color)
        for dx, dy in [(-1.15, 4), (-0.4, -1.5), (0.4, -1.5), (1.15, 4)]
    )
    return pad + toes


def _bg_pattern(scene, theme):
    tile = _paw_tile(theme["pattern"])
    # duas patinhas defasadas por ladrilho, levemente giradas
    inner = (group(tile, transform="translate(0,0) rotate(-12 24 24)")
             + group(tile, transform="translate(34 34) scale(0.8) rotate(20 24 24)"))
    return scene.pattern("bgpaws", 68, 68, inner, opacity=theme["pattern_opacity"])


# ------------------------- marcadores de genero -----------------------------

def gender_symbol(cx, cy, r, gender, color, sw=4):
    """Simbolo ♀/♂ desenhado com vetores (sem depender de fonte)."""
    parts = [circle(cx, cy, r, "none", stroke=color, sw=sw)]
    if gender == "female":
        parts.append(line(cx, cy + r, cx, cy + r + r * 1.5, color, sw))
        parts.append(line(cx - r * 0.7, cy + r + r * 0.75,
                          cx + r * 0.7, cy + r + r * 0.75, color, sw))
    elif gender == "male":
        a = math.radians(-45)
        ex, ey = cx + math.cos(a) * (r * 2.0), cy + math.sin(a) * (r * 2.0)
        sx, sy = cx + math.cos(a) * r, cy + math.sin(a) * r
        parts.append(line(sx, sy, ex, ey, color, sw))
        parts.append(line(ex, ey, ex - r * 0.85, ey, color, sw))
        parts.append(line(ex, ey, ex, ey + r * 0.85, color, sw))
    return group(*parts)


# ----------------------- acessorios reutilizaveis ---------------------------
# Cada um retorna uma string SVG; a receita do animal posiciona onde quiser.

def bow(cx, cy, s, color, outline="#00000033"):
    left = polygon([(cx, cy), (cx - 1.7 * s, cy - s), (cx - 1.7 * s, cy + s)],
                   color, stroke=outline, sw=1)
    right = polygon([(cx, cy), (cx + 1.7 * s, cy - s), (cx + 1.7 * s, cy + s)],
                    color, stroke=outline, sw=1)
    knot = circle(cx, cy, s * 0.5, color, stroke=outline, sw=1)
    return group(left, right, knot)


def bowtie(cx, cy, s, color, outline="#00000033"):
    return bow(cx, cy, s * 0.85, color, outline)


def ribbon_loops(cx, cy, s, color):
    """Lacinho com duas voltas arredondadas (mais fofo que o bow triangular)."""
    l = ellipse(cx - s, cy, s * 0.8, s * 1.1, color, rotate=-25)
    r = ellipse(cx + s, cy, s * 0.8, s * 1.1, color, rotate=25)
    k = circle(cx, cy, s * 0.45, color)
    return group(l, r, k)


def hoop_earring(cx, cy, s, color="#ffd23f"):
    return group(
        circle(cx, cy, s, "none", stroke=color, sw=max(2, s * 0.35)),
        circle(cx, cy + s, s * 0.28, color),
    )


def lips(cx, cy, s, color="#e23c6b"):
    d = (f"M {cx - s:.2f},{cy:.2f} "
         f"Q {cx - 0.5 * s:.2f},{cy - 0.7 * s:.2f} {cx:.2f},{cy - 0.12 * s:.2f} "
         f"Q {cx + 0.5 * s:.2f},{cy - 0.7 * s:.2f} {cx + s:.2f},{cy:.2f} "
         f"Q {cx:.2f},{cy + 0.8 * s:.2f} {cx - s:.2f},{cy:.2f} Z")
    return path(d, fill=color)


def skirt(cx, cy_top, w, h, color, outline="#00000022"):
    body = polygon([(cx - 0.5 * w, cy_top), (cx + 0.5 * w, cy_top),
                    (cx + 0.95 * w, cy_top + h), (cx - 0.95 * w, cy_top + h)],
                   color, stroke=outline, sw=1)
    # bainha em ziguezague suave
    n = 5
    hem = []
    for i in range(n + 1):
        x = cx - 0.95 * w + (1.9 * w) * i / n
        hem.append((x, cy_top + h + (6 if i % 2 else 0)))
    scallop = polygon([(cx - 0.95 * w, cy_top + h)] + hem +
                      [(cx + 0.95 * w, cy_top + h)], color)
    return group(body, scallop)


def necktie(cx, cy, s, color, outline="#00000022"):
    knot = polygon([(cx - 0.5 * s, cy), (cx + 0.5 * s, cy),
                    (cx + 0.35 * s, cy + 0.7 * s), (cx - 0.35 * s, cy + 0.7 * s)],
                   color, stroke=outline, sw=1)
    body = polygon([(cx - 0.35 * s, cy + 0.7 * s), (cx + 0.35 * s, cy + 0.7 * s),
                    (cx + 0.6 * s, cy + 3 * s), (cx, cy + 3.6 * s),
                    (cx - 0.6 * s, cy + 3 * s)], color, stroke=outline, sw=1)
    return group(knot, body)


def cap(cx, cy, s, color, outline="#00000022"):
    dome = path(f"M {cx - 1.4 * s},{cy} A {1.4 * s},{1.4 * s} 0 0 1 "
                f"{cx + 1.4 * s},{cy} Z", fill=color, stroke=outline, sw=1)
    brim = ellipse(cx + 1.1 * s, cy, 1.1 * s, 0.4 * s, color)
    btn = circle(cx, cy - 1.35 * s, 0.22 * s, color)
    return group(dome, brim, btn)


def flower(cx, cy, s, color, center="#ffd23f"):
    petals = "".join(
        circle(cx + math.cos(math.radians(a)) * s,
               cy + math.sin(math.radians(a)) * s, s * 0.62, color)
        for a in range(0, 360, 72))
    return group(petals, circle(cx, cy, s * 0.6, center))


def mustache(cx, cy, s, color="#5a3a1a"):
    d = (f"M {cx},{cy} "
         f"C {cx - 0.6 * s},{cy - 0.8 * s} {cx - 2 * s},{cy - 0.6 * s} {cx - 2.4 * s},{cy + 0.5 * s} "
         f"C {cx - 1.6 * s},{cy} {cx - 0.7 * s},{cy + 0.2 * s} {cx},{cy + 0.5 * s} "
         f"C {cx + 0.7 * s},{cy + 0.2 * s} {cx + 1.6 * s},{cy} {cx + 2.4 * s},{cy + 0.5 * s} "
         f"C {cx + 2 * s},{cy - 0.6 * s} {cx + 0.6 * s},{cy - 0.8 * s} {cx},{cy} Z")
    return path(d, fill=color)


# Conjunto de acessorios entregue a receita do animal.
ACCESSORIES = {
    "bow": bow, "bowtie": bowtie, "ribbon_loops": ribbon_loops,
    "hoop_earring": hoop_earring, "lips": lips, "skirt": skirt,
    "necktie": necktie, "cap": cap, "flower": flower, "mustache": mustache,
}


# ------------------------------ frame da carta ------------------------------

def _frame(scene, name, number, theme, gender):
    pat = _bg_pattern(scene, theme)
    panel_grad = scene.linear_gradient(
        "panel", [(0, theme["panel_top"]), (1, theme["panel_bot"])])
    shadow = scene.soft_shadow("cardshadow", dy=4, blur=6, opacity=0.25)

    # cartao branco
    scene.add(group(rect(8, 8, CARD_W - 16, CARD_H - 16, "#ffffff", rx=26),
                    filt=shadow))
    # painel interno
    px, py, pw, ph = 24, 24, CARD_W - 48, CARD_H - 48
    scene.add(rect(px, py, pw, ph, panel_grad, rx=18))
    scene.add(rect(px, py, pw, ph, pat, rx=18))

    # aba vertical com o nome (esquerda)
    tab_x, tab_y, tab_w, tab_h = px + 6, 96, 30, CARD_H - 220
    scene.add(rect(tab_x, tab_y, tab_w, tab_h, theme["tab_fill"], rx=15, opacity=0.92))
    scene.add(text(tab_x + tab_w / 2, tab_y + tab_h / 2, name, 26,
                   theme["name_color"], anchor="middle", rotate=-90,
                   weight=800, letter="0.5"))

    # badge do numero (canto superior esquerdo)
    bx, by, br = px + 24, py + 24, 22
    scene.add(circle(bx, by, br + 3, theme["badge_ring"]))
    scene.add(circle(bx, by, br, theme["badge_fill"]))
    scene.add(text(bx, by + br * 0.42, str(number), 27 if number < 10 else 22,
                   theme["number_color"], weight=800))

    # marcador de genero (canto superior direito)
    if gender in ("male", "female"):
        gx, gy = CARD_W - px - 30, py + 30
        scene.add(gender_symbol(gx, gy, 10, gender,
                                GENDER[gender]["accent"], sw=4))


def render_card(name, number, gender, art, theme="jungle", art_palette=None):
    """
    Monta uma carta completa.
      name        - rotulo exibido (ex.: "Gato" / "Gata")
      number      - identificador do par (ex.: 7); compartilhado macho/femea
      gender      - "male" | "female" | "none"
      art(scene, area, ctx) - receita do animal; desenha dentro de `area`.
                    ctx = {gender, accent, accent2, acc (ACCESSORIES)}
      theme       - "jungle" (animais) ou "mico"
    """
    th = THEMES[theme]
    scene = Scene(CARD_W, CARD_H)
    _frame(scene, name, number, th, gender)

    area = Area(cx=CARD_W / 2 + 14, cy=CARD_H / 2 + 6, w=232, h=300)
    g = GENDER.get(gender, GENDER["none"])
    ctx = {
        "gender": gender,
        "accent": g["accent"],
        "accent2": g["accent2"],
        "acc": ACCESSORIES,
        "palette": art_palette or {},
    }
    art(scene, area, ctx)
    return scene


# ------------------------------- verso --------------------------------------

def render_back():
    """Verso estiloso: selva verde + wordmark MICO com banana."""
    scene = Scene(CARD_W, CARD_H)
    grad = scene.linear_gradient("backbg", [(0, "#8ed24f"), (1, "#3f8f2e")])
    shadow = scene.soft_shadow("bs", dy=4, blur=6, opacity=0.25)

    scene.add(group(rect(8, 8, CARD_W - 16, CARD_H - 16, "#ffffff", rx=26),
                    filt=shadow))
    px, py, pw, ph = 24, 24, CARD_W - 48, CARD_H - 48
    scene.add(rect(px, py, pw, ph, grad, rx=18))

    # silhueta de selva (folhas escuras no rodape)
    dark = "#2f7d22"
    clip = scene.clip("backclip", rect(px, py, pw, ph, "#000", rx=18))
    leaves = []
    for i, x in enumerate(range(px - 10, px + pw + 20, 46)):
        h = 150 + (i % 3) * 40
        leaves.append(blob(x, CARD_H - 24, [h, h * 0.7, h * 0.85, h * 0.6,
                                            h * 0.9, h * 0.7], dark,
                           start_deg=-110, opacity=0.5))
    # algumas patinhas espalhadas
    for (x, y, s) in [(80, 120, 1), (270, 90, 0.8), (300, 220, 1.1),
                      (70, 300, 0.9), (250, 360, 1)]:
        paw = (ellipse(x, y + 5, 7 * s, 6 * s, "#2f7d22") +
               "".join(circle(x + dx * 7 * s, y - 5 * s + dy, 3 * s, "#2f7d22")
                       for dx, dy in [(-1.1, 3), (-0.4, -1), (0.4, -1), (1.1, 3)]))
        leaves.append(group(paw, opacity=0.4))
    scene.add(group(*leaves, clip=clip))

    # banana acima do wordmark (crescente claro)
    cx, cy = CARD_W / 2, CARD_H / 2
    banana = path(
        "M -52,8 C -34,-34 34,-44 56,-14 C 49,-20 41,-21 36,-18 "
        "C 22,-30 -18,-24 -34,16 C -40,16 -47,13 -52,8 Z",
        fill="#ffd23f", stroke="#caa019", sw=3)
    tips = (circle(-50, 6, 3, "#7a5a16") + circle(54, -12, 3, "#7a5a16"))
    scene.add(group(banana, tips, transform=f"translate({cx} {cy - 70}) rotate(-8)"))

    # wordmark
    scene.add(text(cx, cy, "MICO", 78, "#ffffff", weight=800,
                   stroke="#2f7d22", sw=7, letter="2"))
    scene.add(text(cx, cy + 40, "JOGO DO", 16, "#ffffff", weight=700,
                   letter="4", opacity=0.9))
    return scene
