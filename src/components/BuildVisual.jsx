import { useEffect, useState } from "react";
import {
  IntegrationIcon,
  getAccentColor,
  isLightBadge,
} from "./integrations.jsx";

const PRESETS = [
  {
    input: { name: "gmail", label: "Gmail" },
    rule: "Parse & route enquiry",
    tag: "Auto-match",
    outputTop: { name: "excel", label: "Excel" },
    outputBottom: { name: "slack", label: "Slack" },
  },
  {
    input: { name: "pdf", label: "PDF" },
    rule: "Extract invoice lines",
    tag: "Custom parser",
    outputTop: { name: "sheets", label: "Sheets" },
    outputBottom: { name: "teams", label: "Teams" },
  },
  {
    input: { name: "outlook", label: "Outlook" },
    rule: "Score & assign lead",
    tag: "Your rules",
    outputTop: { name: "hubspot", label: "HubSpot" },
    outputBottom: { name: "calendar", label: "Calendar" },
  },
  {
    input: { name: "claude", label: "Claude" },
    rule: "Draft weekly report",
    tag: "Scheduled",
    outputTop: { name: "powerpoint", label: "Slides" },
    outputBottom: { name: "drive", label: "Drive" },
  },
];

function ToolNode({ item, transitioning, floatingLabel = false }) {
  const light = isLightBadge(item.name);

  return (
    <div
      className={`relative flex flex-col items-center gap-1.5 transition-all duration-350 ease-out ${
        transitioning ? "scale-92 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-full [&_svg]:!h-[19px] [&_svg]:!w-[19px] ${
          light
            ? "ring-1 ring-inset ring-black/[0.09] shadow-[0_1px_2px_rgba(23,23,22,0.06),0_10px_20px_-14px_rgba(23,23,22,0.38)]"
            : "ring-1 ring-inset ring-black/[0.05] shadow-[0_1px_0_rgba(23,23,22,0.03),0_12px_22px_-16px_rgba(23,23,22,0.45)]"
        }`}
        style={{ backgroundColor: getAccentColor(item.name) }}
      >
        <IntegrationIcon name={item.name} />
      </span>
      <span
        className={`whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.13em] text-ink-soft ${
          floatingLabel ? "absolute top-full mt-1.5" : ""
        }`}
      >
        {item.label}
      </span>
    </div>
  );
}

