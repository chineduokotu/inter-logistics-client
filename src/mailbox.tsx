import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, send } from "./api";
import { Page, Field, ErrorBox, Pagination } from "./components";
export function Login({
  admin,
  onLogin,
}: {
  admin?: boolean;
  onLogin: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await api(admin ? "/admin/login" : "/mailbox/login", send("POST", data));
      onLogin();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (admin && resetMode) {
    return (
      <form
        className="panel login-panel"
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setError("");
          setResetSuccess("");
          const data = Object.fromEntries(new FormData(e.currentTarget));
          const email = String(data.email || "").trim();
          const currentPassword = String(data.currentPassword || "");
          const newPassword = String(data.newPassword || "").trim();
          const confirmPassword = String(data.confirmPassword || "").trim();
          if (!newPassword || newPassword.length < 4) {
            setError("New PIN must be at least 4 characters.");
            return;
          }
          if (newPassword !== confirmPassword) {
            setError("New PIN and confirmation do not match.");
            return;
          }
          setBusy(true);
          try {
            await api("/admin/reset-pin", send("POST", { email, currentPassword, newPassword }));
            setResetSuccess("Admin PIN reset successfully. You can now sign in with your new PIN.");
            setResetMode(false);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow orange">OPERATIONS SECURITY</p>
        <h2>Reset Admin PIN</h2>
        <p>Enter your administrator email, current PIN, and choose a new PIN.</p>
        <Field label="Email address">
          <input name="email" type="email" required autoComplete="username" />
        </Field>
        <Field label="Current PIN">
          <input name="currentPassword" type="password" required autoComplete="current-password" />
        </Field>
        <Field label="New PIN">
          <input name="newPassword" type="password" required minLength={4} maxLength={200} autoComplete="new-password" placeholder="Min 4 characters" />
        </Field>
        <Field label="Confirm new PIN">
          <input name="confirmPassword" type="password" required minLength={4} maxLength={200} autoComplete="new-password" placeholder="Confirm new PIN" />
        </Field>
        <ErrorBox error={error} />
        <div className="actions" style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
          <button className="button orange-bg" disabled={busy}>
            {busy ? "Updating…" : "Reset PIN ↗"}
          </button>
          <button
            type="button"
            className="button outline"
            onClick={() => {
              setResetMode(false);
              setError("");
            }}
          >
            Back to sign in
          </button>
        </div>
      </form>
    );
  }
  return (
    <form className="panel login-panel" onSubmit={submit}>
      <p className="eyebrow orange">
        {admin ? "OPERATIONS ACCESS" : "YOUR SECURE MAILBOX"}
      </p>
      <h2>{admin ? "Welcome back." : "Your freight. Your messages."}</h2>
      <p>
        {admin
          ? "Sign in to manage shipments and customer conversations."
          : "Enter your email and the access code for your booking or inquiry. Each new submission has its own code."}
      </p>
      <Field label="Email address">
        <input name="email" type="email" required autoComplete="username" />
      </Field>
      <Field label={admin ? "Password" : "Mailbox access code"}>
        <input
          name={admin ? "password" : "code"}
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      <ErrorBox error={error} />
      {resetSuccess && (
        <div className="code-warning" style={{ margin: "16px 0", color: "#166534", borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
          <strong>✓ {resetSuccess}</strong>
        </div>
      )}
      <button className="button orange-bg" disabled={busy}>
        {busy ? "Signing in…" : "Sign in ↗"}
      </button>
      {admin && (
        <p style={{ marginTop: "16px" }}>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setResetMode(true);
              setError("");
              setResetSuccess("");
            }}
          >
            Reset PIN ↗
          </button>
        </p>
      )}
      {!admin && (
        <p className="muted small">
          Lost your code? Contact our team to verify your identity and request a
          replacement. Messages are available only on this website.
        </p>
      )}
    </form>
  );
}
export function Mailbox() {
  const [ready, setReady] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    const expired = () => setReady(false);
    window.addEventListener("cargoa-session-expired", expired);
    return () => window.removeEventListener("cargoa-session-expired", expired);
  }, []);
  useEffect(() => {
    api("/session")
      .then((s) => setReady(s.role === "customer"))
      .catch(() => {});
  }, []);
  return (
    <Page eyebrow="CONNECTED CONVERSATIONS" title="My Mailbox." background="warehouse">
      <ErrorBox error={logoutError} />
      {ready ? (
        <>
          <div className="toolbar">
            <p>Updates and replies, in one place.</p>
            <button
              className="text-button"
              onClick={async () => {
                try { await api("/logout", send("POST", {})); setReady(false); setLogoutError(""); }
                catch (e: any) { setLogoutError(e.message); }
              }}
            >
              Sign out
            </button>
          </div>
          <Inbox />
        </>
      ) : (
        <Login onLogin={() => setReady(true)} />
      )}
    </Page>
  );
}
export function Inbox({
  admin = false,
  onUnread,
}: {
  admin?: boolean;
  onUnread?: (n: number) => void;
}) {
  const base = admin ? "/admin/inbox" : "/mailbox/threads";
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>();
  const [thread, setThread] = useState<any>();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = selected ? drafts[selected] || "" : "";
  const setDraft = (value: string) => {
    if (selected) setDrafts(previous => ({ ...previous, [selected]: value }));
  };
  const openVersion = useRef(0);
  const [newMessage, setNewMessage] = useState(false);
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({ sender: "", from: "", to: "" });
  async function load(nextPage = 1) {
    setBusy(true);
    try {
      const r = await api(
        base +
          "?" +
          new URLSearchParams({
            page: String(nextPage),
            q,
            status,
            archived: String(archived),
            ...filters,
          }),
      );
      setList(r.threads);
      setTotal(r.total);
      setPage(nextPage);
      onUnread?.(r.unread);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, [status, archived]);
  async function open(id: string) {
    const version = ++openVersion.current;
    setError("");
    setSelected(id);
    setThread(undefined);
    setNewMessage(false);
    try {
      const t = await api(base + "/" + id);
      if (version !== openVersion.current) return;
      setThread(t);
      await api(
        base + "/" + id,
        send("PATCH", { unread: false }),
      );
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function action(data: any) {
    if (!selected) return;
    try {
      await api(base + "/" + selected, send("PATCH", data));
      setSelected(undefined);
      setThread(undefined);
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const target = selected;
    const version = openVersion.current;
    setSending(true);
    setError("");
    try {
      await api(
        base + "/" + selected + "/reply",
        send("POST", { body: draft }),
      );
      setDrafts(previous => ({ ...previous, [target]: "" }));
      if (version === openVersion.current) await open(target);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  async function compose(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    try {
      const r = await api(
        base,
        send("POST", Object.fromEntries(new FormData(form))),
      );
      setNewMessage(false);
      await load();
      await open(r.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      <div className="inbox-toolbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="search-row"
        >
          <input
            aria-label="Search messages"
            placeholder="Search subject, message or tracking code"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="button dark">Search</button>
        </form>
        {admin ? (
          <>
            <select
              aria-label="Message status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {["New", "Read", "Replied", "Archived"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <input
              aria-label="Sender email"
              placeholder="Sender email"
              value={filters.sender}
              onChange={(e) =>
                setFilters({ ...filters, sender: e.target.value })
              }
            />
            <input
              aria-label="From date (UTC)" title="Start of day in UTC"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
            <input
              aria-label="To date (UTC)" title="Includes the entire selected day in UTC"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </>
        ) : (
          <>
            <button
              className="button orange-bg"
              onClick={() => {
                setNewMessage(true);
                setThread(undefined);
              }}
            >
              Compose ↗
            </button>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={archived}
                onChange={(e) => setArchived(e.target.checked)}
              />{" "}
              Archived
            </label>
          </>
        )}
      </div>
      <ErrorBox error={error} />
      <div className="inbox-layout">
        <section className="message-list panel">
          <p className="eyebrow">
            {busy ? "LOADING…" : `${list.length} CONVERSATIONS`}
          </p>
          {!busy && !list.length && (
            <div className="empty">No messages found.</div>
          )}
          {list.map((t) => (
            <button
              className={
                "message-row " +
                ((admin ? t.adminUnread : t.customerUnread) ? "unread " : "") +
                (selected === t.id ? "selected" : "")
              }
              key={t.id}
              onClick={() => open(t.id)}
            >
              <div>
                <strong>
                  {admin
                    ? t.sender
                    : t.kind === "system"
                      ? "InterCargo Updates"
                      : "InterCargo Team"}
                </strong>
                <small>{new Date(t.updatedAt).toLocaleDateString()}</small>
              </div>
              <h3>{t.subject}</h3>
              <p>{t.preview}</p>
              <span className="badge">
                {admin
                  ? t.status
                  : t.kind === "system"
                    ? "Shipment update"
                    : "Conversation"}
              </span>
            </button>
          ))}
          <Pagination page={page} total={total} onChange={load} />
        </section>
        <section className="panel conversation">
          {newMessage ? (
            <form onSubmit={compose}>
              <h2>New message</h2>
              <Field label="Subject">
                <input name="subject" maxLength={200} required />
              </Field>
              <Field label="Tracking code (optional)">
                <input name="trackingCode" maxLength={80} />
              </Field>
              <Field label="Message">
                <textarea name="body" rows={8} required maxLength={10000} />
              </Field>
              <button className="button orange-bg" disabled={sending}>
                {sending ? "Saving…" : "Send message ↗"}
              </button>
            </form>
          ) : thread ? (
            <>
              <div className="thread-heading">
                <h2>{thread.thread.subject}</h2>
                {!admin && thread.thread.receiptReference && <Link className="button outline" to={"/receipt?reference=" + encodeURIComponent(thread.thread.receiptReference)}>View Receipt</Link>}
                <div className="actions">
                  <button onClick={() => action({ unread: true })}>
                    Mark unread
                  </button>
                  <button
                    onClick={() =>
                      action(
                        admin
                          ? {
                              status:
                                thread.thread.status === "Archived"
                                  ? "Read"
                                  : "Archived",
                            }
                          : { archived: !archived },
                      )
                    }
                  >
                    {(admin ? thread.thread.status === "Archived" : archived)
                      ? "Unarchive"
                      : "Archive"}
                  </button>
                  {admin && (
                    <button onClick={() => action({ deleted: true })}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {admin && thread.customer && (
                <p className="muted">
                  {thread.customer.name} · {thread.customer.email}{" "}
                  {thread.customer.phone && `· ${thread.customer.phone}`}
                </p>
              )}
              {thread.thread.trackingCode && (
                <p className="muted">
                  Linked shipment: {thread.thread.trackingCode}
                </p>
              )}
              {thread.messages.map((m: any) => (
                <article
                  className={"message-bubble " + m.senderType}
                  key={m._id}
                >
                  <div>
                    <strong>
                      {m.senderType === "customer"
                        ? "Customer"
                        : m.senderType === "system"
                          ? "InterCargo Updates"
                          : "InterCargo Team"}
                    </strong>
                    <small>{new Date(m.createdAt).toLocaleString()}</small>
                  </div>
                  <p>{m.body}</p>
                </article>
              ))}
              {thread.thread.kind === "inquiry" ? (
                <form onSubmit={sendReply}>
                  <Field label="Your reply">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      required
                      maxLength={10000}
                      rows={5}
                    />
                  </Field>
                  <button className="button orange-bg" disabled={sending}>
                    {sending ? "Saving reply…" : "Send reply ↗"}
                  </button>
                </form>
              ) : (
                <p className="muted">
                  For questions about this update, compose a new message with
                  your tracking code.
                </p>
              )}
            </>
          ) : (
            <div className="empty">
              {selected
                ? "Loading conversation…"
                : "Select a conversation to read messages."}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
