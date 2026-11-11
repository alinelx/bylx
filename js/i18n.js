/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx i18n — o site em português

   O HTML é escrito em inglês. Em modo PT este módulo troca cada texto (e os
   aria-label, placeholder, alt e title) pela tradução exata da tabela abaixo,
   e um MutationObserver traduz o que os scripts escrevem depois (estado do
   leitor de mp3, contagem de projetos, janelas fechadas…).

   Língua por omissão: a do sistema de quem visita (pt* → PT, o resto → EN).
   A escolha na engrenagem grava em localStorage e recarrega a página: assim
   não há nada para "destraduzir". O <head> põe data-lang e esconde o corpo até
   a tradução acabar (com um limite de 2 s, para nunca ficar em branco). */

export const LANG_KEY = "bylx:lang";
export const currentLang = () => document.documentElement.dataset.lang === "pt" ? "pt" : "en";

export function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* modo privado */ }
  location.reload();
}

const PT = {
  /* ---- interface ---- */
  "Skip to projects": "Saltar para os projetos",
  "Things I've built at this desk.": "Coisas que construí nesta secretária.",
  "Where the best cities share a desk.": "Onde as melhores cidades partilham uma secretária.",
  "I build web things that make you feel something. Pixel art, vanilla code, and AI-assisted workflows.": "Faço coisas para a web que fazem sentir alguma coisa. Pixel art, código simples e fluxos de trabalho com IA.",
  "See the work": "Ver o trabalho",
  "Try clicking the desk — the objects work.": "Experimenta clicar na secretária — os objetos funcionam.",
  "Projects": "Projetos",
  "All": "Todos", "Product": "Produto", "Client": "Cliente", "Tool": "Ferramenta",
  "LIVE": "NO AR", "OPEN SOURCE": "CÓDIGO ABERTO", "SHIPPED": "LANÇADO", "CLIENT WORK": "PARA CLIENTE",
  "Lisbon's Tram 28 reimagined as a dark tourism route — dictatorship, colonialism, and collective memory.": "O elétrico 28 de Lisboa reimaginado como rota de turismo sombrio — ditadura, colonialismo e memória coletiva.",
  "This portfolio — a pixel-art Y2K where Rio de Janeiro and Lisbon share a desk.": "Este portefólio — um Y2K em pixel art onde o Rio de Janeiro e Lisboa partilham uma secretária.",
  "Vanilla JS": "JS simples",
  "An open-source agent skill that answers one tax question Portuguese freelancers keep getting wrong.": "Uma skill de agente em código aberto que responde a uma pergunta de IRS em que os trabalhadores independentes em Portugal se enganam sempre.",
  "A review-reply assistant for local businesses: paste the review, pick a tone, get three replies in ten seconds.": "Um assistente de resposta a avaliações para negócios locais: cola a avaliação, escolhe um tom, recebe três respostas em dez segundos.",
  "Kawaii e-commerce brand built and run solo — store, payments, inventory, and identity.": "Marca kawaii de e-commerce criada e gerida sozinha — loja, pagamentos, stock e identidade.",
  "WordPress rebrand for a Lisbon optical clinic — from dated site to a storefront the owner can run.": "Rebranding em WordPress para uma ótica de Lisboa — de um site datado a uma montra que a dona consegue gerir.",
  "Some of it you can play.": "Algumas coisas dá para jogar.",
  "Not everything I build is a case study. A few are small machines that just run in a browser, and they live in here.": "Nem tudo o que faço é um case study. Algumas são pequenas máquinas que correm no browser, e moram aqui.",
  "Enter the arcade": "Entrar no arcade",
  "About": "Sobre",
  "The desk has a story.": "A secretária tem uma história.",
  "I'm Aline — a creative technologist built at the intersection of two cities. Brazil shaped how I see colour, texture, and warmth. Portugal taught me resilience, history, and how to start again and keep building. The desk you're looking at holds both.": "Sou a Aline — uma creative technologist feita no cruzamento de duas cidades. O Brasil moldou a forma como vejo a cor, a textura e o calor. Portugal ensinou-me resiliência, história e a recomeçar e continuar a construir. A secretária que estás a ver tem as duas.",
  "I work where creativity, product and code meet: I design things, build them, and use AI to bring them to life faster — illustration, brands, interfaces and the front-end behind them. On the web my default is HTML, CSS and vanilla JavaScript — not because I don't know frameworks (I do), but because starting from fundamentals means every abstraction I add is earned, not assumed.": "Trabalho onde a criatividade, o produto e o código se encontram: desenho coisas, construo-as e uso IA para lhes dar vida mais depressa — ilustração, marcas, interfaces e o front-end por trás delas. Na web, o meu ponto de partida é HTML, CSS e JavaScript simples — não por não conhecer frameworks (conheço), mas porque começar pelos fundamentos faz com que cada abstração que acrescento seja merecida, não presumida.",
  "This site is the work. The attention to detail you find here — the objects you can click, the day and night palettes, the two skylines outside the window — is the same attention I bring to everything I build.": "Este site é o trabalho. A atenção ao detalhe que encontras aqui — os objetos em que podes clicar, as paletas de dia e de noite, as duas cidades lá fora — é a mesma que ponho em tudo o que faço.",
  "Open to creative tech, product/UI design, front-end and AI content work": "Disponível para trabalho em creative tech, design de produto/UI, front-end e conteúdo com IA",
  "— based in Lisbon (WET/CET), hybrid or remote, Portuguese and EU citizen, working in Portuguese and English. Freelance or employed.": "— em Lisboa (WET/CET), híbrido ou remoto, cidadã portuguesa e da UE, a trabalhar em português e inglês. Freelance ou por conta de outrem.",
  "Get in touch": "Fala comigo",
  "Credentials": "Formação e certificados",
  "BSc Software Engineering · GPA 9.80/10 · in progress": "Licenciatura em Engenharia de Software · média 9,80/10 · em curso",
  "Google Data Analytics Certificate · Google / Coursera · 2024": "Certificado Google Data Analytics · Google / Coursera · 2024",
  "CET Cultural Tourism & Heritage · EHTL Lisboa · EQF 5 · internship pending": "CET Turismo Cultural e Património · EHTL Lisboa · QEQ 5 · estágio pendente",
  "Verified badges · Cisco IT Support track": "Badges verificados · percurso Cisco IT Support",
  "Currently fluent in": "Fluente em",
  "Instagram": "Instagram",
  "© 2026 Aline Lopes Xavier · Built with vanilla HTML, CSS & JS.": "© 2026 Aline Lopes Xavier · Feito com HTML, CSS e JS simples.",

  /* ---- case studies: comum ---- */
  "The question": "A pergunta", "What I built": "O que construí", "Technical decisions": "Decisões técnicas", "What I learned": "O que aprendi",
  "Code on GitHub ↗": "Código no GitHub ↗",
  "Dark28 — Case Study": "Dark28 — Case study", "bylx.dev — Case Study": "bylx.dev — Case study", "irs-pt — Case Study": "irs-pt — Case study",
  "respondaja.click — Case Study": "respondaja.click — Case study", "konochan.pt — Case Study": "konochan.pt — Case study", "luparoad.com — Case Study": "luparoad.com — Case study",

  /* dark28 */
  "Lisbon's Tram 28 passes through layers of history that most tourist guides ignore. I kept finding apps that told the same polished story and skipped the uncomfortable parts — the dictatorship, the colonial memory, the religious weight embedded in the architecture. What if a route helped you understand a city instead of just photograph it?": "O elétrico 28 de Lisboa atravessa camadas de história que a maioria dos guias turísticos ignora. Encontrava sempre apps que contavam a mesma história polida e saltavam as partes incómodas — a ditadura, a memória colonial, o peso religioso entranhado na arquitetura. E se uma rota te ajudasse a perceber uma cidade em vez de só a fotografar?",
  "An editorial web app that transforms the Tram 28 into a self-guided dark tourism experience. Users discover landmarks filtered by historical theme, read narrative context for each stop, and build a personal plan of places to visit and track.": "Uma web app editorial que transforma o elétrico 28 numa experiência de turismo sombrio autoguiada. Quem a usa descobre pontos de interesse filtrados por tema histórico, lê o contexto de cada paragem e monta um plano pessoal de sítios a visitar e a marcar.",
  "Editorial homepage with thematic framing": "Página inicial editorial com enquadramento temático",
  "Landmark discovery by theme (dictatorship, colonialism, religion, death)": "Descoberta de pontos de interesse por tema (ditadura, colonialismo, religião, morte)",
  "Detail pages with narrative context per stop": "Páginas de detalhe com contexto narrativo por paragem",
  "Save landmarks and track visited places": "Guardar pontos de interesse e marcar os sítios visitados",
  "Route direction toggle and dark/light theme": "Troca do sentido da rota e tema claro/escuro",
  "Fully responsive, mobile-first": "Totalmente responsivo, pensado primeiro para telemóvel",
  "— editorial content needs good SEO and fast initial load. Server components simplified data fetching and nested layouts.": "— conteúdo editorial precisa de bom SEO e de um primeiro carregamento rápido. Os server components simplificaram a obtenção de dados e os layouts encadeados.",
  "TypeScript throughout": "TypeScript em todo o lado",
  "— enforced clear data contracts between components and caught two broken data shapes before they hit the UI.": "— impôs contratos de dados claros entre componentes e apanhou duas estruturas de dados partidas antes de chegarem à interface.",
  "— rapid iteration on a content-heavy interface without fighting specificity. Consistent spacing without thinking about it.": "— iteração rápida numa interface cheia de conteúdo sem lutar contra a especificidade. Espaçamentos consistentes sem pensar nisso.",
  "localStorage + custom hooks": "localStorage + hooks próprios",
  "— one": "— um único",
  "hook persisted all user state across four features with no backend required.": "guardou todo o estado de quem usa a app em quatro funcionalidades, sem backend.",
  "Designing content-first changes the UI. The narrative weight of each stop shaped the information hierarchy — generic card components didn't work because the content resisted being genericised. TypeScript caught real bugs, not theoretical ones. App Router's server/client boundary required rethinking where state lives.": "Desenhar a partir do conteúdo muda a interface. O peso narrativo de cada paragem moldou a hierarquia da informação — componentes de cartão genéricos não funcionaram porque o conteúdo resistia a ser genérico. O TypeScript apanhou bugs reais, não teóricos. A fronteira servidor/cliente do App Router obrigou a repensar onde vive o estado.",
  "Open dark28.pt ↗": "Abrir dark28.pt ↗",

  /* bylx.dev */
  "Developer portfolios all look the same: hero, grid, footer. Mine had to prove something instead of claiming it. Could a pixel-art desk — where Rio de Janeiro and Lisbon share a window — carry an entire portfolio, built with nothing but the fundamentals?": "Os portefólios de developers são todos iguais: hero, grelha, rodapé. O meu tinha de provar alguma coisa em vez de a afirmar. Podia uma secretária em pixel art — onde o Rio de Janeiro e Lisboa partilham uma janela — aguentar um portefólio inteiro, feito só com os fundamentos?",
  "An interactive scene where every object does what it looks like it should: the camera opens the gallery, the phone opens the contact form, the MP3 player opens a working player, the cocktail tells the story of the two cities, and the sushi tray explains how the desk was drawn.": "Uma cena interativa onde cada objeto faz o que parece que devia fazer: a câmara abre a galeria, o telemóvel abre o formulário de contacto, o leitor de MP3 abre um leitor que funciona, o cocktail conta a história das duas cidades e o tabuleiro de sushi explica como a secretária foi desenhada.",
  "Canvas pixel-art scene on a 640×390 grid, always drawn at a whole-number scale": "Cena em pixel art num canvas, numa grelha de 640×390, sempre desenhada a escala inteira",
  "Every sprite drawn once in greyscale and recoloured into a day (AM) and a night (PM) palette, plus a 3-bit grey mode": "Cada sprite desenhado uma vez em cinzentos e recolorido numa paleta de dia (AM) e de noite (PM), mais um modo 3-bit em cinzento",
  "Sections as program windows you can minimise, maximise, close and drag": "Secções como janelas de programa que dá para minimizar, maximizar, fechar e arrastar",
  "Custom pixel cursor with sakura-petal trail": "Cursor de pixel com rasto de pétalas de sakura",
  "Working MP3 player with a 17-track lo-fi playlist": "Leitor de MP3 que funciona, com 17 faixas lo-fi",
  "PHP contact form with honeypot and graceful non-JS fallback": "Formulário de contacto em PHP com honeypot e alternativa sem JavaScript",
  "Keyboard-accessible case-study modals": "Case studies acessíveis por teclado",
  "Vanilla ES modules": "Módulos ES simples",
  "— scene, windows, theme, cursor, audio, modals and forms are isolated modules with a single init each. There is nothing to hydrate, so a framework would only add weight.": "— cena, janelas, tema, cursor, áudio, modais e formulários são módulos isolados, cada um com um único init. Não há nada para hidratar, por isso uma framework só acrescentaria peso.",
  "Greyscale in, palettes out": "Entram cinzentos, saem paletas",
  "— a small build script maps each grey level of every sprite to one of seven colours per theme, so a new palette is a JSON change, not a redraw. Clickable objects are real buttons laid over the canvas, so the scene stays keyboard- and screen-reader-accessible.": "— um pequeno script de build faz corresponder cada nível de cinzento de cada sprite a uma de sete cores por tema, por isso uma paleta nova é uma alteração num JSON, não um desenho novo. Os objetos clicáveis são botões reais por cima do canvas, por isso a cena continua acessível por teclado e leitor de ecrã.",
  "Seven colours per mode": "Sete cores por modo",
  "— the whole site, not just the scene, uses only the seven colours of the active palette, through role tokens in": "— o site inteiro, não só a cena, usa apenas as sete cores da paleta ativa, através de tokens de função em",
  "Pixel-crisp motion": "Movimento ao pixel",
  "— the opening moves layers in whole-pixel steps, and it is skipped entirely when the system asks for reduced motion.": "— a abertura move as camadas em passos de um pixel inteiro, e é saltada por completo quando o sistema pede menos movimento.",
  "Constraints are a design system. Refusing frameworks forced clean module boundaries; refusing smooth easing forced intentional animation. And accessibility inside a fully custom scene — focus states, aria labels, a form that works without JS — is where the real engineering happened.": "Restrições são um design system. Recusar frameworks obrigou a fronteiras limpas entre módulos; recusar transições suaves obrigou a animação intencional. E a acessibilidade dentro de uma cena feita à medida — estados de foco, aria labels, um formulário que funciona sem JS — foi onde aconteceu a verdadeira engenharia.",

  /* irs-pt */
  "Python (stdlib only)": "Python (só stdlib)",
  "Every freelancer in Portugal asks the same thing in March: is it worth assigning this invoice to my activity? I could not find an answer that started with the arithmetic instead of the portal. Under the": "Todos os trabalhadores independentes em Portugal fazem a mesma pergunta em março: vale a pena atribuir esta fatura à minha atividade? Não encontrei nenhuma resposta que começasse pelas contas em vez de pelo portal. No",
  "the answer is close to binary — expenses only matter once 15% of gross service income passes the automatic deduction — and almost nobody is told that before they start classifying receipts one by one.": "a resposta é quase binária — as despesas só contam quando 15% do rendimento bruto de serviços ultrapassa a dedução automática — e quase ninguém ouve isto antes de começar a classificar faturas uma a uma.",
  "An open-source assistant packaged as an agent skill: it runs inside Claude and any agent that reads the agentskills format, asks two or three questions, and does the threshold maths before it mentions invoices at all. It explains, calculates and recommends — it never submits anything to the Portal das Finanças.": "Um assistente em código aberto empacotado como skill de agente: corre dentro do Claude e de qualquer agente que leia o formato agentskills, faz duas ou três perguntas e faz as contas do limiar antes de sequer falar em faturas. Explica, calcula e recomenda — nunca submete nada no Portal das Finanças.",
  "Works out the year's threshold first and says, in one sentence, whether invoices change anything": "Calcula primeiro o limiar do ano e diz, numa frase, se as faturas mudam alguma coisa",
  "Handles mixed activity (sales, services, other services) and income on top of a salaried job": "Trata atividade mista (vendas, serviços, outros serviços) e rendimentos além de um emprego por conta de outrem",
  "Reads the e-Fatura CSV export locally and proposes a classification invoice by invoice": "Lê localmente o CSV exportado do e-Fatura e propõe uma classificação fatura a fatura",
  "Shows a preview and asks for confirmation before listing what to click in the portal": "Mostra uma pré-visualização e pede confirmação antes de dizer onde clicar no portal",
  "Ends with one next action and the year's deadlines": "Termina com uma próxima ação e os prazos do ano",
  "The maths before the portal": "As contas antes do portal",
  "— the whole point is the question nobody answers first. Getting the order right is the product; the parser is the easy half.": "— o essencial é a pergunta a que ninguém responde primeiro. Acertar na ordem é o produto; o parser é a metade fácil.",
  "Python with no dependencies": "Python sem dependências",
  "is stdlib only and reads the CSV on your own machine. Tax data does not leave the computer, and there is nothing to install or trust.": "usa só a stdlib e lê o CSV no teu próprio computador. Os dados fiscais não saem do computador, e não há nada para instalar nem em que confiar.",
  "Volatile values in one file": "Valores voláteis num só ficheiro",
  "— IAS, thresholds and deadlines live in": "— IAS, limiares e prazos vivem em",
  ", apart from the structural rules that do not change every year. Updating for a new tax year is one file, not a hunt.": ", separados das regras estruturais que não mudam todos os anos. Atualizar para um novo ano fiscal é um ficheiro, não uma caça ao tesouro.",
  "The human clicks": "Quem clica é a pessoa",
  "— it is not tax advice, and it does not act. The line between \"explains\" and \"submits\" is the safety property; it is written into the skill's inviolable rules, not just the README.": "— não é aconselhamento fiscal, e não age. A linha entre \"explica\" e \"submete\" é a garantia de segurança; está escrita nas regras invioláveis da skill, não só no README.",
  "Writing software for a rule someone else wrote means reading the primary source: the CIRS articles, not the blog posts about them. And shipping something in public with \"tested by one person — her own return\" on the label is a different kind of honesty than a portfolio demo, because strangers rely on it.": "Escrever software para uma regra que outra pessoa escreveu obriga a ler a fonte: os artigos do CIRS, não os posts sobre eles. E publicar algo com \"testado por uma pessoa — na sua própria declaração\" no rótulo é um tipo de honestidade diferente de uma demo de portefólio, porque há desconhecidos a contar com isso.",

  /* respondaja */
  "A one-star review lands on a Sunday night. The right reply is not hard to write — thank them, acknowledge the problem briefly, invite them to continue in private, stay under eighty words, never admit liability. It is just that it takes twenty minutes, it comes out the same every time, and the person who runs a restaurant is not a copywriter. So why twenty minutes?": "Chega uma avaliação de uma estrela num domingo à noite. A resposta certa não é difícil de escrever — agradecer, reconhecer o problema em poucas palavras, convidar a continuar em privado, ficar abaixo das oitenta palavras, nunca assumir culpa. Só que demora vinte minutos, sai sempre igual, e quem gere um restaurante não é copywriter. Então porquê vinte minutos?",
  "Paste the review — Google, iFood, TripAdvisor, anywhere — choose one of three tones, and get three replies in about ten seconds. Edit and publish wherever it came from. Five a month for free with no account at all; unlimited on a Pro tier at R$ 29 a month through Stripe. Portuguese and English. The market is Brazil.": "Cola a avaliação — Google, iFood, TripAdvisor, onde for —, escolhe um de três tons e recebe três respostas em cerca de dez segundos. Edita e publica onde ela apareceu. Cinco por mês grátis, sem conta nenhuma; ilimitado no plano Pro a R$ 29 por mês, pagos pelo Stripe. Português e inglês. O mercado é o Brasil.",
  "Three options rather than one, because the useful part is choosing": "Três opções em vez de uma, porque a parte útil é escolher",
  "The rules of the trade live in the prompt: thank, acknowledge, take it offline, under eighty words, never admit liability, never offer compensation the review did not ask for": "As regras do ofício vivem no prompt: agradecer, reconhecer, levar a conversa para privado, menos de oitenta palavras, nunca assumir culpa, nunca oferecer compensação que a avaliação não pediu",
  "The free tier runs in the browser with no signup screen anywhere": "O plano grátis corre no browser sem ecrã de registo em lado nenhum",
  "Pro cancels from Stripe’s own portal — no cancellation flow to build, and none to make deliberately hard": "O Pro cancela-se no próprio portal do Stripe — não há fluxo de cancelamento para construir, nem nenhum feito para ser difícil",
  "No account on the free tier": "Sem conta no plano grátis",
  "— what kills a tool like this is the signup screen, not the price. The free path never asks for an email, so the distance between pasting a review and having three replies is one click.": "— o que mata uma ferramenta destas é o ecrã de registo, não o preço. O caminho grátis nunca pede um e-mail, por isso entre colar uma avaliação e ter três respostas vai um clique.",
  "The key never reaches the browser": "A chave nunca chega ao browser",
  "— generation happens server-side. That is also the only reason a quota can exist at all: anything counted in the browser is a suggestion, not a limit.": "— a geração acontece no servidor. É também a única razão para poder existir uma quota: tudo o que é contado no browser é uma sugestão, não um limite.",
  "Pro is a signed token, not a user table": "O Pro é um token assinado, não uma tabela de utilizadores",
  "— after checkout the server verifies the session with Stripe and issues an HMAC-signed licence with an expiry. No accounts, no passwords, no personal data to protect, nothing to leak. The signature is compared with": "— depois do pagamento, o servidor confirma a sessão com o Stripe e emite uma licença assinada com HMAC e com validade. Sem contas, sem palavras-passe, sem dados pessoais para proteger, nada para fugir. A assinatura é comparada com",
  ", so a wrong one takes exactly as long to reject as a right one takes to accept.": ", por isso rejeitar uma errada demora exatamente o mesmo que aceitar uma certa.",
  "The free count is client-side on purpose, and the code says so": "A contagem grátis está no browser de propósito, e o código di-lo",
  "— an abused free call costs about a tenth of a cent, so per-IP hardening was priced and postponed rather than pretended. That reasoning is a comment in the repository, not a secret.": "— um pedido grátis abusado custa cerca de uma décima de cêntimo, por isso a proteção por IP foi orçamentada e adiada em vez de fingida. Esse raciocínio está num comentário no repositório, não é segredo.",
  "It is finished. The payment path runs end to end — checkout, verification, licence, renewal — and it has never taken a single payment, because I never told anyone it existed. Building was the easy half, and it is the half I am good at. The lesson is not about code: from the outside, a product nobody has heard of and a product that does not work look exactly the same.": "Está acabado. O caminho de pagamento funciona de ponta a ponta — checkout, verificação, licença, renovação — e nunca recebeu um único pagamento, porque nunca contei a ninguém que existia. Construir foi a metade fácil, e é a metade em que sou boa. A lição não é sobre código: vistos de fora, um produto de que ninguém ouviu falar e um produto que não funciona são exatamente iguais.",
  "Open respondaja.click ↗": "Abrir respondaja.click ↗",

  /* konochan */
  "Could I take a brand from zero to real orders — not a portfolio mockup, but a shop with actual customers, payments, and parcels that have to arrive?": "Conseguia levar uma marca do zero a encomendas reais — não um mockup de portefólio, mas uma loja com clientes de verdade, pagamentos e encomendas que têm de chegar?",
  "A kawaii and handmade-resin e-commerce brand, built and operated solo: visual identity, product catalogue, checkout, and everything that happens after someone pays.": "Uma marca de e-commerce kawaii e de peças em resina feitas à mão, criada e gerida sozinha: identidade visual, catálogo, checkout e tudo o que acontece depois de alguém pagar.",
  "Full store setup on Hostinger, from DNS to checkout": "Loja completa montada na Hostinger, do DNS ao checkout",
  "Stripe and MB Way payment integration for the Portuguese market": "Pagamentos com Stripe e MB Way para o mercado português",
  "WhatsApp integration for order support and customer contact": "WhatsApp para apoio às encomendas e contacto com clientes",
  "Brand identity, product photography, and packaging design": "Identidade da marca, fotografia de produto e design de embalagens",
  "Inventory, pricing, and customer support operations": "Gestão de stock, preços e apoio ao cliente",
  "Platform over custom code": "Plataforma em vez de código à medida",
  "— the goal was a working shop, not a stack demo. Hostinger shipped the store in weeks instead of months.": "— o objetivo era uma loja a funcionar, não uma demonstração de stack. Com a Hostinger a loja ficou pronta em semanas em vez de meses.",
  "Local payment rails": "Pagamentos locais",
  "— MB Way is how Portugal actually pays online. Supporting it mattered more than any feature.": "— o MB Way é como Portugal paga mesmo online. Aceitá-lo importou mais do que qualquer funcionalidade.",
  "WhatsApp as CRM": "WhatsApp como CRM",
  "— customers already live there; meeting them in their channel beat building one.": "— os clientes já vivem lá; ir ter com eles ao canal deles foi melhor do que construir um.",
  "E-commerce is UX plus logistics — the interface is the easy half. Running the store taught me what \"done\" means when customers are real. The shop is open again since October 2026, now with pieces made to order and an Etsy store alongside it.": "E-commerce é UX mais logística — a interface é a metade fácil. Gerir a loja ensinou-me o que é \"pronto\" quando os clientes são reais. A loja voltou a abrir em outubro de 2026, agora com peças por encomenda e uma loja no Etsy ao lado.",
  "Open konochan.pt ↗": "Abrir konochan.pt ↗",

  /* luparoad */
  "A Lisbon optical clinic had a website that undersold the business — dated, hard to navigate, and impossible for the owner to update. How do you rebuild trust online for a business whose whole trade is precision?": "Uma ótica de Lisboa tinha um site que vendia mal o negócio — datado, difícil de navegar e impossível de atualizar pela dona. Como se reconstrói a confiança online de um negócio cujo ofício é a precisão?",
  "A full WordPress rebrand: new visual identity applied to a restructured site, designed so the owner can maintain it without calling a developer.": "Um rebranding completo em WordPress: nova identidade visual num site reestruturado, pensado para a dona o manter sem chamar um developer.",
  "Theme customisation aligned with the new brand": "Tema personalizado de acordo com a nova marca",
  "Restructured content and navigation around what customers ask first": "Conteúdo e navegação reorganizados à volta do que os clientes perguntam primeiro",
  "Plugin selection and configuration kept deliberately minimal": "Plugins escolhidos e configurados no mínimo, de propósito",
  "Responsive layout and performance cleanup": "Layout responsivo e limpeza de desempenho",
  "Handover so the client edits content independently": "Passagem de testemunho para a cliente editar o conteúdo sozinha",
  "WordPress, on purpose": "WordPress, de propósito",
  "— the client needs to edit content themselves. The right stack is the one the business can maintain after you leave.": "— a cliente precisa de editar o conteúdo ela própria. A stack certa é a que o negócio consegue manter depois de saíres.",
  "Fewer plugins, fewer problems": "Menos plugins, menos problemas",
  "— every plugin is a future update, a security surface, and a support call. The build stayed lean.": "— cada plugin é uma atualização futura, uma superfície de ataque e uma chamada de suporte. O site ficou enxuto.",
  "Client work is a different discipline: listening before building, designing within the client's capacity, and writing handover docs as carefully as code. The best compliment was silence — the site just works.": "Trabalhar para clientes é outra disciplina: ouvir antes de construir, desenhar dentro do que a cliente consegue gerir e escrever a documentação de entrega com o mesmo cuidado que o código. O melhor elogio foi o silêncio — o site simplesmente funciona.",
  "Open luparoad.com ↗": "Abrir luparoad.com ↗",

  /* duas cidades */
  "Two cities": "Duas cidades",
  "Look out of the window behind the monitor. Cristo Redentor and Pão de Açúcar stand on one side of it; the Ponte 25 de Abril and the Torre de Belém on the other. That is not a mixed metaphor that got away from me — it is the whole point of the desk.": "Olha pela janela atrás do monitor. O Cristo Redentor e o Pão de Açúcar estão de um lado; a Ponte 25 de Abril e a Torre de Belém do outro. Não é uma metáfora que me fugiu — é a razão de ser da secretária.",
  "What Rio gave me": "O que o Rio me deu",
  "Colour, texture, warmth, and the nerve to use all three at once. I studied Design & Visual Communication at UFRJ's Escola de Belas Artes, in a city where nothing is beige. The palette on this site — the cyan, the pink, the purple that has no business working next to either — is a Rio palette. So is the instinct that a portfolio should be somewhere you want to stay, not a document you scroll.": "Cor, textura, calor e a coragem de usar os três ao mesmo tempo. Estudei Design e Comunicação Visual na Escola de Belas Artes da UFRJ, numa cidade onde nada é bege. A paleta deste site — o ciano, o rosa, o roxo que não tinha nada que resultar ao lado deles — é uma paleta do Rio. Tal como a ideia de que um portefólio deve ser um sítio onde apetece ficar, não um documento para rolar.",
  "What Lisbon taught me": "O que Lisboa me ensinou",
  "Resilience — how to start again in a new country and keep building. I took a CET in Cultural Tourism & Heritage here, which is a formal way of saying I learned to read a place. dark28.pt came out of that — a dark-tourism route along Tram 28, written for people standing at the stop. konochan.pt is run from a flat in Greater Lisbon, and my five years at Accenture happened here too.": "Resiliência — recomeçar num país novo e continuar a construir. Tirei aqui um CET em Turismo Cultural e Património, que é uma forma formal de dizer que aprendi a ler um lugar. O dark28.pt nasceu daí — uma rota de turismo sombrio ao longo do elétrico 28, escrita para quem está na paragem. A konochan.pt é gerida a partir de uma casa na Grande Lisboa, e os meus cinco anos na Accenture também aconteceram aqui.",

  /* como foi desenhada */
  "How this desk was drawn": "Como esta secretária foi desenhada",
  "Every object on this desk was drawn by hand in shades of grey, laid out in a Photoshop file, and coloured by code. This is how.": "Cada objeto desta secretária foi desenhado à mão em tons de cinzento, arrumado num ficheiro de Photoshop e colorido por código. É assim.",
  "Drawn in grey": "Desenhado em cinzento",
  "Each sprite is drawn once, in seven levels of grey. Light and shadow are decided before colour exists, so a drawing never has to be redone when the palette changes. The 3BIT button in the settings shows you the desk exactly as it was drawn.": "Cada sprite é desenhado uma vez, em sete níveis de cinzento. A luz e a sombra decidem-se antes de a cor existir, por isso um desenho nunca tem de ser refeito quando a paleta muda. O botão 3BIT nas definições mostra a secretária exatamente como foi desenhada.",
  "Coloured by code": "Colorido por código",
  "A small build script maps every grey to one of seven colours per mode: PM runs from deep purple to pink, AM from navy to mint. In AM the walls, the hills, the bridge, the Sugarloaf and the Belém tower flip their scale, so daylight reads as daylight. The rest of the site uses the same seven colours, so the page and the desk never disagree.": "Um pequeno script de build faz corresponder cada cinzento a uma de sete cores por modo: o PM vai do roxo escuro ao rosa, o AM do azul-marinho ao menta. Em AM, as paredes, os morros, a ponte, o Pão de Açúcar e a Torre de Belém invertem a escala, para o dia parecer dia. O resto do site usa as mesmas sete cores, por isso a página e a secretária nunca discordam.",
  "Placed by hand": "Arrumado à mão",
  "The scene is a 640×390 grid, and every position is copied from the Photoshop file where the desk was arranged. It is drawn on a canvas at whole-number scale only — 2×, 3×, 4× — so one pixel of the art is always a clean square on your screen, never a blur. On a phone you see the same desk, cropped around the monitor.": "A cena é uma grelha de 640×390, e cada posição foi copiada do ficheiro de Photoshop onde a secretária foi arrumada. É desenhada num canvas só a escala inteira — 2×, 3×, 4× — por isso um pixel do desenho é sempre um quadrado limpo no teu ecrã, nunca uma mancha. No telemóvel vês a mesma secretária, recortada à volta do monitor.",
  "The rules": "As regras",
  "Motion moves in whole pixels: the desk assembles itself once when the page opens, and the monitor's power light blinks slowly, because a real one would. Both stop when your system or the settings ask for reduced motion. The objects you can click are real buttons laid over the drawing, so the desk works with a keyboard and a screen reader, not just a mouse.": "O movimento anda em pixels inteiros: a secretária monta-se uma vez quando a página abre, e a luz do monitor pisca devagar, como faria uma a sério. As duas coisas param quando o sistema ou as definições pedem menos movimento. Os objetos em que podes clicar são botões reais por cima do desenho, por isso a secretária funciona com teclado e leitor de ecrã, não só com rato.",
  "The parts": "As peças",
  "Twenty-nine sprites, two seven-colour palettes, seventeen lo-fi tracks the mp3 player genuinely streams, and a single dependency in the whole project — which only runs the tests. No framework; the only build step turns the grey sprites into palettes. The windows you can drag around are plain HTML with a two-pixel border.": "Vinte e nove sprites, duas paletas de sete cores, dezassete faixas lo-fi que o leitor de mp3 toca mesmo, e uma única dependência no projeto inteiro — que só corre os testes. Nenhuma framework; o único passo de build transforma os sprites cinzentos em paletas. As janelas que podes arrastar são HTML simples com uma borda de dois pixels.",

  /* galeria, contacto, leitor */
  "Gallery": "Galeria",
  "A scratch pad of pixel-art studies — Rio, Lisboa, Tokyo, and the things in between.": "Um caderno de estudos em pixel art — Rio, Lisboa, Tóquio e o que fica pelo meio.",
  "digital mp3 player": "leitor de mp3", "candybar phone": "telemóvel de teclas", "mechanical keyboard": "teclado mecânico", "sushi tray": "tabuleiro de sushi",
  "Contact": "Contacto", "Name": "Nome", "Email": "E-mail", "Message": "Mensagem", "Website": "Site", "Send": "Enviar", "Sending…": "A enviar…",
  "None": "Nenhuma", "PLAY": "TOCAR", "PAUSE": "PAUSA", "CLICK NEXT · DBLCLICK PREV": "CLIQUE SEGUINTE · DUPLO ANTERIOR",

  /* arcade */
  "Not everything I build is a case study. These are small machines that just run — no account, no upload, nothing leaves your browser.": "Nem tudo o que faço é um case study. Estas são pequenas máquinas que simplesmente correm — sem conta, sem uploads, nada sai do teu browser.",
  "Cute Gal · photo booth editor": "Cute Gal · editor de fotos tipo purikura",
  "A photo booth in a browser: stickers, frames, outlined text, a brush with undo, and filters. Vanilla JavaScript and Konva.": "Uma cabine de fotos no browser: autocolantes, molduras, texto com contorno, um pincel com desfazer e filtros. JavaScript simples e Konva.",
  "A tarot table and a manual: 78 cards with the Greek myth behind each one, 22 spreads from one card to thirteen, and a reading you can save as PDF. Vanilla JavaScript, no dependencies at all.": "Uma mesa de tarot e um manual: 78 cartas com o mito grego por trás de cada uma, 22 tiragens de uma a treze cartas e uma leitura que podes guardar em PDF. JavaScript simples, sem dependências nenhumas.",
  "← back to the portfolio": "← voltar ao portefólio",
  "work": "trabalho", "back": "voltar", "More work": "Mais trabalho",

  /* atributos (aria-label, alt, title) */
  "Open: two cities": "Abrir: duas cidades", "Open: how this desk was drawn": "Abrir: como a secretária foi desenhada",
  "Open image gallery": "Abrir a galeria", "Open contact form": "Abrir o formulário de contacto", "Open music player": "Abrir o leitor de música",
  "Turn monitor off": "Desligar o monitor", "Turn monitor on": "Ligar o monitor",
  "Minimize intro": "Minimizar a apresentação", "Close intro": "Fechar a apresentação", "Close tip": "Fechar a dica",
  "Filter projects by kind": "Filtrar projetos por tipo", "Close case study": "Fechar o case study",
  "dark28.pt: the route's home page, a skull mark on ochre above a dark hero — “Lisbon's Dark Cultural Heritage Route”.": "dark28.pt: a página inicial da rota, uma caveira sobre ocre por cima de um hero escuro — “Lisbon's Dark Cultural Heritage Route”.",
  "bylx.dev: the pixel-art desk, with the Win98 window open on a Paint file and the stack icons beside it.": "bylx.dev: a secretária em pixel art, com a janela no ecrã e os ícones da stack ao lado.",
  "The irs-pt README on GitHub, opening with what the skill is and what it explicitly does not do.": "O README do irs-pt no GitHub, a abrir com o que a skill é e o que explicitamente não faz.",
  "respondaja.click: paste the review, pick a tone, get three replies — the form above the fold, no sign-up.": "respondaja.click: cola a avaliação, escolhe um tom, recebe três respostas — o formulário logo à vista, sem registo.",
  "konochan.pt: the shop front, free-shipping bar, the hand-drawn mascot and the new-arrivals listing.": "konochan.pt: a montra da loja, a barra de portes grátis, a mascote desenhada à mão e as novidades.",
  "luparoad.com: the rebuilt storefront, a campaign video above the product gallery and the frame colours.": "luparoad.com: a nova montra, um vídeo de campanha por cima da galeria de produtos e as cores das armações.",
  "Close": "Fechar", "Close gallery": "Fechar a galeria",
  "Pixel-art poster of Japan: Mount Fuji under cherry blossom": "Poster do Japão em pixel art: o monte Fuji sob as cerejeiras em flor",
  "The CRT wallpaper: a pixel-art hillside under a wide sky": "O fundo do ecrã CRT: uma encosta em pixel art sob um céu largo",
  "Pixel-art Cristo Redentor above the hills of Rio": "O Cristo Redentor em pixel art sobre os morros do Rio",
  "Pixel-art Sugarloaf mountain over Guanabara bay": "O Pão de Açúcar em pixel art sobre a baía de Guanabara",
  "Pixel-art Ponte 25 de Abril in Lisbon": "A Ponte 25 de Abril em pixel art, em Lisboa",
  "Pixel-art Torre de Belém on the Tagus": "A Torre de Belém em pixel art, no Tejo",
  "Pixel-art CRT monitor, the centrepiece of the desk": "Monitor CRT em pixel art, a peça central da secretária",
  "Pixel-art instant camera": "Câmara instantânea em pixel art",
  "Pixel-art stick MP3 player with an LCD screen": "Leitor de MP3 em pixel art com ecrã LCD",
  "Pixel-art candybar phone with a keypad": "Telemóvel de teclas em pixel art",
  "Pixel-art mechanical keyboard, keys only": "Teclado mecânico em pixel art, só as teclas",
  "Pixel-art coupe glass with cherries": "Taça de cocktail em pixel art com cerejas",
  "Pixel-art sushi board with chopsticks": "Tabuleiro de sushi em pixel art com pauzinhos",
  "Pixel-art hillside seen through the window": "Morro em pixel art visto pela janela",
  "Gallery viewer": "Visualizador da galeria", "Close viewer": "Fechar o visualizador", "Previous piece": "Peça anterior", "Next piece": "Peça seguinte",
  "Close contact form": "Fechar o formulário de contacto", "Music player": "Leitor de música", "Close music player": "Fechar o leitor de música",
  "Play": "Tocar", "Pause": "Pausa", "Next track (double-click for previous)": "Faixa seguinte (duplo clique para a anterior)", "Volume down": "Baixar o volume", "Volume up": "Subir o volume",
  "Social links": "Redes", "Breadcrumb": "Caminho", "Previous machine": "Máquina anterior", "Next machine": "Máquina seguinte", "Mythic Tarot": "Tarot Mitológico",
  "Back to all work": "Voltar a todo o trabalho", "Other case studies": "Outros case studies",
  "Switch to AM (light mode)": "Mudar para AM (modo claro)", "Switch to PM (dark mode)": "Mudar para PM (modo escuro)",

  /* engrenagem */
  "SETTINGS": "DEFINIÇÕES", "Settings": "Definições", "Close settings": "Fechar as definições",
  "Time": "Hora", "Colour": "Cor", "Text size": "Tamanho do texto", "Motion": "Movimento", "Language": "Língua",
  "REDUCE": "REDUZIR", "SYSTEM": "SISTEMA", "Smaller text": "Texto mais pequeno", "Larger text": "Texto maior",

  /* bolhas dos ícones do monitor */
  "Markup, semantics first.": "Marcação, semântica primeiro.", "Pixel-perfect layout & motion.": "Layout e movimento ao pixel.",
  "Interactivity & DOM.": "Interatividade e DOM.", "Types when the stakes are real.": "Tipos quando a coisa é a sério.",
  "Component-driven UI.": "Interfaces feitas de componentes.", "Server-side & tooling.": "Servidor e ferramentas.",
  "UX & design specs.": "UX e especificações de design.", "CMS for content sites.": "CMS para sites de conteúdo.",

  /* formulário */
  "> transmitting…": "> a transmitir…",
  "> message sent ✓ check your inbox for confirmation.": "> mensagem enviada ✓ vê a confirmação no teu e-mail.",
  "> that submission did not come from bylx.dev ✗": "> esse envio não veio do bylx.dev ✗",
  "> too many messages from here in the last hour ✗ try later or email geral@bylx.dev": "> demasiadas mensagens daqui na última hora ✗ tenta mais tarde ou escreve para geral@bylx.dev",
  "> name, email and message are all required ✗": "> nome, e-mail e mensagem são obrigatórios ✗",
  "> that email address does not look right ✗": "> esse e-mail não parece certo ✗",
  "> that message is longer than the form accepts ✗": "> a mensagem é maior do que o formulário aceita ✗",
  "> transmission failed ✗ try again or email geral@bylx.dev": "> o envio falhou ✗ tenta outra vez ou escreve para geral@bylx.dev",
};

