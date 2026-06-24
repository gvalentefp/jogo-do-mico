# @mico/desktop — shell Tauri (Windows / macOS / Linux)

O desktop reaproveita 100% da UI: o Tauri embrulha o **export web do Expo**
(`apps/mobile`). Não há frontend separado.

## Pré-requisitos
- Rust (cargo) — já instalado neste ambiente.
- Dependências de sistema do Tauri v2 (WebView2 no Windows; `libwebkit2gtk` no Linux).

## Rodar em dev
```bash
pnpm --filter @mico/desktop dev
```
Isso sobe o Expo web (`http://localhost:8081`) e abre a janela Tauri apontando
para ele (`beforeDevCommand` + `devUrl` em `src-tauri/tauri.conf.json`).

## Build de produção
```bash
pnpm --filter @mico/desktop build
```
`beforeBuildCommand` roda `expo export` gerando `apps/mobile/dist`, que o Tauri
empacota como `frontendDist`.

## Ícones
Os ícones em `src-tauri/icons/` ainda não existem. Gere-os a partir de um PNG:
```bash
pnpm --filter @mico/desktop icon caminho/para/logo.png
```
> Em dev (`tauri dev`) os ícones não são obrigatórios; o `tauri build` precisa deles.
