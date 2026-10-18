import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeroCarousel } from "./HeroCarousel";
import { CountUp } from "./CountUp";
import { useScrollReveal } from "./useScrollReveal";

export function StockPhoto({ name, alt, className = "" }: { name: string; alt: string; className?: string }) {
  return <img className={className} src={`/images/${name}-small.webp`} srcSet={`/images/${name}-small.webp 800w, /images/${name}-wide.webp 1600w`} sizes="(max-width: 760px) 100vw, 50vw" width="800" height="600" loading="lazy" decoding="async" alt={alt} />;
}
export function FreightIcon({ type }: { type: "warehouse" | "air" | "ocean" | "ground" }) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "warehouse" ? <><path d="M7 28 32 12l25 16v28H7Z M18 56V31h28v25 M24 39h16 M24 47h16"/><path d="M27 19h10v8H27z"/></> : type === "air" ? <><path d="m8 33 20-5 8-18 6 1-3 18 16 8-1 5-18-3-10 13-5-1 6-15-18 2Z"/><path d="M9 49h9 M5 55h22"/></> : type === "ocean" ? <><path d="m6 39 26 9 26-9-8 14H14Z M14 41V24h36v17 M20 24V14h9v10 M35 24v-8h9v8 M21 31h8v8h-8z M35 31h8v8h-8z M5 57q7-6 14 0t14 0 14 0 12 0"/></> : <><path d="M5 19h33v29H5Z M38 29h12l9 10v9H38 M42 32v9h14"/><circle cx="16" cy="49" r="6"/><circle cx="48" cy="49" r="6"/><path d="M12 26h18 M12 33h12"/></>}
  </svg>;
}
const services = [
  { image: "warehouse", icon: "warehouse", title: "Warehousing", description: "Flexible storage and careful handling, with solutions tailored to your cargo and your business.", to: "/contact?subject=Warehousing" },
  { image: "air", icon: "air", title: "Air Freight", description: "Priority and scheduled air cargo for your time-critical shipments around the world.", to: "/book?type=Air%20Freight" },
  { image: "ocean", icon: "ocean", title: "Ocean Freight", description: "Full-container and shared-container shipping across major international trade lanes.", to: "/book?type=Ocean%20Freight" },
  { image: "ground", icon: "ground", title: "Road Freight", description: "Reliable first and final-mile trucking, with visibility at every handoff.", to: "/book?type=Ground%20Transport" },
] as const;