/* Textos que os scripts montam com números ou nomes */
const KIND = { product: "produto", client: "cliente", tool: "ferramenta", design: "design" };
const t = (s) => PT[s] ?? s;
const PATTERNS = [
  [/^(\d+) projects?$/, (_, n) => `${n} ${n === "1" ? "projeto" : "projetos"}`],
  [/^(\d+) projects? · (\w+)$/, (_, n, k) => `${n} ${n === "1" ? "projeto" : "projetos"} · ${KIND[k] ?? k}`],
  [/^(.+) — closed$/, (_, n) => `${t(n)} — fechada`],
  [/^(\d+) of (\d+) · (.+)$/, (_, a, b, n) => `${a} de ${b} · ${t(n)}`],
  [/^Minimize (.+)$/, (_, n) => `Minimizar ${t(n)}`],
  [/^Maximize (.+)$/, (_, n) => `Maximizar ${t(n)}`],
  [/^Restore (.+) size$/, (_, n) => `Repor o tamanho de ${t(n)}`],
  [/^Restore (.+)$/, (_, n) => `Restaurar ${t(n)}`],
  [/^Close (.+)$/, (_, n) => `Fechar ${t(n)}`],
  [/^Reopen (.+)$/, (_, n) => `Reabrir ${t(n)}`],
  [/^> (.+): (.+)$/, (_, f, m) => `> ${t(f)}: ${m}`],
];

