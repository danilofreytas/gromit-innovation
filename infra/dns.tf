# Registros do site no GitHub Pages, COM proxy do Cloudflare: o Cloudflare termina o HTTPS (Universal SSL, modo Full)
# e renova o certificado sozinho; o certificado do GitHub Pages para o domínio não é necessário.
# Os registros de e-mail (iCloud+: MX, SPF, DKIM) já existem na zona e NÃO são gerenciados aqui.

locals {
  pages_ipv4 = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]
  pages_ipv6 = ["2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153"]
}

resource "cloudflare_dns_record" "apex_a" {
  for_each = toset(local.pages_ipv4)

  zone_id = var.zone_id
  name    = "@"
  type    = "A"
  content = each.value
  ttl     = 1
  proxied = true
  comment = "GitHub Pages (gerenciado por Terraform)"
}

resource "cloudflare_dns_record" "apex_aaaa" {
  for_each = toset(local.pages_ipv6)

  zone_id = var.zone_id
  name    = "@"
  type    = "AAAA"
  content = each.value
  ttl     = 1
  proxied = true
  comment = "GitHub Pages (gerenciado por Terraform)"
}

resource "cloudflare_dns_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = "${var.github_user}.github.io"
  ttl     = 1
  proxied = true
  comment = "GitHub Pages (gerenciado por Terraform)"
}

# Budget Bunny: o frontend roda na Vercel; o CNAME aponta para o alvo genérico dela, SEM proxy (a Vercel cuida do HTTPS).
resource "cloudflare_dns_record" "budgetbunny" {
  zone_id = var.zone_id
  name    = "budgetbunny"
  type    = "CNAME"
  content = "cname.vercel-dns.com"
  ttl     = 1
  proxied = false
  comment = "Budget Bunny na Vercel (gerenciado por Terraform)"
}
