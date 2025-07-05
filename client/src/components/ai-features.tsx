import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Brain, Heart, Music, MessageSquare, BookOpen, Camera, Star, ThumbsUp, Send, Wand2, Lightbulb, AlertCircle, CheckCircle, Clock, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AiPlaylistSuggestion {
  id: number;
  title: string;
  artist: string;
  genre: string | null;
  mood: string | null;
  weddingMoment: string | null;
  reasoning: string | null;
  popularity: number;
  isApproved: boolean;
  createdAt: string;
}

interface AiWeddingAdvice {
  id: number;
  category: string;
  advice: string;
  priority: string;
  timeframe: string | null;
  actionItems: string[] | null;
  isVisible: boolean;
  createdAt: string;
}

interface AiWeddingStory {
  id: number;
  title: string;
  story: string;
  photoIds: string[] | null;
  timeline: string[] | null;
  isPublished: boolean;
  createdAt: string;
}

interface AiGuestMessage {
  id: number;
  originalMessage: string;
  analyzedMessage: string | null;
  sentiment: string;
  tone: string | null;
  isAppropriate: boolean;
  suggestedResponse: string | null;
  guestName: string | null;
  isApproved: boolean;
  createdAt: string;
}

export default function AiFeatures() {
  const [selectedWeddingStyle, setSelectedWeddingStyle] = useState("moderní");
  const [guestMessage, setGuestMessage] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(50);
  const queryClient = useQueryClient();

  // Fetch AI data
  const { data: playlistSuggestions = [] } = useQuery<AiPlaylistSuggestion[]>({
    queryKey: ['/api/ai-playlist-suggestions'],
  });

  const { data: weddingAdvice = [] } = useQuery<AiWeddingAdvice[]>({
    queryKey: ['/api/ai-wedding-advice'],
  });

  const { data: weddingStories = [] } = useQuery<AiWeddingStory[]>({
    queryKey: ['/api/ai-wedding-stories'],
  });

  const { data: guestMessages = [] } = useQuery<AiGuestMessage[]>({
    queryKey: ['/api/ai-guest-messages'],
  });

  // Mutations
  const generatePlaylistMutation = useMutation({
    mutationFn: async (data: { weddingStyle: string; preferences: string[] }) => {
      const response = await fetch('/api/ai-playlist-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Generování playlistu selhalo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-playlist-suggestions'] });
      toast({
        title: "AI Playlist generován!",
        description: "Nové hudební návrhy jsou připravené.",
      });
    },
  });

  const generateAdviceMutation = useMutation({
    mutationFn: async (data: { guestCount: number }) => {
      const response = await fetch('/api/ai-wedding-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Generování rad selhalo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-wedding-advice'] });
      toast({
        title: "AI Rady vygenerovány!",
        description: "Nové svatební rady jsou připravené.",
      });
    },
  });

  const generateStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai-wedding-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Generování příběhu selhalo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-wedding-stories'] });
      toast({
        title: "AI Příběh vytvořen!",
        description: "Krásný svatební příběh je připraven.",
      });
    },
  });

  const analyzeMessageMutation = useMutation({
    mutationFn: async (data: { message: string; guestName?: string }) => {
      const response = await fetch('/api/ai-guest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Analýza zprávy selhala');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-guest-messages'] });
      setGuestMessage("");
      setGuestName("");
      toast({
        title: "Zpráva analyzována!",
        description: "AI analýza zprávy je dokončena.",
      });
    },
  });

  const approvePlaylistSuggestion = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/ai-playlist-suggestions/${id}/approve`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Schválení selhalo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-playlist-suggestions'] });
      toast({
        title: "Písnička schválena!",
        description: "Návrh byl přidán do playlistu.",
      });
    },
  });

  const publishStory = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/ai-wedding-stories/${id}/publish`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Publikování selhalo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-wedding-stories'] });
      toast({
        title: "Příběh publikován!",
        description: "Svatební příběh je nyní veřejný.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Svatební Asistent
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Využijte sílu umělé inteligence pro perfektní plánování svatby. AI vám pomůže s hudbou, radami, příběhy a analýzou hostů.
        </p>
      </div>

      <Tabs defaultValue="playlist" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="playlist" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">Hudba</span>
          </TabsTrigger>
          <TabsTrigger value="advice" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Rady</span>
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Příběhy</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Zprávy</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Playlist Suggestions */}
        <TabsContent value="playlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-purple-600" />
                AI Hudební Návrhy
              </CardTitle>
              <CardDescription>
                Nechte AI navrhnout perfektní playlist pro vaši svatbu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedWeddingStyle} onValueChange={setSelectedWeddingStyle}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Styl svatby" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderní">Moderní</SelectItem>
                    <SelectItem value="tradiční">Tradiční</SelectItem>
                    <SelectItem value="romantická">Romantická</SelectItem>
                    <SelectItem value="venkovská">Venkovská</SelectItem>
                    <SelectItem value="elegantní">Elegantní</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => generatePlaylistMutation.mutate({ 
                    weddingStyle: selectedWeddingStyle, 
                    preferences: [] 
                  })}
                  disabled={generatePlaylistMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {generatePlaylistMutation.isPending ? "Generuji..." : "Generovat AI Playlist"}
                </Button>
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {playlistSuggestions.map((suggestion) => (
                    <Card key={suggestion.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{suggestion.title}</h4>
                            <Badge variant="outline">{suggestion.artist}</Badge>
                            {suggestion.genre && (
                              <Badge variant="secondary">{suggestion.genre}</Badge>
                            )}
                          </div>
                          {suggestion.weddingMoment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              💍 {suggestion.weddingMoment}
                            </p>
                          )}
                          {suggestion.reasoning && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {suggestion.reasoning}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < suggestion.popularity ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            {suggestion.mood && (
                              <Badge variant="outline" className="text-xs">
                                {suggestion.mood}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!suggestion.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => approvePlaylistSuggestion.mutate(suggestion.id)}
                            className="ml-4"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Schválit
                          </Button>
                        )}
                        {suggestion.isApproved && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Schváleno
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Wedding Advice */}
        <TabsContent value="advice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                AI Svatební Rady
              </CardTitle>
              <CardDescription>
                Personalizované rady pro vaše svatební plánování
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Počet hostů:</span>
                  <Input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 50)}
                    className="w-20"
                    min="10"
                    max="500"
                  />
                </div>
                <Button 
                  onClick={() => generateAdviceMutation.mutate({ guestCount })}
                  disabled={generateAdviceMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {generateAdviceMutation.isPending ? "Generuji..." : "Generovat AI Rady"}
                </Button>
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {weddingAdvice.map((advice) => (
                    <Card key={advice.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{advice.category}</h4>
                          <div className="flex items-center gap-2">
                            {advice.timeframe && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {advice.timeframe}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(advice.priority)}>
                              {advice.priority === 'high' ? 'Vysoká' : 
                               advice.priority === 'medium' ? 'Střední' : 'Nízká'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{advice.advice}</p>
                        {advice.actionItems && advice.actionItems.length > 0 && (
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400">Akční kroky:</h5>
                            <ul className="text-sm space-y-1">
                              {advice.actionItems.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Wedding Stories */}
        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                AI Svatební Příběhy
              </CardTitle>
              <CardDescription>
                Krásné příběhy vygenerované z vašich fotografií a harmonogramu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => generateStoryMutation.mutate()}
                disabled={generateStoryMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                {generateStoryMutation.isPending ? "Vytvářím..." : "Vytvořit AI Příběh"}
              </Button>

              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {weddingStories.map((story) => (
                    <Card key={story.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{story.title}</h4>
                          <div className="flex items-center gap-2">
                            {story.isPublished ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Publikováno
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => publishStory.mutate(story.id)}
                              >
                                Publikovat
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="prose prose-sm dark:prose-invert">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {story.story}
                          </p>
                        </div>
                        {story.photoIds && story.photoIds.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Založeno na {story.photoIds.length} fotografiích
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Guest Message Analysis */}
        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                AI Analýza Zpráv od Hostů
              </CardTitle>
              <CardDescription>
                Analyzujte sentiment a vhodnost zpráv od svatebních hostů
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Jméno hosta (volitelné)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <div></div>
                </div>
                <Textarea
                  placeholder="Zadejte zprávu od hosta pro analýzu..."
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={() => analyzeMessageMutation.mutate({ 
                    message: guestMessage, 
                    guestName: guestName || undefined 
                  })}
                  disabled={analyzeMessageMutation.isPending || !guestMessage.trim()}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {analyzeMessageMutation.isPending ? "Analyzuji..." : "Analyzovat Zprávu"}
                </Button>
              </div>

              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {guestMessages.map((message) => (
                    <Card key={message.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {message.guestName && (
                              <span className="font-medium">{message.guestName}</span>
                            )}
                            <Badge className={getSentimentColor(message.sentiment)}>
                              {message.sentiment === 'positive' ? 'Pozitivní' : 
                               message.sentiment === 'negative' ? 'Negativní' : 'Neutrální'}
                            </Badge>
                            {message.tone && (
                              <Badge variant="outline">{message.tone}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {message.isAppropriate ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Vhodné
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Nevhodné
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Původní zpráva:</span>
                            <p className="text-gray-700 dark:text-gray-300">{message.originalMessage}</p>
                          </div>
                          {message.analyzedMessage && message.analyzedMessage !== message.originalMessage && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI úprava:</span>
                              <p className="text-gray-700 dark:text-gray-300">{message.analyzedMessage}</p>
                            </div>
                          )}
                          {message.suggestedResponse && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Navrhovaná odpověď:</span>
                              <p className="text-gray-700 dark:text-gray-300 italic">{message.suggestedResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}