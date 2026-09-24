# RespondaJá + Arcade — desenho

Data: 2026-09-24 · Estado: aprovado, por implementar

Dois trabalhos independentes, aprovados juntos. Podem ser feitos por ordem e
enviados separadamente; nenhum depende do outro.

---

## 1 · Case study do RespondaJá

### O que é

`respondaja.click` — assistente de resposta a avaliações para negócios locais.
Cola a avaliação (Google, iFood, TripAdvisor), escolhe o tom, recebe três
respostas em dez segundos. Grátis sem registo, cinco por mês, três tons,
PT + EN. Pro a R$ 29/mês por Stripe. Mercado: Brasil.

Backend PHP na Hostinger: `api/generate.php` (API da Anthropic, modelo
`claude-haiku-4-5`), `api/verify.php` (valida a sessão no Stripe e emite o
token Pro), `api/lib.php` (HMAC, quota, prompt).

### Porque entra no portefólio

Preenche o único buraco que as seis case studies existentes deixam: **nenhuma
mostra pagamentos, integração LLM do lado do servidor, quota ou tokens
assinados.** É também a única que fala de distribuição.

### Onde vive

Um sétimo `<article class="project-card">` na grelha e um `.modal.pixel-modal`
com `data-work-slug="respondaja"` / `data-work-title` / `data-work-description`.
`npm run build` gera `/work/respondaja/`, a entrada no sitemap, o cartão OG e o
JSON-LD. **Nenhuma arquitectura nova.**

### Conteúdo (estrutura da casa)

- **The question** — um negócio local recebe uma avaliação de uma estrela ao
  domingo à noite. A resposta certa demora vinte minutos a escrever e é quase
  sempre a mesma coisa. Porquê vinte minutos?
- **What I built** — colar, escolher o tom, três respostas em dez segundos.
  Grátis sem registo; Pro por Stripe.
- **Technical decisions**
  - O plano grátis não pede conta. O registo é o que mata uma ferramenta
    destas, não o preço.
  - A chave nunca chega ao browser: a geração é do lado do servidor, que é
    também a única razão por que uma quota pode existir.
  - O Pro é um token HMAC assinado com validade, **não uma tabela de
    utilizadores** — sem contas, sem passwords, sem dados pessoais a proteger.
  - A quota do grátis é contada no cliente **de propósito**, com o custo do
    abuso calculado (cerca de 0,001 EUR por chamada) e escrito no código, e o
    endurecimento por IP registado como dívida assumida.
- **What I learned** — está construído de ponta a ponta, Stripe incluído, e
  **nunca recebeu um pagamento, porque nunca foi divulgado**. Construir foi a
  metade fácil.

Chips: `PHP` · `Anthropic API` · `Stripe`. Link primário: abrir
respondaja.click. Sem link de repositório enquanto for privado — e isso diz-se.

### Verdade

Verificado a 2026-09-24 contra a página em produção e o código: preços, planos,
ausência de registo no grátis, Stripe, modelo e custo. Nenhuma afirmação sobre
receita ou utilizadores, porque não há nenhuma para fazer.

### Tornar o repositório público — recomendação: sim, com um bloqueio

Auditoria de `alinelx/replycraft` a 2026-09-24:

- **Segredos: limpo.** `api/config.php` nunca existiu no git. Os únicos acertos
  de `sk_live` / `sk_test` em toda a história são texto de exemplo dentro de um
  comentário do `config.php.example`. Varridos também `sk-ant`, `pk_live`,
  `whsec_`, `AKIA` e chaves privadas: nada.
- **Código: aguenta o escrutínio.** `hash_equals` na verificação da assinatura
  (comparação em tempo constante), base64url correcto, expiração verificada,
  validação multibyte, modelo fixado com o custo em comentário. O prompt
  codifica juízo de negócio real — nunca admitir responsabilidade legal, nunca
  oferecer compensação não pedida, agradecer, levar o negativo para o privado.
- **A melhor coisa lá dentro é um comentário a admitir um atalho** (a quota no
  `localStorage`, com o custo do abuso calculado). É argumento a favor de
  publicar, não contra.

