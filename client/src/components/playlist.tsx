import React, { useState } from "react";
import { usePlaylist, useAddSong, useToggleSongLike } from "@/hooks/use-playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Heart, Music, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Playlist() {
  const [songInput, setSongInput] = useState("");
  const { data: songs, isLoading } = usePlaylist();
  const addSong = useAddSong();
  const toggleLike = useToggleSongLike();
  const { toast } = useToast();

  const handleAddSong = async () => {
    if (!songInput.trim()) return;

    // Enhanced parsing logic with multiple patterns
    const input = songInput.trim();
    let title = input;
    let artist = undefined;

    // Pattern 1: "Artist - Title"
    if (input.includes(' - ')) {
      const parts = input.split(' - ');
      if (parts.length === 2) {
        artist = parts[0].trim();
        title = parts[1].trim();
      }
    }
    // Pattern 2: "Artist: Title"
    else if (input.includes(': ')) {
      const parts = input.split(': ');
      if (parts.length === 2) {
        artist = parts[0].trim();
        title = parts[1].trim();
      }
    }
    // Pattern 3: "Title by Artist"
    else if (input.toLowerCase().includes(' by ')) {
      const parts = input.toLowerCase().split(' by ');
      if (parts.length === 2) {
        title = input.substring(0, input.toLowerCase().indexOf(' by ')).trim();
        artist = input.substring(input.toLowerCase().indexOf(' by ') + 4).trim();
      }
    }

    // Check for duplicates
    const existingSong = songs && Array.isArray(songs) ? songs.find((song: any) => 
      song.title?.toLowerCase() === title.toLowerCase() && 
      song.artist?.toLowerCase() === artist?.toLowerCase()
    ) : null;

    if (existingSong) {
      toast({
        title: "Skladba už je v playlistu",
        description: `"${title}" ${artist ? `od ${artist}` : ''} už byla přidána`,
        variant: "destructive",
      });
      return;
    }

    try {
      await addSong.mutateAsync({
        suggestion: input,
        title,
        artist,
      });
      setSongInput("");
    } catch (error) {
      console.error('Failed to add song:', error);
    }
  };

  const handleLike = (songId: number) => {
    toggleLike.mutate(songId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSong();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Načítám playlist...</span>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg p-4 sm:p-6">
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Navrhněte skladbu, kterou byste rádi slyšeli na svatbě!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Input
          value={songInput}
          onChange={(e) => setSongInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Název skladby nebo interpret..."
          className="flex-1 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
        />
        <Button
          onClick={handleAddSong}
          disabled={!songInput.trim() || addSong.isPending}
          className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          {addSong.isPending ? "Přidávám..." : "Přidat"}
        </Button>
      </div>

      {songs && songs.length > 0 ? (
        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-wedding"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">{song.suggestion}</div>
                  {song.artist && song.title && (
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {song.artist} - {song.title}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  onClick={() => handleLike(song.id)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 sm:p-1.5"
                >
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4" fill={song.likes > 0 ? "currentColor" : "none"} />
                  {song.likes > 0 && <span className="ml-1 text-xs sm:text-sm">{song.likes}</span>}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400">
          <Music className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base">Zatím žádné návrhy. Přidejte první skladbu!</p>
        </div>
      )}
    </Card>
  );
}