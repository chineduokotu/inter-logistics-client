import { afterEach, expect, it, vi } from "vitest";
import worker from "../worker";

afterEach(() => vi.unstubAllGlobals());

it("forwards login and cookies to Render without caching the response", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{"role":"admin"}', {
    headers: { "Content-Type": "application/json", "Set-Cookie": "cargoa_session=test-session; Path=/; HttpOnly; Secure; SameSite=None" },
  }));
  vi.stubGlobal("fetch", fetch);
  const assets = vi.fn();
  const result = await worker.fetch(new Request("https://website.example/api/admin/login?test=1", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Cargoa-Request": "1", Cookie: "cargoa_session=existing-session" },
    body: JSON.stringify({ email: "test@example.com", password: "synthetic-test-password" }),
  }), { ASSETS: { fetch: assets } });
  expect(result.status).toBe(200);
  const forwarded = fetch.mock.calls[0][0] as Request;
  expect(forwarded.url).toBe("https://inter-logistics-server.onrender.com/api/admin/login?test=1");
  expect(forwarded.method).toBe("POST");
  expect(forwarded.headers.get("cookie")).toBe("cargoa_session=existing-session");
  expect((await forwarded.json()).email).toBe("test@example.com");
  expect(result.headers.get("set-cookie")).toContain("cargoa_session=test-session");
  expect(result.headers.get("cache-control")).toBe("no-store");
  expect(assets).not.toHaveBeenCalled();
});

it("serves frontend pages through the assets binding", async () => {
  const assets = vi.fn().mockResolvedValue(new Response("frontend"));
  const request = new Request("https://website.example/admin");
  expect(await (await worker.fetch(request, { ASSETS: { fetch: assets } })).text()).toBe("frontend");
  expect(assets).toHaveBeenCalledWith(request);
});

it("returns a clear error when Render cannot be reached", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const result = await worker.fetch(new Request("https://website.example/api/session"), { ASSETS: { fetch: vi.fn() } });
  expect(result.status).toBe(502);
  expect(result.headers.get("cache-control")).toBe("no-store");
});
