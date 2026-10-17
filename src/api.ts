export const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api").replace(/\/$/, "");
export const apiUrl = (path: string) => API_URL + path;
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let r: Response;
  try {
    r = await fetch(apiUrl(path), {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        "X-Cargoa-Request": "1",
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Connection lost. Check your connection and retry. Your form has been kept.",
    );
  }
  if (!r.ok) {
    let e;
    try {
      e = await r.json();
    } catch {
      e = { error: "The service is unavailable. Please try again." };
    }
    throw new Error(e.error || "Request failed.");
  }
  return r.json();
}
export const send = (method: string, body: unknown) => ({
  method,
  body: JSON.stringify(body),
});