const DONE = new Set(Object.values(PT));
function translate(s) {
  const key = s.replace(/\s+/g, " ").trim();
  if (!key || DONE.has(key)) return null;
  if (PT[key] !== undefined) return PT[key];
  for (const [re, fn] of PATTERNS) { const m = key.match(re); if (m) { const out = fn(...m); return out === key ? null : out; } }
  return null;
}

const ATTRS = ["aria-label", "placeholder", "alt", "title"];
function translateNode(node) {
  if (node.nodeType === 3) {
    const p = node.parentElement;
    if (!p || p.closest("script, style, code, kbd, [data-no-i18n]")) return;
    const out = translate(node.nodeValue);
    if (out != null) {
      const lead = node.nodeValue.match(/^\s*/)[0], trail = node.nodeValue.match(/\s*$/)[0];
      node.nodeValue = lead + out + trail;
    }
    return;
  }
  if (node.nodeType !== 1) return;
  for (const a of ATTRS) {
    const v = node.getAttribute(a);
    if (v) { const out = translate(v); if (out != null) node.setAttribute(a, out); }
  }
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeType === 3) translateNode(n);
    else for (const a of ATTRS) { const v = n.getAttribute(a); if (v) { const out = translate(v); if (out != null) n.setAttribute(a, out); } }
  }
}

export function initI18n() {
  const root = document.documentElement;
  if (currentLang() !== "pt") { root.classList.add("i18n-ready"); return; }
  root.lang = "pt-PT";
  translateNode(document.body);
  const title = translate(document.title);
  if (title) document.title = title;
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "characterData") translateNode(m.target);
      else if (m.type === "attributes") translateNode(m.target);
      else for (const n of m.addedNodes) translateNode(n);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  root.classList.add("i18n-ready");
}
