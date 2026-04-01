type ApiOptions = RequestInit & { skipAuth?: boolean };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  // ✅ agora o token vem da sessão da aba (some ao fechar)
  const rawToken = sessionStorage.getItem("token");
  const token = rawToken?.replace(/^"|"$/g, "").trim(); // remove aspas

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    console.log("API ERROR:", path, res.status, data);

    // ✅ se expirou/deslogou, limpa a sessão
    if (res.status === 401) {
      sessionStorage.removeItem("token");
    }

    const msg = (data as any)?.message ? (data as any).message : "Erro na API";
    const err: any = new Error(msg);
    err.status = res.status; // ✅ importante pro seu AuthContext (err.status === 401)
    err.data = data;
    throw err;
  }

  return data as T;
}