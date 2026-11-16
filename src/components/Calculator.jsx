import { useState } from "react";
import { CALENDLY_URL, openCalendlyPopup } from "./calendly.js";

const WORKING_WEEKS = 48;

const DEFAULTS = {
  people: 12,
  hours: 8,
  rate: 55,
};

const SLIDERS = [
  {
    key: "people",
    stepIndex: "01",
    label: "Staff doing repetitive work",
    min: 1,
    max: 50,
    step: 1,
    formatValue: (v) => `${v}`,
    ariaValue: (v) => `${v} ${v === 1 ? "person" : "people"}`,
  },
  {
    key: "hours",
    stepIndex: "02",
    label: "Hours each spends per week",
    min: 1,
    max: 25,
    step: 1,
    formatValue: (v) => `${v}h`,
    ariaValue: (v) => `${v} ${v === 1 ? "hour" : "hours"} per week`,
  },
  {
    key: "rate",
    stepIndex: "03",
    label: "Average hourly wage",
    min: 25,
    max: 150,
    step: 5,
    formatValue: (v) => `$${v}`,
    ariaValue: (v) => `$${v} per hour`,
  },
];

const copy = {
  eyebrow: "03 / Run the numbers",
  headingLead: "What manual work",
  headingAccent: "costs your team.",
  cta: "Book a Free Call",
};

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

function SliderRow({ config, value, onChange }) {
  const { key, stepIndex, label, min, max, step, formatValue, ariaValue } =
    config;
  const fillPercent = ((value - min) / (max - min)) * 100;
  const inputId = `calc-slider-${key}`;

  function stepBy(delta) {
    const next = Math.min(max, Math.max(min, value + delta));
    onChange(next);
  }

  return (
    <div className="py-5 first:pt-0 last:pb-0 sm:py-6">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="flex min-w-0 items-baseline gap-2.5 sm:gap-3"
        >
          <span className="shrink-0 font-mono text-[10px] text-ink-soft">
            {stepIndex}
          </span>
          <span className="text-[14.5px] leading-snug font-medium text-ink sm:text-[15.5px]">
            {label}
          </span>
        </label>

        {/* Tactile stepper + numeric readout */}
        <div className="flex shrink-0 items-center rounded-lg border border-line bg-paper p-0.5">
          <button
            type="button"
            onClick={() => stepBy(-step)}
            disabled={value <= min}
            aria-label={`Decrease ${label.toLowerCase()}`}
            className="grid h-7 w-7 place-items-center rounded-md font-mono text-sm text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 sm:h-7.5 sm:w-7.5"
          >
            −
          </button>
          <output
            htmlFor={inputId}
            className="min-w-[3.4rem] px-1.5 text-center text-[14.5px] font-semibold tracking-[-0.02em] text-ink tabular-nums sm:min-w-[3.75rem] sm:text-[15px]"
          >
            {formatValue(value)}
          </output>
          <button
            type="button"
            onClick={() => stepBy(step)}
            disabled={value >= max}
            aria-label={`Increase ${label.toLowerCase()}`}
            className="grid h-7 w-7 place-items-center rounded-md font-mono text-sm text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 sm:h-7.5 sm:w-7.5"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-3">
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={ariaValue(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="calc-slider block"
          style={{ "--slider-fill": `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}

export default function Calculator() {
  const [values, setValues] = useState(DEFAULTS);

  const isModified =
    values.people !== DEFAULTS.people ||
    values.hours !== DEFAULTS.hours ||
    values.rate !== DEFAULTS.rate;

  const annualHours = values.people * values.hours * WORKING_WEEKS;
  const annualCost = annualHours * values.rate;
  const monthlyCost = Math.round(annualCost / 12);

  function updateValue(key, nextValue) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-heading"
      className="border-t border-line"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        {/* Section header matching Process */}
        <div>
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h2
            id="calculator-heading"
            className="mt-5 text-[clamp(1.75rem,3.8vw,3.3rem)] leading-[1.06] font-semibold tracking-[-0.045em] text-ink"
          >
            {copy.headingLead}{" "}
            <span className="relative inline-block pb-1 text-accent">
              {copy.headingAccent}
              <span
                className="absolute inset-x-0 bottom-0 h-[3px] bg-accent/30"
                aria-hidden="true"
              />
            </span>
          </h2>
        </div>

        {/* Calculator workbench card using 3-step visual design system */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-paper-warm shadow-float sm:mt-16">
          {/* Top status bar */}
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="inline-flex h-2 w-2 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft sm:tracking-[0.16em]">
                In-house time &amp; wage leak
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {isModified && (
                <button
                  type="button"
                  onClick={() => setValues(DEFAULTS)}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                >
                  Reset
                </button>
              )}
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                48 wks / yr
              </p>
            </div>
          </div>

          {/* Two-column body */}
          <div className="grid min-w-0 lg:grid-cols-12">
            {/* Left: 3 clean sliders */}
            <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:col-span-7 lg:px-10 lg:py-9">
              <div className="divide-y divide-line/70">
                {SLIDERS.map((slider) => (
                  <SliderRow
                    key={slider.key}
                    config={slider}
                    value={values[slider.key]}
                    onChange={(next) => updateValue(slider.key, next)}
                  />
                ))}
              </div>
            </div>

            {/* Right: Big annual cost & crisp secondary metrics */}
            <div
              className="flex min-w-0 flex-col justify-between border-t border-line bg-paper/60 px-4 py-6 sm:px-8 sm:py-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:px-9 lg:py-9"
              style={{
                backgroundImage:
                  "radial-gradient(rgb(23 23 22 / 0.08) 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                backgroundPosition: "center",
              }}
            >
              <div>
                <p className="text-[15px] font-medium text-ink-soft sm:text-base">
                  Each year, busywork costs you
                </p>

                <p
                  aria-live="polite"
                  className="mt-2 text-[clamp(2.45rem,4.6vw,3.65rem)] leading-none font-semibold tracking-[-0.045em] text-ink tabular-nums"
                >
                  ${annualCost.toLocaleString("en-US")}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:mt-8">
                  <div className="min-w-0">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
                      Lost every month
                    </dt>
                    <dd className="mt-1 text-xl font-semibold tracking-[-0.025em] text-accent tabular-nums sm:text-2xl">
                      ${monthlyCost.toLocaleString("en-US")}
                    </dd>
                  </div>

                  <div className="min-w-0">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
                      Team hours lost / yr
                    </dt>
                    <dd className="mt-1 text-xl font-semibold tracking-[-0.025em] text-ink tabular-nums sm:text-2xl">
                      {annualHours.toLocaleString("en-US")}
                      <span className="ml-1 text-sm font-normal text-ink-soft">
                        hrs
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-7 sm:mt-8">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={openCalendlyPopup}
                  className="group inline-flex items-center gap-3.5 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink sm:px-7"
                >
                  {copy.cta}
                  <ArrowRight />
                </a>
              </div>
            </div>
          </div>

          {/* Grounding footer strip matching Step 02 & Step 03 visuals */}
          <div className="flex items-start gap-2.5 border-t border-line bg-paper-deep/50 px-4 py-3.5 sm:px-6 sm:py-4">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent"
              aria-hidden="true"
            />
            <p className="text-[13px] leading-6 text-ink-soft">
              <span className="font-medium text-ink">
                Automate it for a fraction of what you’re losing.
              </span>{" "}
              Free 30-minute audit, $0 upfront.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
