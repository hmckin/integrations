import Hero from "./components/Hero.jsx";
import Process from "./components/Process.jsx";
import Calculator from "./components/Calculator.jsx";
import CTA from "./components/CTA.jsx";

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-50 -translate-y-24 bg-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-transform focus:translate-y-0 focus-visible:outline-accent-bright"
      >
        Skip to content
      </a>

      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Process />
        <Calculator />
        <CTA />
      </main>
    </>
  );
}
