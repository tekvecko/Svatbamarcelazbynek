import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface WeddingScheduleItem {
  id: number;
  time: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useWeddingSchedule() {
  return useQuery({
    queryKey: ["/api/schedule"],
    queryFn: async (): Promise<WeddingScheduleItem[]> => {
      const response = await fetch("/api/schedule");
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }
      return response.json();
    },
  });
}

export function useCreateScheduleItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { time: string; title: string; description?: string; orderIndex: number }) => {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create schedule item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({
        title: "Položka harmonogramu přidána",
        description: "Nová položka byla úspěšně přidána do harmonogramu",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při přidávání",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateScheduleItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<WeddingScheduleItem> }) => {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update schedule item");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({
        title: "Harmonogram aktualizován",
        description: "Položka harmonogramu byla úspěšně aktualizována",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při aktualizaci",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteScheduleItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete schedule item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({
        title: "Položka smazána",
        description: "Položka harmonogramu byla úspěšně smazána",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při mazání",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}