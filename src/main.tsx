import React, { useEffect, useRef, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  bookingSchema,
  contactSchema,
  trackingResponseSchema,
  type TrackingResponse,
} from "./contracts";
import { api, send, ApiError } from "./api";
import { COMPANY_HEAD_OFFICE } from "./brand";
import {
  Header,
  Footer,
  Page,
  Field,
  ErrorBox,
  Confirmation,
  PhotoUpload,
  ShipmentMap,
  Gallery,
} from "./components";
import { AdminDashboard } from "./management";
import { Mailbox } from "./mailbox";
import "./styles.css";
import "./home-polish.css";
import { TrackingProgress } from "./TrackingProgress";
import { CountUp } from "./CountUp";
import { SubmissionReceiptPage, type SubmissionConfirmation } from "./SubmissionReceipt";
import { HeroCarousel } from "./HeroCarousel";
import { useScrollReveal } from "./useScrollReveal";
function Home() {
  const homeRef = useRef<HTMLElement>(null);
  useScrollReveal(homeRef);
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState("");
  return (
    <main className="home-page" ref={homeRef}>
      <HeroCarousel />
      <section className="home-tracking" aria-labelledby="home-tracking-title">
        <div className="home-tracking-copy">
          <p className="eyebrow orange">YOUR SHIPMENT, AT A GLANCE</p>
          <h2 id="home-tracking-title">Where’s your cargo?</h2>
          <p>Enter your tracking code to see the latest shipment updates.</p>
        </div>
        <form
          className="home-tracking-form"
          onSubmit={(event) => {
            event.preventDefault();
            const code = trackingCode.trim().toUpperCase();
            if (code) navigate(`/track/${encodeURIComponent(code)}`);
          }}
        >
          <label htmlFor="home-tracking-code">Tracking code</label>
          <div className="home-tracking-controls">
            <input
              id="home-tracking-code"
              name="trackingCode"
              placeholder="Enter your tracking code"
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              required
              maxLength={80}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="button orange-bg" disabled={!trackingCode.trim()}>
              Track shipment <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      </section>
      <section className="statistics" id="about">
        <div>
          <p className="eyebrow orange">BUILT FOR COMPLEX SUPPLY CHAINS</p>
          <h2>
            From a single pallet to an entire supply chain, our network keeps
            your cargo moving without the usual complexity.
          </h2>
        </div>
        <div className="stat">
          <CountUp value={98.7} decimals={1} suffix="%" />
          <span>On-time delivery</span>
        </div>
        <div className="stat">
          <CountUp value={120} suffix="+" />
          <span>Countries served</span>
        </div>
        <div className="stat">
          <CountUp value={24} suffix="/7" />
          <span>Shipment visibility</span>
        </div>
        <img className="about-background" src="/images/ocean-small.webp" srcSet="/images/ocean-small.webp 800w, /images/ocean-wide.webp 1600w" sizes="100vw" width="1600" height="1000" loading="lazy" decoding="async" alt="" />
      </section>
      <section className="services" id="services">
        <p className="eyebrow">WHAT WE MOVE</p>
        <div className="section-heading">
          <h2>
            ONE PARTNER.
            <br />
            EVERY ROUTE.
          </h2>
          <p>
            Connected freight services, managed by one accountable team from
            pickup to delivery.
          </p>
        </div>
        <div className="service-grid">
          {[
            [
              "300+ PORTS",
              "Ocean Freight",
              "Flexible full-container and shared-container shipping across every major trade lane.",
            ],
            [
              "1–3 DAY TRANSIT",
              "Air Freight",
              "Priority and scheduled air cargo for time-critical shipments around the world.",
            ],
            [
              "DOOR TO DOOR",
              "Ground Transport",
              "Reliable first and final-mile trucking with visibility at every handoff.",
            ],
          ].map(([tag, name, description], i) => (
            <Link
              className="service-card"
              key={name}
              to={"/book?type=" + encodeURIComponent(name)}
            >
              <div className="service-image"><img src={`/images/${["ocean", "air", "ground"][i]}-small.webp`} width="800" height="520" loading="lazy" decoding="async" alt={["Container ship carrying freight at sea", "Cargo aircraft approaching the runway", "Freight trucks travelling along a highway"][i]} /></div>
              <div className="service-number">
                0{i + 1}
                <span>↗</span>
              </div>
              <p className="eyebrow orange">{tag}</p>
              <h3>{name}</h3>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="visibility" id="network">
        <div className="radar">
          <img className="operations-photo" src="/images/warehouse-small.webp" srcSet="/images/warehouse-small.webp 800w, /images/warehouse-wide.webp 1600w" sizes="(max-width: 800px) 100vw, 50vw" width="1600" height="1000" loading="lazy" decoding="async" alt="Organized warehouse shelving and stored freight" />
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <span className="radar-dot dot-1" />
          <span className="radar-dot dot-2" />
          <div>
            <strong>24</strong>
            <span>GLOBAL HUBS</span>
          </div>
        </div>
        <div className="visibility-copy">
          <p className="eyebrow orange">CLARITY AT EVERY MILE</p>
          <h2>
            LOGISTICS YOU
            <br />
            CAN SEE
            <br />
            COMING.
          </h2>
          <p>
            Proactive teams, transparent milestones, and one shared view of your
            freight. We turn uncertainty into clear decisions.
          </p>
          {[
            "One point of contact",
            "Shipment milestone updates",
            "Carbon-conscious route options",
          ].map((v, i) => (
            <div className="feature" key={v}>
              <span>0{i + 1}</span>
              {v}
            </div>
          ))}
        </div>
      </section>
      <section className="cta">
        <p className="eyebrow">YOUR NEXT SHIPMENT</p>
        <h2>
          LET’S GET IT
          <br />
          MOVING.
        </h2>
        <p>Tell us where it needs to go. We’ll take care of the rest.</p>
        <Link to="/book" className="button dark">
          Request a quote <span>↗</span>
        </Link>
      </section>
    </main>
  );
}
function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmissionConfirmation | undefined>(() => location.state?.confirmation?.receipt?.kind === "shipment" ? location.state.confirmation : undefined);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [token] = useState(() => crypto.randomUUID() + crypto.randomUUID());
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const party = (p: string) => ({
      name: d[p + "Name"],
      phone: d[p + "Phone"],
      email: d[p + "Email"],
      address: d[p + "Address"],
    });
    const parsed = bookingSchema.safeParse({
      sender: party("sender"),
      recipient: party("recipient"),
      description: d.description,
      quantity: d.quantity,
      weight: d.weight,
      dimensions: d.dimensions,
      type: d.type,
      preferences: d.preferences,
      photoIds: photos,
      uploadToken: token,
    });
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((i) => i.path.join(".") + ": " + i.message)
          .join("; "),
      );
      return;
    }
    setBusy(true);
    try {
      const saved = await api("/bookings", send("POST", parsed.data));
      const { uploadToken: _uploadToken, photoIds, ...details } = parsed.data;
      const confirmation: SubmissionConfirmation = { ...saved, receipt: { kind: "shipment", reference: saved.code, submittedAt: new Date().toISOString(), details: { ...details, photoCount: photoIds.length } } };
      setResult(confirmation);
      navigate(location.pathname, { replace: true, state: { confirmation } });
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page eyebrow="YOUR NEXT SHIPMENT" title="Let’s get it moving.">
      {result ? (
        <Confirmation data={result} />
      ) : (
        <form onSubmit={submit} className="booking-form">
          <div className="form-main">
            {["sender", "recipient"].map((p, i) => (
              <section className="panel" key={p}>
                <div className="panel-heading">
                  <span>0{i + 1}</span>
                  <h2>
                    {p === "sender"
                      ? "Sender & pickup"
                      : "Recipient & delivery"}
                  </h2>
                </div>
                <div className="form-grid">
                  <Field label="Full name">
                    <input
                      name={p + "Name"}
                      required
                      maxLength={100}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Phone number">
                    <input
                      name={p + "Phone"}
                      required
                      maxLength={40}
                      type="tel"
                    />
                  </Field>
                  <Field
                    label={
                      "Email address" + (p === "recipient" ? " (optional)" : "")
                    }
                  >
                    <input
                      name={p + "Email"}
                      required={p === "sender"}
                      type="email"
                      maxLength={254}
                    />
                  </Field>
                  <Field
                    label={
                      p === "sender" ? "Pickup address" : "Delivery address"
                    }
                  >
                    <textarea name={p + "Address"} required maxLength={500} />
                  </Field>
                </div>
              </section>
            ))}
            <section className="panel">
              <div className="panel-heading">
                <span>03</span>
                <h2>Shipment details</h2>
              </div>
              <div className="form-grid">
                <Field label="Freight service">
                  <select
                    name="type"
                    defaultValue={
                      new URLSearchParams(location.search).get("type") ||
                      "Ocean Freight"
                    }
                  >
                    <option>Ocean Freight</option>
                    <option>Air Freight</option>
                    <option>Ground Transport</option>
                  </select>
                </Field>
                <Field label="Parcel description">
                  <input name="description" required maxLength={1000} />
                </Field>
                <Field label="Number of parcels">
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    max="10000"
                    defaultValue="1"
                    required
                  />
                </Field>
                <Field label="Total weight (kg)">
                  <input
                    name="weight"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max="100000"
                    required
                  />
                </Field>
                <Field label="Dimensions (L × W × H, cm) — optional">
                  <input name="dimensions" maxLength={100} />
                </Field>
                <Field label="Delivery preferences — optional">
                  <textarea name="preferences" maxLength={1000} />
                </Field>
              </div>
            </section>
            <section className="panel">
              <PhotoUpload
                token={token}
                onChange={setPhotos}
                onBusyChange={setPhotoBusy}
              />
            </section>
          </div>
          <aside className="panel booking-aside">
            <p className="eyebrow orange">FREIGHT, WITHOUT FRICTION.</p>
            <h2>A clearer way forward.</h2>
            <p>
              Submit your shipment request. Our team will review the details and
              record each milestone.
            </p>
            <ul>
              <li>A unique tracking code</li>
              <li>Your own secure website mailbox</li>
              <li>Updates from our operations team</li>
            </ul>
            <p className="muted small">
              Submit your shipment details and our team will handle the next steps.
            </p>
            <ErrorBox error={error} />
            <button className="button orange-bg" disabled={busy || photoBusy}>
              {photoBusy
                ? "Uploading photos…"
                : busy
                  ? "Saving your shipment…"
                  : "Submit shipment request ↗"}
            </button>
          </aside>
        </form>
      )}
    </Page>
  );
}
function Track() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(code || "");
  const [data, setData] = useState<TrackingResponse>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const refreshStatus=useRef<(()=>Promise<void>)|null>(null);
  useEffect(() => {
    if (!code) {setData(undefined);setError("");setBusy(false);setRefreshing(false);return;}
    setBusy(true);
    setData(undefined);
    setError("");
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if(inFlight)return;
      inFlight=true;setRefreshing(true);
      try {
        const result = trackingResponseSchema.parse(await api('/tracking/' + encodeURIComponent(code), {cache:'no-store'}));
        if(active){setData(result);setError('');}
      } catch(e){if(active){if(e instanceof ApiError&&e.status===404)setData(undefined);setError(e instanceof Error?e.message:'Could not refresh shipment.');}}
      finally {inFlight=false;if(active){setBusy(false);setRefreshing(false);}}
    };
    refreshStatus.current=refresh;
    void refresh();
    const timer = window.setInterval(()=>{if(document.visibilityState!=='hidden')void refresh();},30000);
    return ()=>{active=false;refreshStatus.current=null;window.clearInterval(timer);};
  }, [code]);
  return (
    <Page eyebrow="CLARITY AT EVERY MILE" title="Track your shipment." background="ground">
      <form
        className="track-form"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/track/" + encodeURIComponent(value.trim().toUpperCase()));
        }}
      >
        <Field label="Tracking code">
          <input
            placeholder="Enter your InterCargo tracking code"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            maxLength={80}
          />
        </Field>
        <button className="button orange-bg">Track shipment ↗</button>
      </form>
      {code&&<div className="tracking-refresh"><span className="muted small" role="status">{refreshing?'Fetching latest status?':'Saved updates also refresh automatically every 30 seconds.'}</span><button type="button" className="button outline" disabled={refreshing} onClick={()=>void refreshStatus.current?.()}>{refreshing?'Refreshing?':'Refresh Status'}</button></div>}
      <ErrorBox error={error} />
      {busy && (
        <div className="empty" role="status">
          Loading shipment…
        </div>
      )}
      {!code && (
        <div className="empty">
          Your journey, in one place. Enter the code from your booking
          confirmation.
        </div>
      )}
      {data && (
        <>
          <div className="tracking-banner">
            <div>
              <p className="eyebrow">{data.code}</p>
              <h2>{data.status}</h2>
            </div>
            <div>
              <small>SERVICE</small>
              <strong>{data.type}</strong>
            </div>
            <div>
              <small>ESTIMATED DELIVERY</small>
              <strong>
                {data.estimatedDelivery
                  ? new Date(data.estimatedDelivery).toLocaleDateString()
                  : "Not yet recorded"}
              </strong>
            </div>
          </div>
          <div className="status-update-time"><strong>Latest status update</strong><time dateTime={data.statusUpdatedAt}>{new Date(data.statusUpdatedAt).toLocaleString()}</time></div>
          <TrackingProgress status={data.status} events={data.events}/>
          <div className="tracking-layout">
            <div className="panel">
              <h2>Shipment visibility</h2>
              <ShipmentMap state={data.map} status={data.status} />
            </div>
            <aside className="panel">
              <p className="eyebrow orange">SHIPMENT OVERVIEW</p>
              <h3>{data.description}</h3>
              <p>
                {data.quantity} parcel(s) · {data.weight} kg
              </p>
              <hr />
              <small>ORIGIN</small>
              <p>{data.origin}</p>
              <small>DESTINATION</small>
              <p>{data.destination}</p>
              {data.status === "Delivered" ? (
                <a
                  className="button dark"
                  href="/mailbox"
                >
                  Download receipt ↓
                </a>
              ) : (
                <p className="muted small">
                  Your receipt becomes available after delivery.
                </p>
              )}
            </aside>
          </div>
          <section className="panel">
            <h2>Tracking history</h2>
            <Gallery photos={data.photos.filter((p) => !p.event)} />
            {data.events.length ? (
              <ol className="timeline">
                {[...data.events].reverse().map((event: any) => (
                  <li key={event.id}>
                    <span className="timeline-dot" />
                    <div>
                      <small>
                        {new Date(event.createdAt).toLocaleString()}
                      </small>
                      <h3>{event.status}</h3>
                      {event.location && <strong>{event.location}</strong>}
                      <p>{event.note}</p>
                      <Gallery
                        photos={data.photos.filter(
                          (p: any) => p.event === event.id,
                        )}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty">
                Shipment received. Our team has not recorded a tracking update
                yet.
              </div>
            )}
          </section>
        </>
      )}
    </Page>
  );
}
function Contact() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SubmissionConfirmation | undefined>(() => location.state?.confirmation?.receipt?.kind === "contact" ? location.state.confirmation : undefined);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const b = contactSchema.safeParse(
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    if (!b.success) {
      setError(b.error.issues.map((i) => i.message).join("; "));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const saved = await api("/contact", send("POST", b.data));
      const { website: _website, ...details } = b.data;
      const confirmation: SubmissionConfirmation = { ...saved, ...(saved.reference ? { receipt: { kind: "contact" as const, reference: saved.reference, submittedAt: new Date().toISOString(), details } } : {}) };
      setResult(confirmation);
      navigate(location.pathname, { replace: true, state: { confirmation } });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page eyebrow="ONE POINT OF CONTACT" title="Let’s talk freight." background="air">
      {result ? (
        <Confirmation data={result} title="Message received" />
      ) : (
        <div className="contact-layout">
          <form className="panel" onSubmit={submit}>
            <div className="form-grid">
              <Field label="Your name">
                <input name="name" required maxLength={100} />
              </Field>
              <Field label="Email address">
                <input name="email" type="email" required />
              </Field>
              <Field label="Phone (optional)">
                <input name="phone" type="tel" maxLength={40} />
              </Field>
              <Field label="Tracking code (optional)">
                <input name="trackingCode" maxLength={80} />
              </Field>
            </div>
            <Field label="Subject">
              <input name="subject" required maxLength={200} />
            </Field>
            <Field label="Message">
              <textarea name="body" rows={6} required maxLength={10000} />
            </Field>
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <ErrorBox error={error} />
            <button className="button orange-bg" disabled={busy}>
              {busy ? "Saving…" : "Send message ↗"}
            </button>
          </form>
          <aside>
            <p className="eyebrow orange">HEAD OFFICE</p>
            <p>{COMPANY_HEAD_OFFICE}<br /><small>Full address to be confirmed.</small></p>
            <h2>
              One team.
              <br />
              Every answer.
            </h2>
            <p>
              Send a message and our team will reply in your secure website
              mailbox.
            </p>
            <p className="muted">
              We do not send email outside this website. Save your mailbox code
              and return to My Mailbox to read replies.
            </p>
          </aside>
        </div>
      )}
    </Page>
  );
}
function Scroll() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Scroll />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/receipt" element={<SubmissionReceiptPage />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:code" element={<Track />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mailbox" element={<Mailbox />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route
          path="*"
          element={
            <Page eyebrow="404" title="This route ends here.">
              <Link className="button dark" to="/">
                Back to home ↗
              </Link>
            </Page>
          }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  </React.StrictMode>,
);
