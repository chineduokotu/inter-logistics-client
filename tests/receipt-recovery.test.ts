// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import * as API from "../src/api";
import { SubmissionReceiptPage } from "../src/SubmissionReceipt";

it("recovers a saved receipt by reference without submitting again", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const api = vi.spyOn(API, "api").mockResolvedValue({ code: "CG-SAVED", receipt: {
    kind: "shipment", reference: "CG-SAVED", submittedAt: "2026-10-17T12:00:00.000Z",
    details: { sender: { name: "Saved sender", phone: "123", address: "Saved pickup" }, recipient: { name: "Saved recipient", phone: "456", address: "Saved delivery" }, description: "Saved cargo", quantity: 2, weight: 5, type: "Air Freight", dimensions: "10 x 20", preferences: "Saved preference", photoCount: 0 },
  } });
  const container = document.createElement("div"); document.body.appendChild(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(React.createElement(MemoryRouter, { initialEntries: ["/receipt?reference=CG-SAVED"] }, React.createElement(SubmissionReceiptPage))));
    expect(container.querySelector(".receipt-card")?.textContent).toContain("Saved pickup");
    expect(container.querySelector(".receipt-card")?.textContent).toContain("CG-SAVED");
    expect(api).toHaveBeenCalledWith("/submission-receipts/CG-SAVED");
    expect(api.mock.calls.every(([, options]) => !options?.method || options.method === "GET")).toBe(true);
  } finally { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); }
});