export function ServiceTiles() {
  return <div className="reference-service-grid">{services.map(service => <Link className="reference-service-tile" key={service.title} to={service.to}>
    <StockPhoto name={service.image} alt={`${service.title} logistics operations`} />
    <div className="service-tile-overlay"><FreightIcon type={service.icon}/><h3>{service.title}</h3><span>Explore service <span aria-hidden="true">↗</span></span></div>
  </Link>)}</div>;
}
export function CompanyIntro() {
  return <section className="reference-intro reference-container" id="about">
    <div className="intro-photos"><StockPhoto name="operations" alt="Warehouse professional checking freight"/><StockPhoto name="port" alt="Shipping containers and cranes at an international port" className="intro-inset"/><div className="photo-caption"><span>ONE TEAM.</span><strong>Every mile, connected.</strong></div></div>
    <div className="intro-copy"><p className="eyebrow orange">WELCOME TO INTERCARGO</p><h2>We provide full assistance in freight &amp; warehousing.</h2><p>From a single pallet to an entire supply chain, our network keeps your cargo moving without the usual complexity.</p><p>Connected freight services, proactive teams, and one accountable point of contact from pickup to delivery. Tell us where your shipment needs to go. We’ll take care of the rest.</p><Link className="button orange-bg" to="/about">About us <span aria-hidden="true">↗</span></Link></div>
  </section>;
}
export function Workflow() {
  return <section className="reference-workflow reference-container"><p className="eyebrow orange">SIMPLE FROM START TO FINISH</p><h2>Our logistics workflow</h2><div className="workflow-grid">{[
    ["processing", "Shipment Processing", "Your shipment starts with the details you submit. We record your request and provide a unique tracking reference."],
    ["operations", "Warehousing", "Cargo is prepared and handled through the next stages of its journey with careful coordination."],
    ["tracking", "Parcel Tracking", "Follow saved shipment milestones, location updates, and customer-facing notes from our team."],
    ["delivery", "Parcel Delivery", "Your shipment reaches its destination, with delivery confirmation and your receipt available online."],
  ].map(([image, title, description], i) => <article key={title}><div className="workflow-photo"><StockPhoto name={image} alt={title}/><span>{i + 1}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>;
}
export function ReachSection() {
  return <section className="reference-reach" id="network"><div className="reference-container reach-grid"><div className="reach-copy"><p className="eyebrow orange">BUILT FOR COMPLEX SUPPLY CHAINS</p><h2>A full range of transport.<br/>One trusted partner.</h2><p>Freight solutions built for speed, certainty, and a world that never stops moving.</p><div className="reach-feature"><FreightIcon type="ocean"/><div><h3>Worldwide service</h3><p>Connected ocean, air, and road options to keep your supply chain moving.</p></div></div><div className="reach-feature"><FreightIcon type="ground"/><div><h3>Clarity at every mile</h3><p>One point of contact, shipment milestone updates, and carbon-conscious route options.</p></div></div><Link className="button orange-bg" to="/services">Our services <span aria-hidden="true">↗</span></Link></div><div className="reach-photo"><StockPhoto name="ground" alt="Freight trucks transporting cargo"/><div className="reach-photo-label"><span>FROM PICKUP</span><strong>To a world of possibilities.</strong></div></div></div></section>;
}
export function MarketingCTA() {
  return <section className="reference-cta"><StockPhoto name="air" alt="Cargo aircraft in flight"/><div className="reference-container"><p className="eyebrow">YOUR NEXT SHIPMENT</p><h2>Let’s get it moving.</h2><p>Tell us where it needs to go. We’ll take care of the rest.</p><Link className="button orange-bg" to="/book">Request a quote <span aria-hidden="true">↗</span></Link></div></section>;
}
export function MarketingBanner({ title, image = "port" }: { title: string; image?: string }) {
  return <section className="marketing-banner"><StockPhoto name={image} alt=""/><div className="reference-container"><h1>{title}</h1><p><Link to="/">Home</Link><span aria-hidden="true"> / </span>{title}</p></div></section>;
}
export function ServicesPage() {
  const fullServices = [...services,
    { image: "port", title: "Container Delivery", description: "Connected container transport and coordinated delivery from port to destination.", to: "/book?type=Ocean%20Freight" },
    { image: "operations", title: "Freight Coordination", description: "One team to help plan your shipment, handle your questions, and keep you informed.", to: "/contact?subject=Freight%20coordination" },
  ];
  return <main className="reference-page"><MarketingBanner title="Services"/><section className="reference-container services-page-content"><p className="eyebrow orange">WHAT WE DO</p><h2>Logistics services</h2><div className="service-page-grid">{fullServices.map(service => <article key={service.title}><Link to={service.to} className="service-page-image"><StockPhoto name={service.image} alt={`${service.title} logistics operations`}/></Link><div><h3>{service.title}</h3><p>{service.description}</p><Link className="text-link" to={service.to}>Read more ↗</Link></div></article>)}</div></section><MarketingCTA/></main>;
}
export function AboutPage() {
  return <main className="reference-page"><MarketingBanner title="About us" image="warehouse"/><CompanyIntro/><ReachSection/><Workflow/><MarketingCTA/></main>;
}
export function HomePage() {
  const root = useRef<HTMLElement>(null); useScrollReveal(root);
  const [code, setCode] = useState(""); const navigate = useNavigate();
  return <main className="home-page reference-home" ref={root}>
    <HeroCarousel/>
    <section className="reference-highlights reference-container" aria-label="Our capabilities">{[
      ["warehouse", "Warehouse Facility", "Flexible storage, handling, and coordination to suit your products and your business.", "/contact?subject=Warehousing"],
      ["air", "Air Freight Facility", "Connected air cargo solutions for time-critical shipments and international deliveries.", "/book?type=Air%20Freight"],
      ["ocean", "Container Delivery", "Reliable container shipping and connected transport from collection to destination.", "/book?type=Ocean%20Freight"],
    ].map(([icon, title, copy, to]) => <article key={title}><FreightIcon type={icon as "warehouse" | "air" | "ocean"}/><h2>{title}</h2><p>{copy}</p><Link className="text-link" to={to}>Read more <span aria-hidden="true">↗</span></Link></article>)}</section>
    <section className="home-tracking reference-container" aria-labelledby="home-tracking-title"><div className="home-tracking-copy"><p className="eyebrow orange">YOUR SHIPMENT, AT A GLANCE</p><h2 id="home-tracking-title">Where’s your cargo?</h2><p>Enter your tracking code to see the latest shipment updates.</p></div><form className="home-tracking-form" onSubmit={e => { e.preventDefault(); if (code.trim()) navigate("/track/" + encodeURIComponent(code.trim().toUpperCase())); }}><label htmlFor="home-tracking-code">Tracking code</label><div className="home-tracking-controls"><input id="home-tracking-code" name="trackingCode" placeholder="Enter your tracking code" value={code} onChange={e => setCode(e.target.value)} required maxLength={80} autoCapitalize="characters" autoComplete="off" spellCheck={false}/><button className="button orange-bg" disabled={!code.trim()}>Track shipment ↗</button></div></form></section>
    <CompanyIntro/>
    <section className="reference-services reference-container" id="services"><div className="reference-section-heading"><p className="eyebrow orange">WHAT WE MOVE</p><h2>One partner. Every route.</h2><p>Connected freight services, managed by one accountable team from pickup to delivery.</p></div><ServiceTiles/></section>
    <Workflow/>
    <ReachSection/>
    <section className="reference-statistics"><StockPhoto name="port" alt=""/><div className="reference-container">{[[98.7, "On-time delivery", "%"], [120, "Countries served", "+"], [24, "Shipment visibility", "/7"]].map(([value, label, suffix]) => <div key={String(label)}><CountUp value={Number(value)} decimals={value === 98.7 ? 1 : 0} suffix={String(suffix)}/><span>{label}</span></div>)}</div></section>
    <section className="reference-assurance reference-container"><StockPhoto name="port" alt="Cranes and containers at a working port"/><div><p className="eyebrow orange">FREIGHT WITHOUT FRICTION</p><h2>Your cargo deserves<br/>a connected team.</h2><p>Professional coordination, clear communication, and a shared view of your shipment. Our team is here to help you plan the next move.</p><div className="assurance-list"><span>✓ One point of contact</span><span>✓ Secure website mailbox</span><span>✓ Shipment updates and receipts</span></div><Link className="button orange-bg" to="/contact">Talk to our team ↗</Link></div></section>
    <MarketingCTA/>
  </main>;
}