**Bloqueio, a fechar antes de publicar:** o README promete que `api/.htaccess`
devolve 403 em `config.php` e `lib.php`. Esse ficheiro não está no repositório
e não está no servidor — `/api/config.php` responde **200**. Nada vaza hoje (o
corpo vem vazio porque o PHP executa e não imprime), mas toda a protecção é
"o PHP calha correr". Commit do `api/.htaccess`, deploy, confirmar 403, e só
depois tornar público.

---

## 2 · Arcade

Secção nova em `/`, com rota própria por máquina. Opção B: a app não corre na
homepage.

### Nome

**Arcade**, não "extra". Uma gaveta chamada extra enche-se de lixo; um arcade é
um sítio, e acrescentar máquinas a um arcade é diegético num café cibernético
Y2K. Entra em URLs, por isso fica decidido aqui.

### Estrutura

- `index.html`: `<section class="arcade" id="arcade">` entre projectos e sobre.
  Uma cabine desenhada, e dentro dela um baralho de cartões — um por máquina.
  **Custo na homepage: zero JavaScript novo no arranque.**
- `arcade/purikura/index.html`: a app portada. CSS e JS inline como estão, mais
  a moldura do site — voltar para `/#arcade`, rodapé, cursor de pixel via
  `js/work.js`.
- `assets/vendor/konva-9.3.16.min.js`: o Konva vem para dentro, fora do unpkg.
  O site deixa de depender de um CDN alheio e a página funciona se ele cair.
- As cinco fontes Google que a app usa ficam só nessa rota.

### A cabine e os cartões

Inspirada no ecrã de selecção de um arcade de dança. **Linguagem de género, não
cópia:** a forma, as setas em diagonal, a coverflow e o vocabulário de modos são
livres; o nome e o logótipo da Andamiro não entram. Mesma regra que o README do
yogurt aplica ao Orkut.

- Os cartões são uma `<ul>` de `<a>` reais. O CSS posiciona-os pelo índice
  activo: centro grande, vizinhos menores e inclinados.
- Setas do teclado e *swipe* mudam o índice. O Tab também: o cartão que recebe
  foco passa a activo, por isso teclado e coverflow nunca discordam.
- Transição com `steps()`, como todo o movimento do site — aqui o deslize aos
  saltos é a leitura certa. Silenciada por `prefers-reduced-motion`.
- **Os controlos de navegação só aparecem com mais do que um cartão**, e as abas
  de categoria só quando houver conteúdo que precise de ser categorizado. Uma
  máquina não justifica um seletor de categorias (YAGNI).

### Arte — restrições para quem desenha

- **A cabine inteira não cabe.** Enquadrar só o ecrã e o painel de controlo,
  como o CRT já faz na secretária. A cabine completa com o tapete deixaria o
  ecrã com cerca de 80px de altura num telemóvel de 393px.
- Desenhar para `border-image` (9-slice): cantos fixos, lados que repetem. Assim
  a moldura estica sem deformar em qualquer largura.

### Canalização

- `scripts/stamp-assets.mjs` estende-se às páginas de `/arcade/`, como se fez
  para os PDFs do CV. Sem isso, a página do arcade serve CSS do edge para
  sempre.
- O sitemap passa a incluir as páginas do arcade. Elas **não** são case
  studies: não levam `data-work-slug` e não entram no gerador de `/work/`.

### Testes

`tests/arcade.spec.js`:

- `/arcade/purikura/` responde 200, tem `<h1>` único, canonical correcto e zero
  erros de consola.
- O canvas monta (o Konva cria o stage).
- **Nenhum pedido a `unpkg.com`** — o Konva é local.
- A secção em `/` não carrega Konva nem o JS do editor.
- Com um cartão, os controlos de navegação não existem no DOM.

---

## Ordem

1. Case study do RespondaJá (conteúdo, zero arquitectura).
2. `api/.htaccess` no replycraft, deploy, confirmar 403, tornar público.
3. Arcade: rota e porte do purikura, Konva local, canalização, testes.
4. Cabine desenhada, quando a arte existir. A secção funciona sem ela.
