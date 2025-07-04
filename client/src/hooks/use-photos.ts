import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Photo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function usePhotos(approved?: boolean) {
  return useQuery({
    queryKey: ["/api/photos", approved],
    queryFn: () => api.getPhotos(approved),
  });
}

export function useUploadPhotos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.uploadPhotos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Úspěch!",
        description: "Fotky byly úspěšně nahrány",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při nahrávání",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useTogglePhotoLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.togglePhotoLike,
    onSuccess: (data, photoId) => {
      // Update the photo in cache
      queryClient.setQueryData(["/api/photos"], (oldData: Photo[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: data.likes }
            : photo
        );
      });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Fotka smazána",
        description: "Fotka byla úspěšně smazána",
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

export function useApprovePhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.approvePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Fotka schválena",
        description: "Fotka byla úspěšně schválena",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při schvalování",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
