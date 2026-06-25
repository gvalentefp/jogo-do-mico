# 🎨 svg-cards — motor de cartas do Jogo do Mico

Gerador de arte das cartas em SVG (vetorial, escala sem perder qualidade). Cada
carta tem uma **moldura padronizada** e a arte do animal vem de uma pequena
**receita** componível.

## Arquivos

| Arquivo | Papel |
|---|---|
| `svg_animals.py` | motor base: `Scene`, primitivas (formas, blobs, olhos, gradientes, padrões, texto) |
| `cards.py` | moldura uniforme: borda, fundo com padrão, badge do número, aba do nome, **acessórios e marcador de gênero**, e o **verso** |
| `animals.py` | receitas por animal (o "input") + registro `ANIMALS` |
| `build.py` | gera os SVGs em `out/` |
| `rasterize.js` | converte `out/*.svg` → PNG (preview/uso), com `montage` opcional |

## Uso

```bash
python build.py            # gera todas as cartas em ./out
python build.py gato       # só um animal
node rasterize.js montage  # PNGs + um contact-sheet (precisa de: npm i sharp)
```

## Anatomia da carta (uniforme)

- Borda branca arredondada com sombra suave.
- Painel interno com gradiente + padrão de patinhas (tema `jungle` verde, ou
  `mico` amarelo).
- **Número** num badge no canto superior esquerdo (compartilhado pelo par
  macho/fêmea).
- **Nome** numa aba vertical à esquerda.
- **Marcador de gênero** ♀/♂ (vetorial) no canto superior direito.

## Sistema de gênero

Distinção feita em duas camadas:

1. **Marcador** ♀/♂ automático no canto (cor de acento: rosa fêmea, azul macho).
2. **Acessórios** que a receita posiciona no animal, vindos de `ctx["acc"]`:
   `bow`, `ribbon_loops`, `bowtie`, `hoop_earring`, `lips`, `skirt`, `necktie`,
   `cap`, `flower`, `mustache`. A cor de acento está em `ctx["accent"]`.

Convenção atual (ajustável por animal): fêmea ganha laço, brincos, cílios,
batom e saia; macho ganha boné, gravata-borboleta e sobrancelhas marcadas.

## Como adicionar um animal (o "input")

Uma receita é uma função `art(scene, area, ctx)` que desenha dentro de `area`
(região central, com `cx`, `cy`, `w`, `h`). Registre em `ANIMALS`:

```python
def _cachorro(scene, area, ctx):
    cx = area.cx
    fur = ctx["palette"].get("fur", "#b9802f")
    female = ctx["gender"] == "female"
    # ... compõe corpo/cabeça/orelhas com circle/ellipse/blob/eye ...
    if female:
        scene.add(ctx["acc"]["ribbon_loops"](cx - 30, area.top + 10, 10, ctx["accent"]))
    else:
        scene.add(ctx["acc"]["bowtie"](cx, area.top + 120, 14, ctx["accent"]))

ANIMALS["cachorro"] = AnimalSpec(
    key="cachorro", number=3, name_m="Cachorro", name_f="Cadela",
    art=_cachorro, palette={"fur": "#b9802f"})
```

> Fluxo combinado: você diz o animal (ex.: "gato"), eu escrevo a `AnimalSpec` +
> receita aqui, rodo `build.py` e valido o PNG. O `gato` (nº 7) e o `mico`
> (nº 0, tema amarelo, sem fêmea) já servem de referência.

## Saída

SVG escalável + PNG. Os SVGs podem ser usados direto no app (web via `<img>`/
inline; mobile via `react-native-svg`).
