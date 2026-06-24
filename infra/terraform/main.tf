# Builds the server image and runs it as a local Docker container.
# Free, no cloud account required:
#   cd infra/terraform && terraform init && terraform apply
#
# The repo root is the build context so the Dockerfile sees the whole workspace.
locals {
  repo_root = abspath("${path.module}/../..")
}

resource "docker_image" "server" {
  name = var.image_name
  build {
    context    = local.repo_root
    dockerfile = "infra/docker/server.Dockerfile"
    tag        = [var.image_name]
  }
  # Rebuild when any tracked source changes.
  triggers = {
    dir_sha = sha1(join("", [
      for f in fileset(local.repo_root, "{packages,services}/**/*.{ts,json}") :
      filesha1("${local.repo_root}/${f}")
    ]))
  }
}

resource "docker_container" "server" {
  name    = "mico-server"
  image   = docker_image.server.image_id
  restart = "unless-stopped"

  env = [
    "PORT=${var.container_port}",
    "HOST=0.0.0.0",
    "MAX_PLAYERS=${var.max_players}",
  ]

  ports {
    internal = var.container_port
    external = var.host_port
  }

  healthcheck {
    test     = ["CMD", "node", "-e", "fetch('http://127.0.0.1:${var.container_port}/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
    interval = "30s"
    timeout  = "3s"
    retries  = 3
  }
}
