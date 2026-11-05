# Política de segurança

Este repositório é o site institucional estático da Gromit Innovation (`gromit.com.br`). Não há servidor de aplicação,
banco de dados nem contas de usuário aqui; o formulário de contato é processado por um serviço externo (Formspree).

## Como relatar uma vulnerabilidade

Use o **relato privado do GitHub**: aba **Security** > **Report a vulnerability**. Assim a conversa fica privada entre
você e os mantenedores até haver correção. Não abra issue pública com detalhes de uma falha.

Inclua, se possível: a URL afetada, os passos para reproduzir e o impacto que você enxerga.

## O que esperar

- Confirmação do recebimento em até 5 dias úteis.
- Avaliação e, se for o caso, correção em prazo proporcional à gravidade; avisamos quando publicar.

## Escopo

Está no escopo: o conteúdo e os cabeçalhos servidos em `gromit.com.br`, o código deste repositório e seus workflows.
Fora do escopo: serviços de terceiros (Cloudflare, GitHub, Formspree, Vercel) e ataques de negação de serviço.
Os produtos próprios (por exemplo, o Budget Bunny) têm infraestrutura separada e não fazem parte deste repositório.

## O que já fazemos

- Verificação em todo PR: Gitleaks (segredos), Trivy (vulnerabilidades e configuração) e Semgrep (análise estática),
  além do CodeQL e do varredor de segredos do GitHub com proteção de push.
- A branch principal é protegida: PR e checks obrigatórios, sem force-push e sem exclusão.
- Ações do GitHub fixadas por SHA e atualizadas pelo Dependabot, com espera de 7 dias para novas versões.
- Nenhum segredo no repositório; credenciais de infraestrutura vivem apenas em variáveis de ambiente.
- HTTPS obrigatório, com HSTS e cabeçalhos de segurança aplicados no Cloudflare.
