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
  const defaultLabel = submit.textContent;

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
  }

  // Landing back from a non-fetch submission (contact.php redirects to /?sent=…):
  // reopen the modal with the outcome, then clean the URL.
  const params = new URLSearchParams(window.location.search);
  if (params.has("sent")) {
    document.querySelector('[data-modal-target="contact-modal"]')?.click();
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

    submit.disabled = true;
    submit.textContent = "Sending…";
    setStatus("> transmitting…", "sending");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "send_failed");

      form.reset();
      setStatus("> message sent ✓ check your inbox for confirmation.", "success");
    } catch {
      setStatus("> transmission failed ✗ try again or email geral@bylx.dev", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = defaultLabel;
    }
  });
}
