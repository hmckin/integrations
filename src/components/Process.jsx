import { useEffect, useRef, useState } from "react";
import DiscoveryVisual from "./DiscoveryVisual.jsx";
import BuildVisual from "./BuildVisual.jsx";
import ProcessVisual from "./ProcessVisual.jsx";
import { CALENDLY_URL, openCalendlyPopup } from "./calendly.js";

const copy = {
  eyebrow: "02 / Our process",
  headingLead: "Less manual work.",
  headingAccent: "More momentum.",
  cta: "Book a Free Call",
  items: [
    {
      step: "1",
      title: "Book a free call.",
      tag: "Free · 30 minutes",
      body: "One 30-minute call to map where your operation leaks hours. We pick the highest-ROI workflow to automate first.",
    },
    {
      step: "2",
      title: "Build & integrate.",
      tag: "No upfront cost",
      body: "We connect the tools you already use and build the missing piece. You get a fixed scope, a firm date, and progress updates as we go.",
    },
    {
      step: "3",
      title: "Monitor & maintain.",
      tag: "Pay once it's saving hours",
      body: "We watch the workflow, manage uptime, and fix issues before you notice. Your fee starts when you are saving hours.",
    },
  ],
};

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

export default function Process() {
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame = 0;

    function updateActiveStep() {
      frame = 0;
      const focalY = (window.innerHeight || 800) * 0.4;
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < copy.items.length; i += 1) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Anchor near the upper third of each step block (where the number & title sit)
        const anchorY = rect.top + Math.min(48, rect.height * 0.25);
        const distance = Math.abs(anchorY - focalY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      setActiveIndex((current) =>
        current === closestIndex ? current : closestIndex,
      );
    }

    function onScrollOrResize() {
      if (frame) return;
      frame = requestAnimationFrame(updateActiveStep);
    }

    updateActiveStep();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <section id="process" aria-labelledby="process-heading">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        {/* Clean section header */}
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h2
            id="process-heading"
            className="mt-5 text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink"
          >
            <span className="block">{copy.headingLead}</span>
            <span className="relative mt-1.5 inline-block pb-1 text-accent">
              {copy.headingAccent}
              <span
                className="absolute inset-x-0 bottom-0 h-[3px] bg-accent/30"
                aria-hidden="true"
              />
            </span>
          </h2>
        </div>

        {/* Two-column body: naturally scrolling vertical timeline on left, sticky Workflow Monitor on right */}
        <div className="mt-14 grid gap-14 sm:mt-20 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-6">
            <ol className="relative">
              {copy.items.map((item, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                const isLast = index === copy.items.length - 1;

                return (
                  <li
                    key={item.step}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`relative flex gap-5 sm:gap-7 ${
                      isLast ? "pb-4" : "pb-20 sm:pb-28"
                    }`}
                  >
                    {/* Vertical timeline connector line */}
                    {!isLast && (
                      <span
                        className="pointer-events-none absolute bottom-0 left-[19px] top-10 w-px bg-line"
                        aria-hidden="true"
                      >
                        <span
                          className={`block w-full bg-accent/45 transition-[height] duration-500 ease-out ${
                            isPast ? "h-full" : "h-0"
                          }`}
                        />
                      </span>
                    )}

                    {/* Concentric step indicator circle */}
                    <div className="relative z-10 shrink-0 pt-0.5">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-paper transition-all duration-500 ease-out ${
                          isActive
                            ? "border border-accent/45"
                            : "border border-transparent"
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-medium transition-all duration-500 ease-out ${
                            isActive
                              ? "bg-accent text-white shadow-xs"
                              : isPast
                                ? "border border-accent/35 bg-paper-warm text-accent"
                                : "border border-line bg-paper-warm text-ink-soft"
                          }`}
                        >
                          {item.step}
                        </span>
                      </span>
                    </div>

                    {/* Step content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3
                        className={`origin-left text-[clamp(1.7rem,2.9vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.035em] transition-all duration-500 ease-out ${
                          isActive
                            ? "scale-100 text-ink"
                            : "scale-[0.94] text-ink/42"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        className={`mt-2.5 text-sm font-medium transition-colors duration-500 ${
                          isActive ? "text-accent" : "text-accent/55"
                        }`}
                      >
                        {item.tag}
                      </p>

                      <p
                        className={`mt-3.5 max-w-md text-[15px] leading-7 transition-colors duration-500 sm:text-base ${
                          isActive ? "text-ink-soft" : "text-ink-soft/55"
                        }`}
                      >
                        {item.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-12 pl-[60px] sm:mt-14 sm:pl-[68px]">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={openCalendlyPopup}
                className="group inline-flex items-center gap-3 rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper"
              >
                {copy.cta}
                <ArrowRight />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="grid">
              <div
                className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
                  activeIndex === 0
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
                aria-hidden={activeIndex !== 0}
              >
                <DiscoveryVisual />
              </div>

              <div
                className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
                  activeIndex === 1
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : activeIndex < 1
                      ? "pointer-events-none translate-y-2 opacity-0"
                      : "pointer-events-none -translate-y-2 opacity-0"
                }`}
                aria-hidden={activeIndex !== 1}
              >
                <BuildVisual active={activeIndex === 1} />
              </div>

              <div
                className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
                  activeIndex === 2
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
                aria-hidden={activeIndex !== 2}
              >
                <ProcessVisual />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
