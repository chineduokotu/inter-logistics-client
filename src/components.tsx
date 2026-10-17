import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { MapState, Point } from "./contracts";
import { api, send, apiUrl } from "./api";
import { hasCoordinates } from "./mapCoordinates";
import { InteractiveMap } from "./InteractiveMap";
import type { SubmissionConfirmation } from "./SubmissionReceipt";
export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="CARGOA home">
      <span className="brandmark">
        <i />
        <i />
        <i />
      </span>
      CARGOA
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <Logo />
      <button
        className="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰ <span className="sr">Menu</span>
      </button>
      <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
        <Link to="/">Home</Link>
        <a href="/#network">Network</a>
        <a href="/#about">About us</a>
        <Link to="/contact">Contact</Link>
        <Link to="/track">Track shipment</Link>
        <Link to="/mailbox">My Mailbox</Link>
      </nav>
      <Link className="button dark header-quote" to="/book">
        Get a quote <span>↗</span>
      </Link>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <Logo />
      <span>Freight, without friction.</span>
      <div>
        <a href="mailto:hello@cargoa.com">hello@cargoa.com</a>
        <Link to="/admin">Admin</Link>
        <a
          href="#"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
export function ErrorBox({ error }: { error: string }) {
  return error ? (
    <div className="error" role="alert">
      {error}
    </div>
  ) : null;
}
export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return total > 100 ? (
    <div className="actions">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <small>
        Page {page} of {Math.ceil(total / 100)}
      </small>
      <button disabled={page * 100 >= total} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  ) : null;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Page({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="workspace">
      <div className="page-heading">
        <p className="eyebrow orange">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </main>
  );
}
export function Confirmation({
  data,
  title = "Shipment received",
}: {
  data: SubmissionConfirmation;
  title?: string;
}) {
  return (
    <section className="panel confirmation">
      <span className="success-icon">✓</span>
      <h2>{title}</h2>
      <p>
        Your request has been saved. Updates and replies are available in your
        website mailbox.
      </p>
      {data.code && (
        <>
          <p className="eyebrow">YOUR TRACKING CODE</p>
          <strong className="code">{data.code}</strong>
          <Copy value={data.code} />
          <Link className="button dark" to={"/track/" + data.code}>
            Track shipment ↗
          </Link>
        </>
      )}
      {data.accessCode ? (
        <div className="code-warning">
          <h3>Save your mailbox access code</h3>
          <p>
            This code is shown only now. Save or print it before leaving this
            page.
          </p>
          <code>{data.accessCode}</code>
          <Copy value={data.accessCode} />
        </div>
      ) : (
        <p>Use your existing mailbox access code to view replies.</p>
      )}
      <div className="actions">
        {data.receipt && <Link className="button outline" to="/receipt" state={{ confirmation: data }}>View Receipt</Link>}
        <button className="button outline" onClick={() => window.print()}>
          Print confirmation
        </button>
        <Link to="/mailbox" className="button orange-bg">
          Open My Mailbox ↗
        </Link>
      </div>
      <p className="muted">
        We do not send external email. Visit this website to read messages.
      </p>
    </section>
  );
}
export function Copy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="text-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied ✓" : "Copy code"}
    </button>
  );
}
type FileItem = {
  key: string;
  file: File;
  preview: string;
  id?: string;
  error?: string;
  progress: number;
  caption: string;
  visible: boolean;
};
export function PhotoUpload({
  token,
  onChange,
  adminCode,
  onBusyChange,
}: {
  token: string;
  onChange: (ids: string[]) => void;
  adminCode?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<FileItem[]>([]);
  const ref = useRef<FileItem[]>([]);
  const [error, setError] = useState("");
  function update(next: FileItem[]) {
    ref.current = next;
    setItems([...next]);
    onChange(next.flatMap((i) => (i.id ? [i.id] : [])));
    onBusyChange?.(
      next.some((i) => i.progress > 0 && i.progress < 100 && !i.error),
    );
  }
  function uploadItem(item: FileItem) {
    const form = new FormData();
    form.append("photo", item.file);
    form.append("uploadToken", token);
    item.error = "";
    item.progress = 1;
    update(ref.current);
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      apiUrl(adminCode ? `/admin/shipments/${adminCode}/photos` : "/photos"),
    );
    xhr.withCredentials = true;
    xhr.setRequestHeader("X-Cargoa-Request", "1");
    xhr.upload.onprogress = (e) => {
      item.progress = e.lengthComputable
        ? Math.round((e.loaded / e.total) * 95)
        : 30;
      update(ref.current);
    };
    xhr.onload = async () => {
      let result;
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        result = { error: "Upload service unavailable." };
      }
      if (xhr.status < 300) {
        item.id = result.id;
        item.progress = 100;
        if (adminCode)
          await api(
            `/admin/photos/${item.id}`,
            send("PATCH", { caption: item.caption, visible: item.visible }),
          ).catch((e) => {
            item.error = e.message;
          });
      } else {
        item.error =
          result.error ||
          "Upload failed. Retry or continue without this photo.";
        item.progress = 0;
      }
      update(ref.current);
    };
    xhr.onerror = () => {
      item.error = "Connection lost. Retry or continue without this photo.";
      item.progress = 0;
      update(ref.current);
    };
    xhr.send(form);
  }
  function add(files: FileList | null) {
    setError("");
    for (const file of Array.from(files || [])) {
      if (ref.current.length >= (adminCode ? 10 : 5)) {
        setError("Photo limit reached.");
        break;
      }
      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024
      ) {
        setError("Use JPEG, PNG or WebP, up to 5 MB per photo.");
        continue;
      }
      const item = {
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        caption: "",
        visible: false,
      };
      update([...ref.current, item]);
      uploadItem(item);
    }
  }
  return (
    <div className="photo-upload">
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
      >
        <span className="upload-icon">↑</span>
        <strong>
          Add parcel photos <span className="muted">(optional)</span>
        </strong>
        <p>Drop photos here or choose files · JPEG, PNG, WebP · 5 MB each</p>
        <label className="button outline">
          Choose photos
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <label className="text-button">
          Use camera
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => add(e.target.files)}
          />
        </label>
      </div>
      <ErrorBox error={error} />
      <div className="upload-grid">
        {items.map((i) => (
          <div className="upload-item" key={i.key}>
            <img src={i.preview} alt="Selected parcel preview" />
            <progress
              value={i.progress}
              max={100}
              aria-label="Upload progress"
            />
            {i.progress === 100 && <small>Uploaded privately ✓</small>}
            <ErrorBox error={i.error || ""} />
            {i.error && (
              <button type="button" onClick={() => uploadItem(i)}>
                Retry
              </button>
            )}
            {adminCode && (
              <>
                <input
                  placeholder="Photo caption"
                  aria-label="Photo caption"
                  value={i.caption}
                  onChange={(e) => {
                    i.caption = e.target.value;
                    update(ref.current);
                    if (i.id)
                      api(
                        `/admin/photos/${i.id}`,
                        send("PATCH", {
                          caption: i.caption,
                          visible: i.visible,
                        }),
                      ).catch((e) => setError(e.message));
                  }}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={i.visible}
                    onChange={(e) => {
                      i.visible = e.target.checked;
                      update(ref.current);
                      if (i.id)
                        api(
                          `/admin/photos/${i.id}`,
                          send("PATCH", {
                            caption: i.caption,
                            visible: i.visible,
                          }),
                        ).catch((e) => setError(e.message));
                    }}
                  />{" "}
                  Visible to customer
                </label>
              </>
            )}
            <button
              type="button"
              className="text-button"
              onClick={async () => {
                try {
                  if (i.id)
                    await api(
                      adminCode ? `/admin/photos/${i.id}` : `/photos/${i.id}`,
                      send("DELETE", adminCode ? {} : { uploadToken: token }),
                    );
                  URL.revokeObjectURL(i.preview);
                  update(ref.current.filter((x) => x.key !== i.key));
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="muted small">
        Failed photos will not block your booking. Only completed uploads are
        attached.
      </p>
    </div>
  );
}
export function ShipmentMap({
  state,
  status,
  editing,
  onPoint,
}: {
  state: MapState & { updatedAt?: string | null; positions?: Point[] };
  status: string;
  editing?: boolean;
  onPoint?: (x: number, y: number, coordinates?: {lng:number;lat:number}) => void;
}) {
  const current =
    status === "Delivered" && state.destination
      ? state.destination
      : state.current;
  const line =
    hasCoordinates(current) &&
    hasCoordinates(state.destination) &&
    (state.mode !== "planned" || state.waypoints.every(hasCoordinates)) &&
    state.mode !== "hidden" &&
    status !== "Delivered";
  return (
    <section className="map-section">
      {!state.visible && !editing ? (
        <div className="empty">Map unavailable for this shipment.</div>
      ) : (
        <>
          <InteractiveMap state={state} status={status} onPoint={editing ? onPoint : undefined}/>
          {line && (
            <p className="map-disclaimer">
              {state.mode === "planned"
                ? "Planned route set by CARGOA. Indicative only."
                : "Straight line to destination. Indicative only, not the actual route."}
            </p>
          )}
        </>
      )}
      <div className="map-summary">
        <div>
          <small>● CURRENT LOCATION</small>
          <strong>{current?.label || "Location not yet recorded"}</strong>
        </div>
        <div>
          <small>■ DESTINATION</small>
          <strong>{state.destination?.label || "Not yet set"}</strong>
        </div>
        <div>
          <small>LAST UPDATED</small>
          <strong>
            {state.updatedAt
              ? new Date(state.updatedAt).toLocaleString()
              : "No position recorded"}
          </strong>
        </div>
      </div>
      {state.caption && <p>{state.caption}</p>}
      <p className="muted small">
        Schematic map © CARGOA, CC0. Manually recorded positions; no live GPS or
        automatic routing.
      </p>
    </section>
  );
}
export function Gallery({ photos }: { photos: any[] }) {
  const [photo, setPhoto] = useState<any>(null);
  return (
    <>
      <div className="gallery">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.url}
            onClick={() => setPhoto(p)}
          >
            <img
              loading="lazy"
              src={p.thumbnail || p.url}
              alt={p.caption || "Shipment photo"}
              onError={(e) => {
                e.currentTarget.alt =
                  "Photo temporarily unavailable. Refresh to retry.";
              }}
            />
            <small>{p.caption || "Shipment photo"}</small>
          </button>
        ))}
      </div>
      {photo && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Shipment photo"
          onClick={() => setPhoto(null)}
          onKeyDown={(e) => e.key === "Escape" && setPhoto(null)}
        >
          <button autoFocus onClick={() => setPhoto(null)}>
            Close ×
          </button>
          <img src={photo.url} alt={photo.caption || "Shipment photo"} />
        </div>
      )}
    </>
  );
}
