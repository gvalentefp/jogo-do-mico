variable "image_name" {
  description = "Name/tag for the built server image."
  type        = string
  default     = "mico-server:latest"
}

variable "host_port" {
  description = "Host port to expose the lobby server on."
  type        = number
  default     = 8787
}

variable "container_port" {
  description = "Port the server listens on inside the container."
  type        = number
  default     = 8787
}

variable "max_players" {
  description = "Max players per room."
  type        = number
  default     = 8
}
