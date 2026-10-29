import { useState, useRef } from "react";

interface ContactFormProps {
  locale: "en" | "ro";
  endpoint: string;
  /** Turnstile site key. Without it the form still submits; spam leans on the honeypot. */
  turnstileKey?: string;
  strings: {
    name: string; email: string; message: string; send: string;
    sending: string; sent: string; error: string; required: string;
  };
}

type State = "idle" | "sending" | "sent" | "error";

const ContactForm = ({ locale, endpoint, turnstileKey, strings }: ContactFormProps) => {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? ""),   // honeypot
      token: String(data.get("cf-turnstile-response") ?? ""),
      locale,
    };
    if (!payload.name || !payload.email || !payload.message) {
      setState("error");
      setError(strings.required);
      return;
    }

    setState("sending");
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body as { error?: string }).error ?? strings.error);
      setState("sent");
      formRef.current?.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : strings.error);
    }
  };

  if (state === "sent") {
    return (
      <p className="text-base md:text-lg text-text-secondary" role="status">
        {strings.sent}
      </p>
    );
  }

  const field =
    "w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-base " +
    "text-text-primary placeholder:text-text-tertiary focus:border-text-primary " +
    "focus:outline-none focus:ring-0 transition-colors";

  return (
    <form ref={formRef} onSubmit={submit} className="w-full max-w-xl mx-auto text-left" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="sr-only">{strings.name}</span>
          <input name="name" type="text" autoComplete="name" required
                 placeholder={strings.name} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{strings.email}</span>
          <input name="email" type="email" autoComplete="email" required
                 placeholder={strings.email} className={field} />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">{strings.message}</span>
        <textarea name="message" rows={4} required placeholder={strings.message}
                  className={`${field} resize-none`} />
      </label>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {turnstileKey && (
        <div className="cf-turnstile mt-5" data-sitekey={turnstileKey} data-size="flexible" />
      )}

      <div className="mt-7 flex items-center gap-4">
        <button type="submit" disabled={state === "sending"}
                className="border border-text-primary px-7 py-2.5 text-sm tracking-wide text-text-primary transition-colors duration-200 hover:bg-text-primary hover:text-background disabled:opacity-50">
          {state === "sending" ? strings.sending : strings.send}
        </button>
        {state === "error" && (
          <span className="text-sm text-text-secondary" role="alert">{error}</span>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
