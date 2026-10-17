import { useEffect, useState, type FormEvent } from "react";
import {
  mapSchema,
  type MapState,
  type Point,
} from "./contracts";
import { geographicPoint } from "./mapCoordinates";
import { api, send } from "./api";
import { customerStatuses as statuses, selectableStatus } from "./shipmentStatuses";
import {
  Page,
  Pagination,
  Field,
  ErrorBox,
  ShipmentMap,
  PhotoUpload,
  Gallery,
  Copy,
} from "./components";
import { Login, Inbox } from "./mailbox";
export function AdminDashboard() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("shipments");
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<string>();
  useEffect(() => {
    api("/session")
      .then((s) => {
        setReady(s.role === "admin");
        if (s.role === "admin")
          api("/admin/inbox").then((r) => setUnread(r.unread));
      })
      .catch(() => {});
  }, []);
  return (
    <Page eyebrow="CARGOA OPERATIONS" title="The control centre.">
      {ready ? (
        <>
          <div className="admin-tabs">
            <button
              className={tab === "shipments" ? "active" : ""}
              onClick={() => {
                setTab("shipments");
                setSelected(undefined);
              }}
            >
              Shipments
            </button>
            <button
              className={tab === "inbox" ? "active" : ""}
              onClick={() => setTab("inbox")}
            >
              Inbox <span className="count">{unread}</span>
            </button>
            <button
              className={tab === "locations" ? "active" : ""}
              onClick={() => setTab("locations")}
            >
              Map locations
            </button>
            <button
              className="logout"
              onClick={async () => {
                await api("/logout", send("POST", {}));
                setReady(false);
              }}
            >
              Sign out
            </button>
          </div>
          {tab === "inbox" ? (
            <Inbox admin onUnread={setUnread} />
          ) : tab === "locations" ? (
            <Locations />
          ) : selected ? (
            <Detail code={selected} back={() => setSelected(undefined)} />
          ) : (
            <Shipments onSelect={setSelected} />
          )}
        </>
      ) : (
        <Login
          admin
          onLogin={() => {
            setReady(true);
            api("/admin/inbox").then((r) => setUnread(r.unread));
          }}
        />
      )}
    </Page>
  );
}
function Shipments({ onSelect }: { onSelect: (s: string) => void }) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({
    code: "",
    customer: "",
    status: "",
    date: "",
  });
  async function load(nextPage = 1) {
    setBusy(true);
    setError("");
    try {
      const q = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v),
      );
      const result = await api(
        "/admin/shipments?" +
          new URLSearchParams({ ...q, page: String(nextPage) }),
      );
      setRows(result.shipments);
      setTotal(result.total);
      setPage(nextPage);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Field label="Tracking code">
          <input
            value={filters.code}
            onChange={(e) => setFilters({ ...filters, code: e.target.value })}
            placeholder="CG-…"
          />
        </Field>
        <Field label="Customer email">
          <input
            value={filters.customer}
            onChange={(e) =>
              setFilters({ ...filters, customer: e.target.value })
            }
            type="email"
          />
        </Field>
        <Field label="Status">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All shipments</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Booking date">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </Field>
        <button className="button dark">Filter</button>
      </form>
      <ErrorBox error={error} />
      <div className="panel table-wrap">
        <div className="panel-heading">
          <h2>Shipment requests</h2>
          <span>
            {total} records · Page {page}
          </span>
        </div>
        {busy ? (
          <div className="empty">Loading shipments…</div>
        ) : rows.length ? (
          <table>
            <thead>
              <tr>
                <th>Tracking code</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Booked</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.code}>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => onSelect(s.code)}
                    >
                      {s.code}
                    </button>
                  </td>
                  <td>
                    {s.sender.name}
                    <small>{s.sender.email}</small>
                  </td>
                  <td>{s.type}</td>
                  <td>
                    <span className="badge">{s.status}</span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => onSelect(s.code)}
                      aria-label={"Open " + s.code}
                    >
                      ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">No shipment requests found.</div>
        )}
        <Pagination page={page} total={total} onChange={load} />
      </div>
    </>
  );
}
function Detail({ code, back }: { code: string; back: () => void }) {
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [newCode, setNewCode] = useState("");
  const [history, setHistory] = useState<any>();
  const [mailHistory, setMailHistory] = useState<any>();
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  async function load() {
    setData(await api("/admin/shipments/" + code));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [code]);
  async function update(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = Object.fromEntries(new FormData(f));
    setBusy(true);
    setError("");
    try {
      await api(
        `/admin/shipments/${code}/events`,
        send("POST", {
          status: d.status,
          location: d.location,
          note: d.note,
          photoIds,
          requestId,
          ...(d.estimatedDelivery
            ? {
                estimatedDelivery: new Date(
                  String(d.estimatedDelivery),
                ).toISOString(),
              }
            : {}),
        }),
      );
      setNotice("Tracking update and mailbox notification saved.");
      setRequestId(crypto.randomUUID());
      setPhotoIds([]);
      setUploadKey((k) => k + 1);
      f.reset();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="text-button" onClick={back}>
        ← All shipments
      </button>
      <ErrorBox error={error} />
      {notice && (
        <p className="success" role="status">
          {notice}
        </p>
      )}
      {!data ? (
        <div className="empty">Loading shipment…</div>
      ) : (
        <>
          <div className="tracking-banner">
            <div>
              <p className="eyebrow">{code}</p>
              <h2>{data.status}</h2>
            </div>
            <a
              className="button outline light"
              href={"/track/" + code}
              target="_blank"
              rel="noreferrer"
            >
              View tracking ↗
            </a>
          </div>
          <div className="detail-grid">
            <section className="panel">
              <h2>Shipment details</h2>
              <div className="form-grid">
                {["sender", "recipient"].map((p) => (
                  <div key={p}>
                    <p className="eyebrow orange">{p}</p>
                    <h3>{data[p].name}</h3>
                    <p>{data[p].address}</p>
                    <p>
                      {data[p].phone}
                      <br />
                      {data[p].email}
                    </p>
                  </div>
                ))}
              </div>
              <hr />
              <p>{data.description}</p>
              <p>
                {data.type} · {data.quantity} parcel(s) · {data.weight} kg
              </p>
              <h3>Photos</h3>
              <Gallery photos={data.photos} />
              {data.photos.map((p: any) => (
                <div className="photo-admin" key={p.id}>
                  <span>{p.caption || "Shipment photo"}</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.visible}
                      onChange={async (e) => {
                        try {
                          await api(
                            "/admin/photos/" + p.id,
                            send("PATCH", {
                              visible: e.target.checked,
                              caption: p.caption || "",
                            }),
                          );
                          await load();
                        } catch (e: any) {
                          setError(e.message);
                        }
                      }}
                    />{" "}
                    Visible to customer
                  </label>
                  <button
                    onClick={async () => {
                      try {
                        await api("/admin/photos/" + p.id, send("DELETE", {}));
                        await load();
                      } catch (e: any) {
                        setError(e.message);
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>
            <section className="panel">
              <h2>Update shipment status</h2>
              <form onSubmit={update}>
                <Field label="Shipment status">
                  <select key={data.status} name="status" defaultValue={selectableStatus(data.status)} required>
                    {!selectableStatus(data.status) && <option value="" disabled>Select a new status</option>}
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Location name (optional)">
                  <input name="location" maxLength={150} />
                </Field>
                <Field label="Customer-facing note (optional)">
                  <textarea name="note" maxLength={2000} />
                </Field>
                <Field label="Estimated delivery (optional)">
                  <input name="estimatedDelivery" type="datetime-local" />
                </Field>
                <PhotoUpload
                  key={uploadKey}
                  token="admin"
                  adminCode={code}
                  onChange={setPhotoIds}
                  onBusyChange={setPhotoBusy}
                />
                <button
                  className="button orange-bg"
                  disabled={busy || photoBusy}
                >
                  {busy ? "Saving…" : "Save update & notify ↗"}
                </button>
              </form>
            </section>
          </div>
          <MapEditor code={code} data={data} onSaved={load} />
          <section className="panel">
            <h2>Customer support</h2>
            <p>
              Reissue a mailbox code only after verifying the customer’s
              identity. Existing sessions and the old code will be invalidated.
            </p>
            <div className="actions">
              <button
                className="button outline"
                onClick={async () => {
                  try {
                    setNewCode(
                      (
                        await api(
                          `/admin/mailboxes/${data.mailbox}/reissue`,
                          send("POST", {}),
                        )
                      ).accessCode,
                    );
                  } catch (e: any) {
                    setError(e.message);
                  }
                }}
              >
                Reissue mailbox code
              </button>
              <button
                className="button outline"
                onClick={async () => {
                  try {
                    setMailHistory(
                      await api(`/admin/mailboxes/${data.mailbox}/history`),
                    );
                  } catch (e: any) {
                    setError(e.message);
                  }
                }}
              >
                Customer message history
              </button>
            </div>
            {newCode && (
              <div className="code-warning">
                <strong>Shown once: {newCode}</strong>
                <Copy value={newCode} />
              </div>
            )}
            {mailHistory?.threads.map((t: any) => (
              <div className="feature" key={t.id}>
                <strong>{t.subject}</strong>
                <span>{t.preview}</span>
              </div>
            ))}
          </section>
          <section className="panel">
            <h2>Audit history</h2>
            {data.events.map((e: any) => (
              <article className="audit" key={e.id}>
                <strong>
                  {e.status} · {e.location}
                </strong>
                <small>
                  {new Date(e.createdAt).toLocaleString()} · Admin {e.admin}
                </small>
                <p>{e.note}</p>
                {e.internalNote && (
                  <p className="muted">Internal: {e.internalNote}</p>
                )}
              </article>
            ))}
            <button
              className="button outline"
              onClick={async () => {
                try {
                  setHistory(
                    (await api(`/admin/shipments/${code}/map/history`)).history,
                  );
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Load map history
            </button>
            {history?.map((h: any) => (
              <details key={h._id}>
                <summary>
                  {new Date(h.createdAt).toLocaleString()} · Admin {h.admin}
                </summary>
                <pre>{JSON.stringify(h.state, null, 2)}</pre>
              </details>
            ))}
          </section>
        </>
      )}
    </>
  );
}
export function MapEditor({
  code,
  data,
  onSaved,
}: {
  code: string;
  data: any;
  onSaved: () => Promise<void>;
}) {
  const [state, setState] = useState<MapState>(() =>
    mapSchema.parse({
      current: data.map.current,
      destination: data.map.destination,
      mode: data.map.mode,
      waypoints: data.map.waypoints,
      travelled: data.map.travelled,
      caption: data.map.caption,
      visible: data.map.visible,
    }),
  );
  const [target, setTarget] = useState("current");
  const [label, setLabel] = useState(state.current?.label || "");
  const [advanced,setAdvanced]=useState(false);
  const [saving,setSaving]=useState(false);
  const [notify, setNotify] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  useEffect(() => {
    api("/admin/locations")
      .then((r) => setLocations(r.locations))
      .catch((e) => setError(e.message));
  }, []);
  function place(x: number, y: number, coordinates?: {lng:number;lat:number}) {
    const p = { x, y, ...coordinates, label: label.trim() || "Recorded location" };
    if (target === "waypoint")
      setState({ ...state, waypoints: [...state.waypoints, p].slice(0, 20) });
    else setState({ ...state, [target]: p });
    setPreview(false);
    setNotice("");
  }
  async function save() {
    if(saving)return;
    setSaving(true);
    try {
      setError("");
      await api(`/admin/shipments/${code}/map`, send("PUT", { state, notify }));
      setNotice("Map saved.");
      await onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {setSaving(false);}
  }
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow orange">SHIPMENT MAP</p>
          <h2>Update shipment location</h2>
        </div>
        {preview && <span className="badge">Customer preview</span>}
      </div>
      <ErrorBox error={error} />
      {notice && <p className="success">{notice}</p>}
      <div className="map-editor-grid">
        <div>
          <ShipmentMap
            state={{
              ...state,
              positions: data.map.positions,
              updatedAt: data.map.updatedAt,
            }}
            status={data.status}
            editing={!preview}
            onPoint={preview ? undefined : place}
          />
          {!preview && (
            <p className="muted">
              Choose current location or destination, enter its name, then click the map. Click Save map to publish your changes.
            </p>
          )}
        </div>
        <div className="map-controls">
          <Field label="Update location">
            <select value={target} onChange={(e) => {const next=e.target.value;setTarget(next);setLabel(next === "waypoint" ? "" : state[next as "current" | "destination"]?.label || "");setPreview(false);}}>
              <option value="current">Current location ●</option>
              <option value="destination">Destination ■</option>
              {advanced && <option value="waypoint">Add waypoint</option>}
            </select>
          </Field>
          <Field label="Location name">
            <input
              value={label}
              maxLength={120}
              onChange={(e) => {const value=e.target.value;setLabel(value);if(target !== "waypoint"){const key=target as "current" | "destination";if(state[key])setState({...state,[key]:{...state[key]!,label:value}});}setNotice("");}}
            />
          </Field>
        </div>
      </div>
      <details className="map-advanced" onToggle={e=>{const open=e.currentTarget.open;setAdvanced(open);if(!open)setPreview(false);if(!open&&target==='waypoint'){setTarget('current');setLabel(state.current?.label||'');}}}>
        <summary>Advanced options</summary>
        <p className="muted small">Optional route, visibility and precision controls.</p>
        <div className="form-grid">
          <Field label="Saved location">
            <select
              value=""
              onChange={(e) => {
                const l = locations.find((l) => l._id === e.target.value);
                if (l) {
                  if (target === "waypoint")
                    setState({
                      ...state,
                      waypoints: [...state.waypoints, l.point].slice(0, 20),
                    });
                  else {setState({ ...state, [target]: l.point });setLabel(l.point.label);}
                }
              }}
            >
              <option value="">Choose a named location</option>
              {locations.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Line mode">
            <select
              value={state.mode}
              onChange={(e) =>
                setState({ ...state, mode: e.target.value as MapState["mode"] })
              }
            >
              <option value="default">Default: current → destination</option>
              <option value="hidden">Hidden</option>
              <option value="planned">Planned route</option>
            </select>
          </Field>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={state.travelled}
              onChange={(e) =>
                setState({ ...state, travelled: e.target.checked })
              }
            />{" "}
            Show travelled path
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={!state.visible}
              onChange={(e) =>
                setState({ ...state, visible: !e.target.checked })
              }
            />{" "}
            Hide map from customer
          </label>
          <Field label="Customer map caption">
            <textarea
              value={state.caption}
              maxLength={500}
              onChange={(e) => setState({ ...state, caption: e.target.value })}
            />
          </Field>
        </div>
      <div className="marker-fields">
        {(["current", "destination"] as const).map((key) => (
          <div key={key}>
            <h3>{key === "current" ? "Current location" : "Destination"}</h3>
            {state[key] ? (
              <PointFields
                point={state[key]!}
                onChange={(p) => {setState({ ...state, [key]: p });if(target===key)setLabel(p.label);}}
              />
            ) : (
              <p>Not set</p>
            )}
            <button
              type="button"
              onClick={() =>
                setState({
                  ...state,
                  [key]: state[key] ? null : { x: 50, y: 50, label: key },
                })
              }
            >
              {state[key] ? "Clear marker" : "Add marker"}
            </button>
          </div>
        ))}
      </div>
      <h3>Planned waypoints ({state.waypoints.length}/20)</h3>
      {state.waypoints.map((p, i) => (
        <div className="waypoint" key={i}>
          <strong>{i + 1}</strong>
          <PointFields
            point={p}
            onChange={(p) =>
              setState({
                ...state,
                waypoints: state.waypoints.map((v, j) => (i === j ? p : v)),
              })
            }
          />
          <button
            disabled={i === 0}
            onClick={() => {
              const w = [...state.waypoints];
              [w[i - 1], w[i]] = [w[i], w[i - 1]];
              setState({ ...state, waypoints: w });
            }}
          >
            ↑
          </button>
          <button
            disabled={i === state.waypoints.length - 1}
            onClick={() => {
              const w = [...state.waypoints];
              [w[i + 1], w[i]] = [w[i], w[i + 1]];
              setState({ ...state, waypoints: w });
            }}
          >
            ↓
          </button>
          <button
            onClick={() =>
              setState({
                ...state,
                waypoints: state.waypoints.filter((_, j) => j !== i),
              })
            }
          >
            Remove
          </button>
        </div>
      ))}
      <div className="actions">
        <button
          className="button outline"
          onClick={async () => {
            try {
              await api(
                `/admin/shipments/${code}/map/preview`,
                send("POST", state),
              );
              setPreview(!preview);
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          {preview ? "Back to editor" : "Preview as customer"}
        </button>
        <button
          className="button outline"
          onClick={async () => {
            try {
              const r = await api(
                `/admin/shipments/${code}/map/reset`,
                send("POST", {}),
              );
              setState(mapSchema.parse(r));
              await onSaved();
              setNotice("Default map saved; current and destination retained.");
            } catch (e: any) {
              setError(e.message);
            }
          }}
        >
          Reset to default
        </button>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />{" "}
          Notify customer
        </label>
      </div>
      </details>
      <div className="actions map-save-actions"><button type="button" className="button orange-bg" disabled={saving} onClick={save}>{saving?'Saving map...':'Save map'}</button></div>
    </section>
  );
}
function PointFields({
  point,
  onChange,
}: {
  point: Point;
  onChange: (p: Point) => void;
}) {
  return (
    <div className="point-fields">
      <Field label="Label">
        <input
          value={point.label}
          maxLength={120}
          onChange={(e) => onChange({ ...point, label: e.target.value })}
        />
      </Field>
      <Field label="Longitude"><input type="number" min={-180} max={180} step="any" value={point.lng ?? ''} onChange={e=>{if(!e.target.value){const {lng,lat,...legacy}=point;onChange(legacy);}else onChange(geographicPoint(Number(e.target.value),point.lat??0,point.label));}}/></Field>
      <Field label="Latitude"><input type="number" min={-85.051129} max={85.051129} step="any" value={point.lat ?? ''} onChange={e=>{if(!e.target.value){const {lng,lat,...legacy}=point;onChange(legacy);}else onChange(geographicPoint(point.lng??0,Number(e.target.value),point.label));}}/></Field>
    </div>
  );
}
function Locations() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState("");
  async function load() {
    setRows((await api("/admin/locations")).locations);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  return (
    <section className="panel">
      <h2>Named map locations</h2>
      <p>
        Record verified longitude and latitude coordinates. These
        locations are never assigned automatically.
      </p>
      <form
        className="filters"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = e.currentTarget;
          const d = Object.fromEntries(new FormData(f));
          try {
            await api(
              "/admin/locations",
              send("POST", {
                name: d.name,
                point: geographicPoint(Number(d.lng),Number(d.lat),String(d.name)),
              }),
            );
            f.reset();
            await load();
          } catch (e: any) {
            setError(e.message);
          }
        }}
      >
        <Field label="Location name">
          <input name="name" required maxLength={100} />
        </Field>
        <Field label="Longitude">
          <input name="lng" type="number" min="-180" max="180" step="any" required />
        </Field>
        <Field label="Latitude">
          <input name="lat" type="number" min="-85.051129" max="85.051129" step="any" required />
        </Field>
        <button className="button dark">Save location</button>
      </form>
      <ErrorBox error={error} />
      {rows.map((l) => (
        <div className="feature" key={l._id}>
          <strong>{l.name}</strong>
          <span>
            {l.point.lng == null ? "Geographic coordinates not yet set" : `${l.point.lng}, ${l.point.lat}`}
          </span>
          <button
            onClick={async () => {
              try {
                await api("/admin/locations/" + l._id, send("DELETE", {}));
                await load();
              } catch (e: any) {
                setError(e.message);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </section>
  );
}
