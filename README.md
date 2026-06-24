# 🐒 Jogo do Mico

Jogo do Mico multiplayer online, cross-platform: **mobile (iOS/Android), web e desktop**
a partir de um único código.

## Como funciona o multiplayer

Modelo **host-autoritativo via WebSocket**. Um nó roda o `GameServer` (a fonte da
verdade do estado do jogo) e todos os participantes — inclusive a UI do próprio
host — falam com ele pelo mesmo protocolo:

- **Agora (LAN):** um jogador vira host na própria rede; os outros entram pelo IP dele.
- **Depois (internet):** o mesmo `GameServer` roda como servidor de lobby num
  provedor grátis. Nada do código de jogo muda — só onde ele roda.

A Web não consegue abrir socket de servidor, por isso o host é sempre um nó nativo
(mobile/desktop) ou o servidor; clientes web entram, mas não hospedam.

## Monorepo

```
packages/
  core/     @mico/core   regras do Jogo do Mico + máquina de estado (sem UI, testado)
  net/      @mico/net     protocolo + GameServer host-autoritativo + cliente WS
apps/
  mobile/   @mico/mobile  Expo (React Native) → iOS, Android e Web (react-native-web)
  desktop/  @mico/desktop Tauri empacotando o export web do Expo → Win/macOS/Linux
services/
  server/   @mico/server  servidor de lobby Node (ws) — dockerizável
infra/                    Docker, Compose, Swarm, Kubernetes e Terraform
```

Fluxo de dependências: `core` ← `net` ← (`server`, `mobile`). O desktop reaproveita
a UI web do mobile via Tauri.

## Stack

- **TypeScript** em tudo · **pnpm workspaces** + **Turborepo**
- **Expo / React Native** (mobile + web) com **Reanimated** + **Gesture Handler** (cartas animadas)
- **Tauri v2** (desktop, shell sobre o build web)
- **ws** (servidor) · WebSocket nativo (cliente, igual em todas as plataformas)
- **Infra:** Docker · docker-compose · Docker Swarm · Kubernetes · Terraform

## Começando

```bash
pnpm install

# Servidor de lobby (host-autoritativo) em ws://localhost:8787/ws
pnpm --filter @mico/server dev

# App (mobile + web)
pnpm --filter @mico/mobile start     # menu Expo (i / a / w)
pnpm --filter @mico/mobile web       # direto no navegador

# Desktop (Tauri)
pnpm --filter @mico/desktop dev
```

No app, informe o IP do host/servidor, a sala e seu nome. O host clica em
**Começar partida**. Na sua vez, toque numa carta (virada para baixo) do próximo
jogador para puxá-la; pares são descartados automaticamente. Quem ficar com o
**Mico** no fim, perde.

## Testes & build

```bash
pnpm test        # vitest (core + net)
pnpm build       # turbo: compila todos os pacotes
pnpm typecheck
```

## Infra / deploy

Veja [`infra/README.md`](infra/README.md). Resumo:

```bash
docker compose -f infra/compose/docker-compose.yml up --build   # host único
docker stack deploy -c infra/swarm/stack.yml mico               # Swarm
kubectl apply -k infra/k8s                                      # Kubernetes
cd infra/terraform && terraform init && terraform apply         # Docker local (grátis)
```

> Escala horizontal está pendente de um store de salas compartilhado (Redis);
> hoje as salas vivem em memória por instância. Detalhes no infra/README.

## Status

- ✅ `core` — regras do jogo, determinístico, com testes
- ✅ `net` — protocolo + servidor host-autoritativo + cliente, com testes
- ✅ `services/server` — servidor de lobby Node (build + health OK)
- ✅ `infra` — Docker/Compose/Swarm/K8s/Terraform
- 🧪 `apps/mobile` e `apps/desktop` — scaffold funcional; rodar `pnpm install` e
  os comandos acima. Ícones do Tauri a gerar (`pnpm --filter @mico/desktop icon <png>`).

## Próximos passos

1. `pnpm install` e validar o app Expo (mobile/web) e o Tauri localmente.
2. Descoberta de host na LAN (mDNS/Bonjour) para dispensar digitar o IP.
3. Store de salas compartilhado (Redis) → liberar réplicas/HPA.
4. Hospedar o servidor de lobby num provedor grátis.
