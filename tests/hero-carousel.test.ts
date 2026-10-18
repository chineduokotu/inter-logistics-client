// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { HeroCarousel } from "../src/HeroCarousel";

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
async function setup(reduced = false) {
  vi.useFakeTimers();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() } as any);
  const container = document.createElement("div"); document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(MemoryRouter, {}, React.createElement(HeroCarousel))));
  const button = (label: string) => container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
  const close = async () => { await act(async () => root.unmount()); container.remove(); };
  return { container, button, close };
}
it("preserves links and supports buttons, dots and keyboard navigation", async () => {
  const { container, button, close } = await setup();
  try {
    expect(container.querySelector('a[href="/book"]')).toBeTruthy();
    expect(container.querySelector('a[href="#services"]')).toBeTruthy();
    await act(async () => button("Next slide").click());
    // Keep the current image visible until the requested slide has loaded.
    expect(button("Show Ocean freight slide").getAttribute("aria-pressed")).toBe("true");
    await act(async () => container.querySelectorAll("img").forEach(image => image.dispatchEvent(new Event("load"))));
    expect(button("Show Ground transport slide").getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector("h1")?.textContent).toContain("BUSINESS");
    await act(async () => container.querySelector("section")!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(button("Show Air freight slide").getAttribute("aria-pressed")).toBe("true");
    await act(async () => button("Show Ocean freight slide").click());
    expect(button("Show Ocean freight slide").getAttribute("aria-pressed")).toBe("true");
  } finally { await close(); }
});
it("automatically advances loaded slides and pauses on request", async () => {
  const { container, button, close } = await setup();
  try {
    await act(async () => vi.advanceTimersByTime(1800));
    await act(async () => container.querySelectorAll("img").forEach(image => image.dispatchEvent(new Event("load"))));
    await act(async () => vi.advanceTimersByTime(6500));
    expect(button("Show Ground transport slide").getAttribute("aria-pressed")).toBe("true");
    await act(async () => button("Pause slideshow").click());
    await act(async () => vi.advanceTimersByTime(13000));
    expect(button("Show Ground transport slide").getAttribute("aria-pressed")).toBe("true");
  } finally { await close(); }
});
it("disables automatic rotation for reduced motion but retains manual controls", async () => {
  const { container, button, close } = await setup(true);
  try {
    await act(async () => vi.advanceTimersByTime(20000));
    expect(button("Show Ocean freight slide").getAttribute("aria-pressed")).toBe("true");
    expect(button("Pause slideshow")).toBeNull();
    await act(async () => container.querySelectorAll("img").forEach(image => image.dispatchEvent(new Event("load"))));
    await act(async () => button("Next slide").click());
    expect(button("Show Ground transport slide").getAttribute("aria-pressed")).toBe("true");
  } finally { await close(); }
});
