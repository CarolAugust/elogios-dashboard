import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api as routesApi } from "@shared/routes";
import type { InsertElogio } from "@shared/schema";

// Helper to handle date objects which need to be strings for query params
type ListElogiosParams = {
  type?: string;
  motorista?: string;
  cidade?: string;
  start?: Date | string;
  end?: Date | string;
  page?: number;
  limit?: number;
};

type DateLike = Date | string | number | null | undefined;

function toISO(value: DateLike): string | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

// ✅ Helper: always send Bearer token when exists (clean quotes/spaces)
function authHeaders(): Record<string, string> {
  const raw = sessionStorage.getItem("token"); // ✅ era localStorage
  const token = raw?.replace(/^"|"$/g, "").trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


// ✅ read error even if not JSON
async function parseErrorMessage(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    // ✅ Mostra message + error + received
    return (
      data?.error ||
      data?.message ||
      JSON.stringify(data) ||
      `Erro ${res.status}`
    );
  }
  const text = await res.text().catch(() => "");
  return text || `Erro ${res.status}`;
}


// ✅ workaround for TS complaining about create/path/method depending on route typing
const elogios = (routesApi as any).elogios;

export function useElogios(params?: ListElogiosParams) {
  const queryParams: Record<string, string> = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.motorista) queryParams.motorista = params.motorista;
  if (params?.cidade) queryParams.cidade = params.cidade;
  const startISO = toISO(params?.start);
  if (startISO) queryParams.start = startISO;
  const endISO = toISO(params?.end);
  if (endISO) queryParams.end = endISO;
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();

  const queryString = new URLSearchParams(queryParams).toString();
  const fetchUrl = queryString ? `${elogios.list.path}?${queryString}` : elogios.list.path;

  return useQuery({
    queryKey: [fetchUrl],
    queryFn: async () => {
      const res = await fetch(fetchUrl, {
      headers: authHeaders(),
});


      if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
      }

      return elogios.list.responses[200].parse(await res.json());
    },
  });
}

export function useElogiosStats(filters?: { start?: string; end?: string }) {
  return useQuery({
    queryKey: ["elogios-stats", filters?.start || "", filters?.end || ""],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start) params.append("start", new Date(filters.start).toISOString());
      if (filters?.end) params.append("end", new Date(filters.end).toISOString());

      const url = params.toString()
        ? `/api/elogios/stats?${params.toString()}`
        : `/api/elogios/stats`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}


export function useCreateElogio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/elogios/votacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await parseErrorMessage(res);
        console.log("CREATE ELOGIO FAIL", res.status, msg);
        throw new Error(msg || `Erro ${res.status}`);
      }


      return await res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/elogios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/elogios/stats"] });
    },
  });
}


export function useExportElogios(params: {
type: string;
motorista?: string;
cidade?: string;
start?: Date | string;
end?: Date | string;
}) {
  
  const queryParams: Record<string, string> = { type: params.type };
  if (params.motorista) queryParams.motorista = params.motorista;
  if (params.cidade) queryParams.cidade = params.cidade;
  const startISO = toISO(params.start);
  if (startISO) queryParams.start = startISO;
  const endISO = toISO(params.end);
  if (endISO) queryParams.end = endISO;

  const queryString = new URLSearchParams(queryParams).toString();
  const fetchUrl = `${elogios.export.path}?${queryString}`;

  return useQuery({
    queryKey: [fetchUrl],
    queryFn: async () => {
      const res = await fetch(fetchUrl, {
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
      }

      return elogios.export.responses[200].parse(await res.json());
    },
    enabled: false,
  });
}
