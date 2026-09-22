/* ✧･ﾟ: *✧･ﾟ:*✧･ﾟ: *✧･ﾟ:*
  _               _
 | |__    _   _  | | __  __
 | '_ \  | | | | | | \ \/ /
 | |_) | | |_| | | |  >  <
 |_.__/   \__, | |_| /_/\_\
          |___/
*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧*:･ﾟ✧ */
/* ᑲყᥣx contact form */

/* Mirrors the error codes contact.php returns */
const SERVER_ERRORS = {
  bad_origin: "that submission did not come from bylx.dev ✗",
  rate_limited: "too many messages from here in the last hour ✗ try later or email geral@bylx.dev",
  missing_fields: "name, email and message are all required ✗",
  invalid_email: "that email address does not look right ✗",
  too_long: "that message is longer than the form accepts ✗",
  send_failed: "transmission failed ✗ try again or email geral@bylx.dev",
};

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
      setStatus(`> ${SERVER_ERRORS[params.get("err")] ?? SERVER_ERRORS.send_failed}`, "error");
    }
    /* Keep the hash and anything else in the query — this used to throw away
       #about and every utm_* param along with sent= */
    params.delete("sent");
    params.delete("err");
    const rest = params.toString();
    history.replaceState(
      {},
      "",
      window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash
    );
  }

  /* The browser's validation bubble disappears on the next click and is never
     announced, so an invalid field also gets aria-invalid and a line in the
     status region, which is aria-live. */
  const fields = [...form.querySelectorAll("input:not([tabindex='-1']), textarea")];

  function fieldLabel(field) {
    return (field.closest("label")?.firstChild?.textContent ?? field.name).trim();
  }

  function markValidity() {
    let firstInvalid = null;

    for (const field of fields) {
      const valid = field.checkValidity();
      if (valid) field.removeAttribute("aria-invalid");
      else {
        field.setAttribute("aria-invalid", "true");
        firstInvalid ??= field;
      }
    }

    return firstInvalid;
  }

  /* Native validation (the form is no longer novalidate, so the no-JS path
     validates too) blocks submit before the submit handler runs — so the
     announcement hangs off `invalid`, which fires per field. */
  let announcing = null;

  fields.forEach((field) => {
    field.addEventListener("invalid", () => {
      field.setAttribute("aria-invalid", "true");
      if (announcing) return;

      /* setTimeout, not queueMicrotask: the browser flushes microtasks
         between the per-field invalid events, so a microtask announced the
         LAST invalid field. A timer lands after all of them, and the first
         field is the one the browser is about to focus. */
      announcing = field;
      setTimeout(() => {
        setStatus(`> ${fieldLabel(announcing)}: ${announcing.validationMessage}`, "error");
        announcing = null;
      }, 0);
    });

    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid") && field.checkValidity()) {
        field.removeAttribute("aria-invalid");
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstInvalid = markValidity();
    if (firstInvalid) {
      setStatus(`> ${fieldLabel(firstInvalid)}: ${firstInvalid.validationMessage}`, "error");
      form.reportValidity();
      return;
    }

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
      fields.forEach((field) => field.removeAttribute("aria-invalid"));
      setStatus("> message sent ✓ check your inbox for confirmation.", "success");
    } catch (error) {
      /* contact.php answers with a reason; "transmission failed" for all of
         them told a rate-limited visitor nothing they could act on. */
      setStatus(`> ${SERVER_ERRORS[error?.message] ?? SERVER_ERRORS.send_failed}`, "error");
    } finally {
      submit.disabled = false;
      submit.textContent = defaultLabel;
    }
  });
}