export default function BuildVisual({ active = false }) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let swapTimer = 0;
    const interval = setInterval(() => {
      setTransitioning(true);
      swapTimer = window.setTimeout(() => {
        setPresetIndex((current) => (current + 1) % PRESETS.length);
        setTransitioning(false);
      }, 300);
    }, 4500);

    return () => {
      clearInterval(interval);
      if (swapTimer) clearTimeout(swapTimer);
      setTransitioning(false);
    };
  }, [active]);

  const preset = PRESETS[presetIndex];

  return (
    <figure className="flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper-warm shadow-float">
      <p className="sr-only">
        Custom workflow builder in progress: connects your existing input tools
        through a tailored custom software module and routes results to your
        team&apos;s apps.
      </p>

      {/* Top status bar */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50"
              aria-hidden="true"
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-accent"
              aria-hidden="true"
            />
          </span>
          <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-soft sm:text-[10px] sm:tracking-[0.16em]">
            Workflow studio
          </p>
        </div>
        <p className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-accent sm:text-[10px] sm:tracking-[0.16em]">
          Build in progress
        </p>
      </div>

      {/* Blueprint dot-grid canvas with 1 -> Custom Module -> 2 branching graph */}
      <div
        className="relative flex flex-1 items-center px-4 py-5 sm:px-5 sm:py-6"
        style={{
          backgroundImage:
            "radial-gradient(rgb(23 23 22 / 0.11) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          backgroundPosition: "center",
        }}
      >
        {/* Mobile vertical blueprint flow (< sm) */}
        <div className="flex w-full flex-col items-center sm:hidden">
          <ToolNode item={preset.input} transitioning={transitioning} />

          <div
            className="relative my-1.5 h-6 w-px bg-line"
            aria-hidden="true"
          >
            <span
              className="flow-dot-y absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
              style={{ "--flow-delay": "0s" }}
            />
          </div>

          <div className="relative z-10 w-full max-w-[244px] rounded-xl border border-accent/40 bg-paper-warm p-3.5 shadow-[0_12px_28px_-16px_rgba(23,23,22,0.35)]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.15em] text-accent">
                Custom build
              </span>
              <span
                className="inline-flex h-3.5 w-6 items-center rounded-full bg-accent p-0.5"
                aria-hidden="true"
              >
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            </div>

            <p
              className={`mt-2 text-[14px] font-semibold tracking-[-0.015em] text-ink transition-opacity duration-300 ${
                transitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {preset.rule}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/80 pt-2">
              <span
                className={`rounded-md bg-paper-deep/85 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft transition-opacity duration-300 ${
                  transitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {preset.tag}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-signal">
                2 outputs
              </span>
            </div>
          </div>

          <div className="relative h-7 w-40" aria-hidden="true">
            <svg
              viewBox="0 0 160 28"
              className="h-full w-full overflow-visible"
            >
              <path
                d="M 80 0 C 80 14, 28 14, 28 28"
                fill="none"
                stroke="#d7d1c4"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 80 0 C 80 14, 132 14, 132 28"
                fill="none"
                stroke="#b23a0b"
                strokeOpacity="0.45"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="flex w-40 items-start justify-between">
            <div className="flex w-14 justify-center">
              <ToolNode
                item={preset.outputTop}
                transitioning={transitioning}
              />
            </div>
            <div className="flex w-14 justify-center">
              <ToolNode
                item={preset.outputBottom}
                transitioning={transitioning}
              />
            </div>
          </div>
        </div>

        {/* Tablet & Desktop horizontal blueprint flow (sm+) */}
        <div className="relative hidden w-full items-center justify-between gap-2 sm:flex">
          {/* Left input tool */}
          <div className="relative z-10 flex w-14 shrink-0 justify-center">
            <ToolNode
              item={preset.input}
              transitioning={transitioning}
              floatingLabel
            />
          </div>

          {/* Left connector centered on both left circle and custom module */}
          <div
            className="relative h-px flex-1 bg-line"
            aria-hidden="true"
          >
            <span
              className="flow-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
              style={{ "--flow-delay": "0s" }}
            />
          </div>

          {/* Centerpiece: Custom-built logic module */}
          <div className="relative z-10 w-[188px] shrink-0 rounded-xl border border-accent/40 bg-paper-warm p-3 shadow-[0_12px_28px_-16px_rgba(23,23,22,0.35)] sm:w-[208px] sm:p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.15em] text-accent">
                Custom build
              </span>
              {/* Miniature live toggle switch */}
              <span
                className="inline-flex h-3.5 w-6 items-center rounded-full bg-accent p-0.5"
                aria-hidden="true"
              >
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            </div>

            <p
              className={`mt-2 truncate text-[13.5px] font-semibold tracking-[-0.015em] text-ink transition-opacity duration-300 ${
                transitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {preset.rule}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/80 pt-2">
              <span
                className={`rounded-md bg-paper-deep/85 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft transition-opacity duration-300 ${
                  transitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {preset.tag}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-signal">
                2 outputs
              </span>
            </div>
          </div>

          {/* Right branching SVG curves splitting from module midpoint (67) to top (22) & bottom (96) circles */}
          <div
            className="relative h-[134px] flex-1 min-w-[28px]"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 60 134"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              <path
                d="M 0 67 C 30 67, 30 22, 60 22"
                fill="none"
                stroke="#d7d1c4"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 0 67 C 30 67, 30 96, 60 96"
                fill="none"
                stroke="#b23a0b"
                strokeOpacity="0.45"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {/* Right dual output tools */}
          <div className="relative z-10 flex w-14 shrink-0 flex-col items-center gap-3.5">
            <ToolNode item={preset.outputTop} transitioning={transitioning} />
            <ToolNode
              item={preset.outputBottom}
              transitioning={transitioning}
            />
          </div>
        </div>
      </div>

      {/* Build progress milestone strip */}
      <div className="border-t border-line px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center justify-between gap-1.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.08em] sm:gap-2 sm:text-[9px] sm:tracking-[0.15em]">
          <span className="text-signal">01 Scoped ✓</span>
          <span className="font-medium text-accent">02 Custom build</span>
          <span className="text-ink-soft/60">03 Live handoff</span>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2" aria-hidden="true">
          <span className="h-1.5 rounded-full bg-signal" />
          <span className="h-1.5 overflow-hidden rounded-full bg-accent/20">
            <span className="block h-full w-2/3 rounded-full bg-accent" />
          </span>
          <span className="h-1.5 rounded-full bg-line/80" />
        </div>
      </div>

      {/* Grounding footer matching Step 03 */}
      <div className="flex items-start gap-2.5 border-t border-line bg-paper-deep/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <span
          className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-6 text-ink-soft">
          <span className="font-medium text-ink">
            Built around how your team works.
          </span>{" "}
          Fixed scope, firm date, and $0 upfront.
        </p>
      </div>
    </figure>
  );
}
