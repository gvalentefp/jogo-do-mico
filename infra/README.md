# Infra — servidor de lobby do Jogo do Mico

O `@mico/server` é um servidor host-autoritativo em WebSocket. É o mesmo código
que roda dentro do app (host na LAN) e que, no futuro, hospedamos num provedor
grátis para jogar pela internet. Tudo aqui implanta **essa** imagem.

## Caminhos de deploy

| Ferramenta        | Comando                                                                 | Uso |
|-------------------|-------------------------------------------------------------------------|-----|
| Docker            | `docker build -f infra/docker/server.Dockerfile -t mico-server .`       | imagem |
| Docker Compose    | `docker compose -f infra/compose/docker-compose.yml up --build`         | host único / dev |
| Docker Swarm      | `docker stack deploy -c infra/swarm/stack.yml mico`                     | cluster Swarm |
| Kubernetes        | `kubectl apply -k infra/k8s`                                            | cluster k8s |
| Terraform         | `cd infra/terraform && terraform init && terraform apply`               | builda + roda via Docker local (grátis) |

Todos os comandos de Docker/Compose/Terraform usam a **raiz do repositório** como
contexto de build, então o Dockerfile enxerga o workspace inteiro.

## Variáveis de ambiente do servidor

| Var          | Padrão    | Descrição |
|--------------|-----------|-----------|
| `PORT`       | `8787`    | porta WS/HTTP |
| `HOST`       | `0.0.0.0` | bind |
| `MAX_PLAYERS`| `8`       | jogadores por sala |

Endpoints: `GET /healthz` (saúde) e `GET /ws` (WebSocket).

## ⚠️ Escala horizontal (pendente)

Hoje cada instância guarda as salas **em memória**. Uma sala vive na instância que
a criou, então rodar várias réplicas espalharia jogadores em pods diferentes. Por
isso Swarm/K8s estão fixados em `replicas: 1`, o Service usa `sessionAffinity:
ClientIP` e o HPA está como template desabilitado (`maxReplicas: 1`).

Para escalar de verdade: mover o estado das salas para um store compartilhado
(Redis/Valkey) e então liberar réplicas + HPA. Rastreado como próximo passo de infra.
