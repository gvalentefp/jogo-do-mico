output "server_url" {
  description = "WebSocket URL clients should connect to."
  value       = "ws://localhost:${var.host_port}/ws"
}

output "health_url" {
  description = "HTTP health endpoint."
  value       = "http://localhost:${var.host_port}/healthz"
}

output "container_name" {
  value = docker_container.server.name
}
