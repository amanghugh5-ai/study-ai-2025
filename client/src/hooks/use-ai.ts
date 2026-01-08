import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type GenerateRequest } from "@shared/schema";
import { z } from "zod";

export type HistoryItem = z.infer<typeof api.history.list.responses[200]>[number];
export type GenerateResponse = z.infer<typeof api.ai.generate.responses[200]>;

export function useGenerateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: GenerateRequest) => {
      // Validate input before sending
      const validated = api.ai.generate.input.parse(data);
      
      const res = await fetch(api.ai.generate.path, {
        method: api.ai.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 429) {
          const error = api.ai.generate.responses[429].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 400) {
          const error = api.ai.generate.responses[400].parse(await res.json());
          throw new Error(error.message || "Invalid request");
        }
        throw new Error("Failed to generate content");
      }

      return api.ai.generate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
    },
  });
}

export function useHistory() {
  return useQuery({
    queryKey: [api.history.list.path],
    queryFn: async () => {
      const res = await fetch(api.history.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.history.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete history item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
    },
  });
}
