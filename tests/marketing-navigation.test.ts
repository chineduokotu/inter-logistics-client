// @vitest-environment happy-dom
import { act } from "react";
import { expect, it, vi } from "vitest";

it("connects the new service and about pages to the existing booking flow", async () => {
  document.body.innerHTML = '<div id="root"></div>';
  window.history.replaceState({}, "", "/services");
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  try {
    await act(async () => { await import("../src/main"); });
    expect(document.querySelector("h1")?.textContent).toBe("Services");
    const air = document.querySelector<HTMLAnchorElement>('.service-page-image[href="/book?type=Air%20Freight"]')!;
    expect(air).toBeTruthy();
    await act(async () => air.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));
    expect(document.querySelector<HTMLSelectElement>('select[name="type"]')?.value).toBe("Air Freight");
    const about = document.querySelector<HTMLAnchorElement>('header a[href="/about"]')!;
    await act(async () => about.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));
    expect(document.querySelector("h1")?.textContent).toBe("About us");
    expect(document.querySelectorAll(".workflow-grid article")).toHaveLength(4);
    expect(document.querySelector('footer a[href="/admin"]')).toBeNull();
  } finally { vi.restoreAllMocks(); }
});
