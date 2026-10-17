export class ApiError extends Error {
 constructor(message:string, public status:number){super(message);this.name="ApiError";}
}
export const API_URL = (import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api"
  : "/api"
).replace(/\/$/, "");
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
    if (r.status === 401 && !path.endsWith("/login") && typeof window !== "undefined")
      window.dispatchEvent(new Event("cargoa-session-expired"));
    let e;
    try {
      e = await r.json();
    } catch {
      e = { error: "The service is unavailable. Please try again." };
    }
    throw new ApiError(e.error || "Request failed.", r.status);
  }
  return r.json();
}
export const send = (method: string, body: unknown) => ({
  method,
  body: JSON.stringify(body),
});
