import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

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
    queryFn: api.getWeddingSchedule,
  });
}

export function useCreateScheduleItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { time: string; title: string; description?: string; orderIndex: number }) =>
      api.createScheduleItem(data),
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
    mutationFn: ({ id, data }: { id: number; data: Partial<WeddingScheduleItem> }) =>
      api.updateScheduleItem(id, data),
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
    mutationFn: (id: number) => api.deleteScheduleItem(id),
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