import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

type Weights = { interno: number; gestao: number; externo: number };

export function useWeights() {
  return useQuery({
    queryKey: [api.settings.getWeights.path],
    queryFn: async () => {
      const res = await fetch(api.settings.getWeights.path);
      if (!res.ok) throw new Error("Failed to fetch weights");
      return api.settings.getWeights.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateWeights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weights: { interno: number; gestao: number; externo: number }) => {
      const res = await fetch(api.settings.updateWeights.path, {
        method: api.settings.updateWeights.method, // tem que ser "PUT"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });

      if (!res.ok) throw new Error("Failed to update weights");
      return api.settings.updateWeights.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.getWeights.path] });
    },
  });
}
