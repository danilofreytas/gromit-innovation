variable "zone_id" {
  type        = string
  description = "ID da zona gromit.com.br no Cloudflare (Visão geral da zona, coluna direita)."
}

variable "github_user" {
  type        = string
  description = "Usuário do GitHub dono do repositório do site (destino do CNAME do www)."
  default     = "danilofreytas"
}
