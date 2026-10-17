// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import * as API from "../src/api";
import { Inbox } from "../src/mailbox";

it("keeps drafts with their conversation and preserves archived status when opening", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const api = vi.spyOn(API, "api").mockImplementation(async (path, options) => {
    if (options?.method) return { ok: true } as any;
    if (path.includes("?")) return { total: 2, unread: 0, threads: ["A", "B"].map(id => ({ id, subject: `Conversation ${id}`, status: "Archived", updatedAt: new Date().toISOString() })) } as any;
    return { thread: { id: path.split("/").at(-1), subject: path.endsWith("A") ? "Selected A" : "Selected B", kind: "inquiry", status: "Archived" }, messages: [] } as any;
  });
  const container = document.createElement("div"); document.body.appendChild(container);
  const root = createRoot(container);
  const click = async (text: string) => {
    const button = Array.from(container.querySelectorAll("button")).find(b => b.textContent?.includes(text));
    expect(button).toBeTruthy();
    await act(async () => button!.click());
  };
  try {
    await act(async () => root.render(React.createElement(MemoryRouter, {}, React.createElement(Inbox, { admin: true }))));
    await click("Conversation A");
    const textarea = container.querySelector("textarea")!;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")!.set!;
    await act(async () => { setter.call(textarea, "Private draft for A"); textarea.dispatchEvent(new Event("input", { bubbles: true })); });
    await click("Conversation B");
    expect(container.querySelector("textarea")!.value).toBe("");
    await click("Conversation A");
    expect(container.querySelector("textarea")!.value).toBe("Private draft for A");
    for (const [, options] of api.mock.calls.filter(([, options]) => options?.method === "PATCH"))
      expect(JSON.parse(options!.body as string)).toEqual({ unread: false });
  } finally {
    await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks();
  }
});
