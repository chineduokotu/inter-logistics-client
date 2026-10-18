import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  { image: "ocean", title: "Across oceans. Beyond expectations.", label: "Ocean freight", position: "65% center" },
  { image: "ground", title: "Every road. One reliable partner.", label: "Ground transport", position: "65% center" },
  { image: "air", title: "Time-critical cargo. Ready for takeoff.", label: "Air freight", position: "70% center" },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [preload, setPreload] = useState(false);
  const [loaded, setLoaded] = useState<number[]>([]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setVisible(document.visibilityState !== "hidden");
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const timer = window.setTimeout(() => setPreload(true), 1800);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); window.clearTimeout(timer); };
  }, []);
  const playing = !paused && !hovered && !reduced && visible;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = (active + 1) % slides.length;
      if (loaded.includes(next)) setActive(next);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [playing, active, loaded]);
  function select(index: number) {
    const next = (index + slides.length) % slides.length;
    setPreload(true); setPaused(true);
    if (loaded.includes(next)) { setActive(next); setPending(null); }
    else setPending(next);
  }
  return <section className="hero hero-carousel" aria-label="Freight services" aria-roledescription="carousel" tabIndex={0}
    onPointerEnter={e => { if (e.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={e => {
      // Touch focus must not permanently pause the slideshow while scrolling.
      // Keyboard focus still pauses it so controls remain easy to operate.
      if (!e.currentTarget.contains(e.relatedTarget as Node) && (e.target as HTMLElement).matches(":focus-visible")) setPaused(true);
    }}
    onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); select(active + (e.key === "ArrowRight" ? 1 : -1)); } }}>
    <div className="hero-slides" aria-hidden="true">{slides.map((slide, i) => <div key={slide.image} className={`hero-slide${active === i ? " is-active" : ""}`}>
      {(i === 0 || preload || active === i) && <img src={`/images/${slide.image}-wide.webp`} srcSet={`/images/${slide.image}-small.webp 800w, /images/${slide.image}-wide.webp 1600w`} sizes="100vw" width="1600" height="1000" alt="" fetchPriority={i === 0 ? "high" : "low"} decoding="async" style={{ objectPosition: slide.position }} onLoad={() => {
        setLoaded(previous => previous.includes(i) ? previous : [...previous, i]);
        if (pending === i) { setActive(i); setPending(null); }
      }} />}
    </div>)}</div>
    <div className="hero-shade" />
    <div className="hero-copy">
      <p className="eyebrow"><span />GLOBAL LOGISTICS, SIMPLIFIED</p>
      <h1>WE MOVE<br /><em>BUSINESS</em><br />FORWARD.</h1>
      <p className="hero-description">Freight solutions built for speed, certainty, and a world that never stops moving.</p>
      <div className="hero-actions"><Link to="/book" className="button orange-bg">Start shipping <span aria-hidden="true">↗</span></Link><a className="underlined" href="#services">Explore services <span aria-hidden="true">↓</span></a></div>
    </div>
    <div className="hero-route route-card">
      <div className="route-top"><span>YOUR NEXT SHIPMENT</span><span className="green">Every mile, connected</span></div>
      <div className="route-line"><span>●</span><i /><span>●</span></div>
      <div className="route-bottom"><div><small>FROM PICKUP</small><strong>Your business</strong></div><div><small>TO DELIVERY</small><strong>A world of possibilities</strong></div></div>
    </div>
    <div className="hero-bottom">
      <div className="slide-caption" aria-live={playing ? "off" : "polite"}><span className="eyebrow">0{active + 1} / 03 — {slides[active].label}</span><p key={active}>{slides[active].title}</p></div>
      <div className="carousel-controls" aria-label="Slideshow controls">
        <button type="button" aria-label="Previous slide" onClick={() => select(active - 1)}>←</button>
        <div className="carousel-dots">{slides.map((slide, i) => <button type="button" key={slide.image} aria-label={`Show ${slide.label} slide`} aria-pressed={active === i} onClick={() => select(i)}><span /></button>)}</div>
        <button type="button" aria-label="Next slide" onClick={() => select(active + 1)}>→</button>
        {!reduced && <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => setPaused(value => !value)}>{paused ? "▷" : "Ⅱ"}</button>}
      </div>
    </div>
  </section>;
}
