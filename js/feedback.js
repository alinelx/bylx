/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
/* ᑲყᥣx feedback — cinco perguntas fechadas e uma caixa aberta

   Vai pelo mesmo contact.php do formulário de contacto, para não haver um
   segundo endpoint a manter. As respostas fechadas chegam como um bloco de
   linhas "P1: …", fáceis de contar à mão ou de colar numa folha. Se a pessoa
   não deixar e-mail, o remetente é o próprio geral@bylx.dev — o site a
   escrever-lhe, que é o que isto é. */

const OWNER = "geral@bylx.dev";
const LABELS = {
  q1: "1 Quem é",
  q2: "2 Ficou claro em 10s",
  q3: "3 Encontrar o trabalho",
  q4: "4 O que se destacou",
  q5: "5 Contrataria/recomendaria",
};

export function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  if (!form) return;
  const status = document.getElementById("feedback-status");
  const submit = form.querySelector('button[type="submit"]');
  const label = submit.textContent;

  const say = (text, state) => {
    status.textContent = text;
    status.dataset.state = state ?? "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    /* Uma pergunta fechada por responder é o erro provável: dizer qual. */
    for (const key of Object.keys(LABELS)) {
      if (!data.get(key)) {
        say(`> falta a pergunta ${key.slice(1)} ✗`, "error");
        form.querySelector(`[name="${key}"]`)?.focus();
        return;
      }
    }

    const lines = Object.entries(LABELS).map(([k, l]) => `${l}: ${data.get(k)}`);
    const open = (data.get("open") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = [
      "Portfolio feedback",
      "------------------",
      ...lines,
      "",
      open ? `6 Aberta:\n${open}` : "6 Aberta: (vazia)",
      "",
      email ? "" : "(sem e-mail — não há a quem responder)",
    ].join("\n");

    const body = new FormData();
    body.set("name", "Portfolio feedback");
    body.set("email", email || OWNER);
    body.set("message", message);
    body.set("website", data.get("website") || "");

    submit.disabled = true;
    submit.textContent = "Sending…";
    say("> transmitting…", "sending");
    try {
      const res = await fetch(form.action || "/contact.php", {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "send_failed");
      form.hidden = true;
      say("> thank you — that is exactly what I needed ✓", "success");
    } catch (error) {
      say("> transmission failed ✗ try again or email geral@bylx.dev", "error");
      console.error("[bylx] feedback failed", error);
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}
