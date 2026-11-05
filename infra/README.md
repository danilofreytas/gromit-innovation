# infra: DNS do site no Cloudflare

Registros de `gromit.com.br` gerenciados por Terraform: o site no GitHub Pages (4 A, 4 AAAA e o CNAME `www`) e o
`budgetbunny` (CNAME para a Vercel). Todos **sem proxy** (DNS only). Os registros de e-mail do iCloud+ (MX, SPF, DKIM,
DMARC) e as verificações TXT **não** são gerenciados aqui.

## Uso normal

```bash
export CLOUDFLARE_API_TOKEN=...            # token só de "Edit zone DNS", restrito à zona; nunca no repositório
cp terraform.tfvars.example terraform.tfvars   # preencher zone_id
terraform init && terraform plan
```

## Adoção única dos registros que já existem

Os registros foram criados à mão no painel. Para o Terraform passar a gerenciá-los sem recriar nada:

1. Crie `infra/import.local.tf` com um bloco `import` por registro (o arquivo é ignorado pelo git, porque traz IDs da conta):

   ```hcl
   import {
     to = cloudflare_dns_record.www
     id = "<zone_id>/<id do registro>"
   }
   ```

   Endereços de destino: `apex_a["<ip>"]`, `apex_aaaa["<ip>"]`, `www` e `budgetbunny`.
2. `terraform plan`: deve listar **10 imports** e nenhuma criação nem destruição. Se aparecer alguma mudança, revise antes de seguir.
3. `terraform apply`, e então apague o `import.local.tf`.

Os IDs saem de `GET /zones/<zone_id>/dns_records` na API do Cloudflare.
