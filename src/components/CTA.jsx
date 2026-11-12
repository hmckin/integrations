import { CALENDLY_URL, openCalendlyPopup } from "./calendly.js";

// Replace this placeholder with the real address before launch.
const CONTACT_EMAIL = "harry@hmckinney.com";

const copy = {
  eyebrow: "03 / Book a call",
  heading: "Find hours lost to your operation",
  body: "You will get a direct reply from the engineer who would build it.",
  button: "Book a Free Call",
  emailPrefix: "Or write directly",
  subject: "Booking a free call",
  footerLeft: "Harry McKinney — Custom software & workflow automation",
  footerRight: "Integrations / Data pipelines / Custom tools",
};

const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  copy.subject,
)}`;

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12 12 4M5 4h7v7" strokeLinecap="square" />
    </svg>
  );
}

export default function CTA() {
  return (
    <section
      id="contact"
      aria-labelledby="cta-heading"
      className="bg-ink text-paper"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright">
              <span className="h-1.5 w-1.5 bg-accent-bright" aria-hidden="true" />
              {copy.eyebrow}
            </p>

            <h2
              id="cta-heading"
              className="mt-6 max-w-4xl text-balance text-[clamp(2.5rem,6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
            >
              {copy.heading}
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-paper/65">
              {copy.body}
            </p>
          </div>

          <div className="lg:col-span-4 lg:justify-self-end">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openCalendlyPopup}
              className="group inline-flex w-full items-center justify-between gap-6 rounded-full bg-accent-bright px-8 py-5 text-base font-medium text-ink transition-colors duration-200 hover:bg-paper focus-visible:outline-accent-bright sm:w-auto sm:justify-start"
            >
              {copy.button}
              <ArrowUpRight />
            </a>

            <div className="mt-4">
              <a
                href={mailtoHref}
                className="group inline-flex flex-wrap items-center gap-1.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/65 transition-colors duration-200 hover:text-paper focus-visible:outline-accent-bright"
              >
                <span>{copy.emailPrefix}</span>
                <span className="underline decoration-paper/35 underline-offset-4 transition-colors duration-200 group-hover:decoration-paper">
                  {CONTACT_EMAIL}
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">
            {copy.footerLeft}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper/60">
            {copy.footerRight}
          </p>
        </div>
      </div>
    </section>
  );
}
