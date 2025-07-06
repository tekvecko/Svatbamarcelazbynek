import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Photo, type PhotoComment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function usePhotos(approved?: boolean, page = 1, limit = 12) {
  return useQuery({
    queryKey: ["/api/photos", approved, page, limit],
    queryFn: async () => {
      const response = await api.getPhotos(approved, page, limit);
      // Extract photos array from the response object
      return response.photos || [];
    },
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
      // Update the photo in all related caches
      const updatePhotoLikes = (oldData: Photo[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(photo => 
          photo.id === photoId 
            ? { ...photo, likes: data.likes }
            : photo
        );
      };
      
      // Update all photo query caches to maintain consistency
      queryClient.setQueryData(["/api/photos"], updatePhotoLikes);
      queryClient.setQueryData(["/api/photos", true], updatePhotoLikes);
      queryClient.setQueryData(["/api/photos", false], updatePhotoLikes);
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

export function usePhotoComments(photoId: number) {
  return useQuery({
    queryKey: ["/api/photos", photoId, "comments"],
    queryFn: () => api.getPhotoComments(photoId),
    enabled: !!photoId,
  });
}

export function useAddPhotoComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ photoId, author, text }: { photoId: number; author: string; text: string }) =>
      api.addPhotoComment(photoId, author, text),
    onSuccess: (data, { photoId }) => {
      // First, add the comment to the comments cache
      queryClient.setQueryData(["/api/photos", photoId, "comments"], (oldComments: any) => {
        if (!oldComments) return [data];
        return [...oldComments, data];
      });
      
      // Then update the photo's comment count in all photos caches
      const updatePhotoCount = (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((photo: any) => 
          photo.id === photoId 
            ? { ...photo, commentCount: (photo.commentCount || 0) + 1 }
            : photo
        );
      };
      
      queryClient.setQueryData(["/api/photos"], updatePhotoCount);
      queryClient.setQueryData(["/api/photos", true], updatePhotoCount);
      queryClient.setQueryData(["/api/photos", false], updatePhotoCount);
      
      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      
      toast({
        title: "Komentář přidán",
        description: "Váš komentář byl úspěšně přidán",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při přidávání komentáře",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
