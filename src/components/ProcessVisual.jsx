import {
  IntegrationIcon,
  getAccentColor,
  isLightBadge,
} from "./integrations.jsx";

const nodes = [
  { name: "gmail", label: "Gmail" },
  { name: "excel", label: "Excel" },
  { name: "slack", label: "Slack" },
];

const bars = [34, 52, 45, 68, 60, 82, 100];

function Node({ name, label }) {
  const light = isLightBadge(name);

  return (
    <div className="flex w-14 shrink-0 flex-col items-center gap-2">
      <span
        className={`grid h-12 w-12 place-items-center rounded-full [&_svg]:!h-[21px] [&_svg]:!w-[21px] ${
          light
            ? "ring-1 ring-inset ring-black/[0.09] shadow-[0_1px_2px_rgba(23,23,22,0.06),0_12px_22px_-16px_rgba(23,23,22,0.38)]"
            : "ring-1 ring-inset ring-black/[0.04] shadow-[0_1px_0_rgba(23,23,22,0.03),0_14px_24px_-22px_rgba(23,23,22,0.45)]"
        }`}
        style={{ backgroundColor: getAccentColor(name) }}
      >
        <IntegrationIcon name={name} />
      </span>
      <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </span>
    </div>
  );
}

function Connector({ delay = "0s" }) {
  return (
    <div
      className="relative mx-2 mt-6 h-px flex-1 bg-line sm:mx-3"
      aria-hidden="true"
    >
      <span
        className="flow-dot absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent-bright"
        style={{ "--flow-delay": delay }}
      />
    </div>
  );
}

export default function ProcessVisual() {
  return (
    <figure className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-paper-warm shadow-float">
      <p className="sr-only">
        Example workflow monitor: an enquiry flows from Gmail into Excel and
        notifies the team in Slack. Uptime is 99.9 percent, 32.5 hours are saved
        per month, and billing starts only once the workflow is saving hours.
      </p>

      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-50"
              aria-hidden="true"
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-signal"
              aria-hidden="true"
            />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Workflow monitor
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
          Live
        </p>
      </div>

      <div className="px-5 py-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
          Example / enquiry flow
        </p>

        <div className="mt-5 flex items-start">
          {nodes.map((node, index) => (
            <div key={node.name} className="contents">
              {index > 0 && <Connector delay={`${index * 0.6}s`} />}
              <Node name={node.name} label={node.label} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-5 py-5">
        <div className="grid grid-cols-2 items-end gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
              Hours saved
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-ink">
              32.5
              <span className="ml-1.5 text-sm font-normal text-ink-soft">
                hrs / mo
              </span>
            </p>
          </div>

          <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
            {bars.map((height, index) => (
              <span
                key={index}
                className={`w-2 rounded-xs ${
                  index === bars.length - 1 ? "bg-accent" : "bg-accent/25"
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
              Uptime
            </dt>
            <dd className="mt-0.5 text-lg font-medium tracking-[-0.01em] text-ink">
              99.9%
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
              Runs this month
            </dt>
            <dd className="mt-0.5 text-lg font-medium tracking-[-0.01em] text-ink">
              1,248
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-start gap-2.5 border-t border-line bg-paper-deep/50 px-5 py-4">
        <span
          className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-6 text-ink-soft">
          <span className="font-medium text-ink">
            Billing starts when your savings do.
          </span>{" "}
        </p>
      </div>
    </figure>
  );
}
