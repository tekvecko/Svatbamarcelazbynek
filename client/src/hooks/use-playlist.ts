import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type PlaylistSong } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function usePlaylist() {
  return useQuery({
    queryKey: ["/api/playlist"],
    queryFn: api.getPlaylist,
  });
}

export function useAddSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.addSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlist"] });
      toast({
        title: "Skladba přidána!",
        description: "Váš návrh byl úspěšně přidán do playlistu",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při přidávání skladby",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useToggleSongLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.toggleSongLike,
    onSuccess: (data, songId) => {
      // Update the song in cache
      queryClient.setQueryData(["/api/playlist"], (oldData: PlaylistSong[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(song => 
          song.id === songId 
            ? { ...song, likes: data.likes }
            : song
        );
      });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: api.deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlist"] });
      toast({
        title: "Skladba smazána",
        description: "Skladba byla úspěšně odstraněna z playlistu",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při mazání skladby",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
