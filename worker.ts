const BACKEND_ORIGIN = "https://inter-logistics-server.onrender.com";

type Env = { ASSETS: { fetch(request: Request): Promise<Response> } };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api" && !url.pathname.startsWith("/api/"))
      return env.ASSETS.fetch(request);

    // Keep session cookies first-party in the browser; Render still owns auth.
    const upstream = new URL(BACKEND_ORIGIN);
    upstream.pathname = url.pathname;
    upstream.search = url.search;
    try {
      const forwarded = new Request(upstream, request);
      forwarded.headers.delete("host");
      const response = await fetch(forwarded, { redirect: "manual" });
      const result = new Response(response.body, response);
      result.headers.set("Cache-Control", "no-store");
      return result;
    } catch {
      return Response.json({ error: "The backend is temporarily unavailable. Please try again." }, {
        status: 502, headers: { "Cache-Control": "no-store" },
      });
    }
  },
};
