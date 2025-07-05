import React, { useState } from "react";
import { usePlaylist, useAddSong, useToggleSongLike } from "@/hooks/use-playlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Music, Plus, Loader2, Play, Search, TrendingUp, Headphones, Mic, Volume2, MoreVertical, ThumbsUp, Clock, User, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Playlist() {
  const [songInput, setSongInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
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
      song.title.toLowerCase() === title.toLowerCase() && 
      (!artist || !song.artist || song.artist.toLowerCase() === artist.toLowerCase())
    ) : null;

    if (existingSong) {
      toast({
        title: "Písnička již existuje",
        description: "Tato písnička je již v playlistu",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      await addSong.mutateAsync({ title, artist });
      setSongInput("");
      setShowAddForm(false);
      toast({
        title: "Písnička přidána!",
        description: `${artist ? `${artist} - ` : ''}${title}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to add song:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se přidat písničku",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (songId: number) => {
    try {
      await toggleLike.mutateAsync(songId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const filteredSongs = songs?.filter(song => 
    !searchTerm || 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const popularSongs = songs?.filter(song => song.likes >= 3) || [];
  const recentSongs = songs?.slice(-5) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Načítám playlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Android-style Header */}
      <div className="flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Hudební přání</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {songs?.length || 0} písniček • {songs?.reduce((sum, song) => sum + song.likes, 0)} lajků
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-12 h-12 p-0 rounded-full ${
            showAddForm 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white shadow-lg`}
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </Button>
      </div>

      {/* Add Song Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4"
          >
            <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Navrhnout písničku</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Přidejte svůj hudební tip</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <Input
                    placeholder="Interpret - Název písničky"
                    value={songInput}
                    onChange={(e) => setSongInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSong()}
                    className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-base"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Příklady: "Ed Sheeran - Perfect", "Perfect by Ed Sheeran"
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddSong}
                    disabled={!songInput.trim() || addSong.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 font-medium shadow-lg"
                  >
                    {addSong.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Přidávám...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Navrhnout
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full px-6 py-3"
                  >
                    Zrušit
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <div className="mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hledat v playlistu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-full"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3 px-4 overflow-x-auto">
        <Card className="flex-shrink-0 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {popularSongs.length} populárních
            </span>
          </div>
        </Card>
        
        <Card className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {recentSongs.length} nových
            </span>
          </div>
        </Card>
        
        <Card className="flex-shrink-0 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {songs?.reduce((sum, song) => sum + song.likes, 0)} lajků celkem
            </span>
          </div>
        </Card>
      </div>

      {/* Songs List */}
      <div className="mx-4 space-y-2">
        {filteredSongs.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {searchTerm ? 'Nenalezeny žádné písničky' : 'Žádné písničky'}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Zkuste jiné hledané výrazy' 
                : 'Buďte první, kdo navrhne písničku na svatbu!'
              }
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-2"
              >
                <Music className="h-4 w-4 mr-2" />
                Přidat první písničku
              </Button>
            )}
          </Card>
        ) : (
          <AnimatePresence>
            {filteredSongs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center p-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 dark:text-white truncate">
                        {song.title}
                      </h4>
                      {song.artist && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          {song.suggestedBy}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(song.createdAt).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {song.likes >= 3 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Populární
                        </Badge>
                      )}
                      
                      <Button
                        onClick={() => handleLike(song.id)}
                        disabled={toggleLike.isPending}
                        variant="ghost"
                        size="sm"
                        className={`rounded-full px-3 py-2 ${
                          song.likes > 0 
                            ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          className={`h-4 w-4 mr-1 ${song.likes > 0 ? 'fill-current' : ''}`}
                        />
                        {song.likes}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Search Empty State */}
      {searchTerm && filteredSongs.length === 0 && songs && songs.length > 0 && (
        <div className="mx-4 text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Nenalezeny žádné výsledky
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Zkuste jiné hledané výrazy nebo přidejte novou písničku
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => setSearchTerm('')}
              variant="outline" 
              className="rounded-full"
            >
              Vymazat hledání
            </Button>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Přidat písničku
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}