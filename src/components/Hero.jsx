import { useEffect, useLayoutEffect, useRef, useState } from "react";
import WireLandscape from "./WireLandscape.jsx";
import { CALENDLY_URL, openCalendlyPopup } from "./calendly.js";

const copy = {
  brand: "Harry McKinney",
  headlineLead: "Save hours on",
  rotating: [
    "reporting",
    "data entry",
    "analytics",
    "payroll",
    "invoicing",
    "quoting",
    "rostering",
    "proposals",
  ],
  subhead:
    "We build custom software around you and link the tools you already use. Cut hours of busywork from your operations.",
  primaryCta: "Book a Free Call",
  secondaryCta: "See our process",
};

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 12 12 4M5 4h7v7" strokeLinecap="square" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="square" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [slotWidth, setSlotWidth] = useState(null);
  const wordRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((current) => (current + 1) % copy.rotating.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    function measureActiveWord() {
      const activeEl = wordRefs.current[wordIndex];
      if (activeEl) {
        setSlotWidth(Math.ceil(activeEl.offsetWidth));
      }
    }

    measureActiveWord();
    window.addEventListener("resize", measureActiveWord, { passive: true });
    if (document.fonts?.ready) {
      document.fonts.ready.then(measureActiveWord);
    }

    return () => window.removeEventListener("resize", measureActiveWord);
  }, [wordIndex]);

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-x-clip"
    >
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-3 py-4 sm:gap-6 sm:py-6">
          <div className="flex min-w-0 items-center gap-5">
            <a
              href="#top"
              className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:text-accent sm:tracking-[0.22em]"
              aria-label={`${copy.brand} — back to top`}
            >
              {copy.brand}
            </a>
          </div>

          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Primary"
          >
            <a
              href="#process"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Process
            </a>
            <a
              href="#integrations"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Integrations
            </a>
            <a
              href="#contact"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              Contact
            </a>
          </nav>

          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openCalendlyPopup}
            className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-ink/15 px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper sm:px-4"
          >
            <span className="hidden sm:inline">Book a Free Call</span>
            <span className="sm:hidden">Free call</span>
            <ArrowUpRight />
          </a>
        </header>

        <div className="mx-auto flex max-w-4xl flex-col items-center pb-2 pt-6 text-center sm:pb-4 sm:pt-11">
          <h1
            id="hero-heading"
            className="text-[clamp(2.25rem,8.4vw,4.2rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-ink sm:text-[clamp(2.4rem,4.6vw,4.2rem)]"
          >
            <span className="sr-only">
              Save hours on reporting, data entry, analytics, and operations.
            </span>
            <span aria-hidden="true">
              <span className="block sm:inline">{copy.headlineLead} </span>
              <span
                className="relative inline-block pb-1 align-baseline text-accent transition-[width] duration-300 ease-out"
                style={slotWidth ? { width: `${slotWidth}px` } : undefined}
              >
                {copy.rotating.map((word, index) => {
                  const active = index === wordIndex;
                  return (
                    <span
                      key={word}
                      ref={(el) => {
                        wordRefs.current[index] = el;
                      }}
                      className={`${
                        index === 0 && slotWidth === null
                          ? "relative"
                          : "absolute left-0 top-0"
                      } whitespace-nowrap transition-all duration-500 ease-out ${
                        active
                          ? "translate-y-0 opacity-100"
                          : "pointer-events-none translate-y-2 opacity-0"
                      }`}
                    >
                      {word}
                      <span className="text-ink">.</span>
                    </span>
                  );
                })}
                {/* Invisible single-line baseline strut so height never wraps during width transitions */}
                {slotWidth !== null && (
                  <span
                    className="invisible select-none whitespace-nowrap"
                    aria-hidden="true"
                  >
                    Ag
                  </span>
                )}
                <span
                  className="absolute inset-x-0 bottom-0 h-[3px] bg-accent/30"
                  aria-hidden="true"
                />
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-7 text-ink-soft sm:mt-6 sm:text-lg sm:leading-8">
            {copy.subhead}
          </p>

          <div className="mt-7 flex w-full flex-col items-center gap-4 sm:mt-8 sm:w-auto sm:flex-row sm:justify-center sm:gap-7">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={openCalendlyPopup}
              className="group inline-flex w-full max-w-[260px] items-center justify-between gap-5 rounded-full bg-accent px-7 py-3.5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-ink sm:w-auto sm:max-w-none sm:justify-start sm:py-4 sm:text-base"
            >
              {copy.primaryCta}
              <ArrowRight />
            </a>

            <a
              href="#process"
              className="group inline-flex items-center gap-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors duration-200 hover:text-ink sm:py-0"
            >
              {copy.secondaryCta}
              <ArrowDown />
            </a>
          </div>
        </div>
      </div>

      <div id="integrations" className="relative pt-2 sm:pt-6">
        <WireLandscape />
      </div>
    </section>
  );
}
