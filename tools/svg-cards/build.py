"""
build.py - gera as cartas SVG de todos os animais registrados.

  python build.py            # gera tudo em ./out
  python build.py gato       # so o(s) animal(is) indicado(s)
"""

import os
import sys
from cards import render_card, render_back
from animals import ANIMALS, MICO

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")


def gen_animal(spec):
    out = []
    for gender, name in (("male", spec.name_m), ("female", spec.name_f)):
        scene = render_card(name, spec.number, gender, spec.art,
                            theme=spec.theme, art_palette=spec.palette)
        p = os.path.join(OUT, f"{spec.key}_{gender}.svg")
        scene.save(p)
        out.append(p)
    return out


def main(argv):
    os.makedirs(OUT, exist_ok=True)
    keys = argv or list(ANIMALS.keys())
    for k in keys:
        if k in ANIMALS:
            gen_animal(ANIMALS[k])
    if not argv:
        render_card(MICO.name_m, MICO.number, "none", MICO.art,
                    theme=MICO.theme).save(os.path.join(OUT, "mico.svg"))
        render_back().save(os.path.join(OUT, "back.svg"))
    print(f"gerado em {OUT}")


if __name__ == "__main__":
    main(sys.argv[1:])
