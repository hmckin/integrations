import { CALENDLY_URL, openCalendlyPopup } from "./calendly.js";

// 5 cols x 3 rows lo-fi calendar cells; index 8 is highlighted as the selected day
const calendarCells = Array.from({ length: 15 }, (_, index) => index === 8);

const agendaItems = [
  {
    step: "01",
    title: "Map current tools & handoffs",
    tag: "Email · Sheets",
    accent: false,
  },
  {
    step: "02",
    title: "Pinpoint where hours leak",
    tag: "Bottlenecks",
    accent: false,
  },
  {
    step: "03",
    title: "Select highest-ROI first workflow",
    tag: "Fixed scope",
    accent: true,
  },
];

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="13.5" height="12" rx="2.5" />
      <path d="m16 10.2 5-2.7v9l-5-2.7v-3.6Z" />
    </svg>
  );
}

export default function DiscoveryVisual() {
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-warm shadow-float">
      <p className="sr-only">
        Discovery call overview: book a free 30-minute video call to map your
        current tools, pinpoint manual bottlenecks, and choose the first
        workflow to automate.
      </p>

      {/* Top status bar */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-2 w-2 rounded-full bg-accent"
            aria-hidden="true"
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Discovery call · 30 min
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Free
        </p>
      </div>

      {/* Cohesive card body without middle gap or grey wrapper box */}
      <div className="flex flex-1 flex-col justify-center gap-7 px-6 py-6 sm:px-7 sm:py-7">
        {/* Lo-fi calendar + session heading */}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openCalendlyPopup}
          className="group flex items-center gap-5 sm:gap-7"
        >
          {/* Lo-fi calendar block */}
          <div
            className="w-[148px] shrink-0 rounded-xl border border-line bg-paper p-3.5 shadow-[0_8px_20px_-12px_rgba(23,23,22,0.2)] transition-transform duration-200 group-hover:-translate-y-0.5 sm:w-[168px] sm:p-4"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between pb-2.5">
              <span className="h-2 w-12 rounded-full bg-ink/15" />
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-line" />
                <span className="h-2 w-2 rounded-full bg-line" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 border-t border-line/70 pt-2.5">
              {calendarCells.map((selected, index) => (
                <span
                  key={index}
                  className={
                    selected
                      ? "h-[18px] rounded-[4px] bg-accent shadow-2xs"
                      : "h-[18px] rounded-[4px] bg-paper-deep/90"
                  }
                />
              ))}
            </div>
          </div>

          {/* Clean inline video eyebrow & beefed-up title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-accent">
              <VideoIcon />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]">
                Video call
              </span>
            </div>

            <p className="mt-2 text-balance text-xl leading-[1.16] font-semibold tracking-[-0.025em] text-ink sm:text-2xl">
              Operations &amp; Process Audit
            </p>
            <p className="mt-2 text-[13.5px] leading-5 text-ink-soft">
              Pick a day that suits · 1-on-1 with Harry
            </p>
          </div>
        </a>

        {/* Process discussion list */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Process discussion
          </p>

          <ul className="mt-3 divide-y divide-line/70">
            {agendaItems.map((item) => (
              <li
                key={item.step}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`font-mono text-[10px] ${
                      item.accent
                        ? "font-semibold text-accent"
                        : "text-ink-soft"
                    }`}
                  >
                    {item.step}
                  </span>
                  <span className="truncate text-[14.5px] font-medium text-ink">
                    {item.title}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.13em] ${
                    item.accent ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {item.tag}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}
