/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx contact form */

export function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('button[type="submit"]');
  const defaultLabel = submit?.textContent?.trim() || "Send";

  function setStatus(message, state) {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has("sent")) {
    document.querySelector('[data-modal-target="contact-modal"]')?.dispatchEvent(
      new MouseEvent("click", { bubbles: true })
    );

    if (params.get("sent") === "1") {
      setStatus("> message sent ✓ check your inbox for confirmation.", "success");
    } else {
      setStatus("> transmission failed ✗ try again or email geral@bylx.dev", "error");
    }

    history.replaceState({}, "", window.location.pathname);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Sending…";
    }

    setStatus("> transmitting…", "sending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
        credentials: "same-origin",
      });

      let data = {};
      let payloadText = "";

      try {
        payloadText = await response.text();
      } catch {
        payloadText = "";
      }

      if (payloadText) {
        try {
          data = JSON.parse(payloadText);
        } catch {
          const redirectParams = new URL(response.url).searchParams;
          const sent = redirectParams.get("sent");

          if (sent === "1") {
            data = { ok: true };
          } else if (sent === "0") {
            data = { ok: false, error: redirectParams.get("err") || "send_failed" };
          }
        }
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "send_failed");
      }

      form.reset();
      setStatus("> message sent ✓ check your inbox for confirmation.", "success");
    } catch {
      setStatus("> transmission failed ✗ try again or email geral@bylx.dev", "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = defaultLabel;
      }
    }
  });
}
