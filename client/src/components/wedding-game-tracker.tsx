import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Star, Target, Zap, Clock, Users, Crown, Gift, Camera, Heart, MapPin, Music, CheckCircle, XCircle, Calendar, Medal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface GameParticipant {
  id: number;
  userSession: string;
  displayName: string;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  streak: number;
  lastActivity: string;
  joinedAt: string;
}

interface GameChallenge {
  id: number;
  title: string;
  description: string;
  category: string;
  difficultyLevel: number;
  pointsReward: number;
  badgeIcon?: string;
  isActive: boolean;
  requiresApproval: boolean;
  maxCompletions?: number;
  timeLimit?: number;
}

interface GameActivity {
  id: number;
  participantId: number;
  activityType: string;
  referenceId?: number;
  pointsEarned: number;
  metadata?: string;
  location?: string;
  timestamp: string;
}

interface LeaderboardEntry {
  id: number;
  participantId: number;
  category: string;
  points: number;
  rank: number;
  periodStart: string;
  periodEnd: string;
}

export default function WeddingGameTracker() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<GameChallenge | null>(null);
  const [proofText, setProofText] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current participant
  const { data: participant } = useQuery({
    queryKey: ["/api/game/participant"],
    queryFn: () => api.get("/api/game/participant").then(res => res.data as GameParticipant | null),
  });

  // Get active challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/game/challenges"],
    queryFn: () => api.get("/api/game/challenges?active=true").then(res => res.data as GameChallenge[]),
  });

  // Get leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/game/leaderboard"],
    queryFn: () => api.get("/api/game/leaderboard?limit=10").then(res => res.data as LeaderboardEntry[]),
  });

  // Get recent activities
  const { data: activities = [] } = useQuery({
    queryKey: ["/api/game/activities"],
    queryFn: () => api.get("/api/game/activities?limit=10").then(res => res.data as GameActivity[]),
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (name: string) => api.post("/api/game/participant", { displayName: name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
      setShowRegistration(false);
      toast({
        title: "Vítejte ve hře! 🎮",
        description: "Úspěšně jste se zaregistrovali do svatební aktivity.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Chyba registrace",
        description: "Nepodařilo se zaregistrovat do hry.",
        duration: 3000,
      });
    }
  });

  // Challenge completion mutation
  const completeChallengeM = useMutation({
    mutationFn: ({ challengeId, proofData }: { challengeId: number; proofData?: any }) =>
      api.post(`/api/game/challenges/${challengeId}/complete`, { proofData }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/leaderboard"] });
      
      const challenge = challenges.find(c => c.id === variables.challengeId);
      toast({
        title: "Výzva splněna! 🏆",
        description: `Získali jste ${challenge?.pointsReward} bodů za "${challenge?.title}"`,
        duration: 4000,
      });
      setSelectedChallenge(null);
      setProofText("");
    },
    onError: () => {
      toast({
        title: "Chyba při plnění výzvy",
        description: "Nepodařilo se dokončit výzvu.",
        duration: 3000,
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo': return Camera;
      case 'social': return Heart;
      case 'activity': return Zap;
      case 'discovery': return MapPin;
      case 'music': return Music;
      default: return Star;
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getUserLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const getNextLevelXP = (xp: number) => {
    const currentLevel = getUserLevel(xp);
    return currentLevel * 100;
  };

  const getCurrentLevelProgress = (xp: number) => {
    const currentLevelBase = (getUserLevel(xp) - 1) * 100;
    const progressInLevel = xp - currentLevelBase;
    return (progressInLevel / 100) * 100;
  };

  useEffect(() => {
    if (!participant) {
      setShowRegistration(true);
    }
  }, [participant]);

  if (showRegistration) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Svatební Hra! 🎮
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Připojte se k zábavným výzvám a sbírejte body během svatby
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vaše jméno:
              </label>
              <Input
                type="text"
                placeholder="Zadejte své jméno..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <Button
              onClick={() => registerMutation.mutate(displayName)}
              disabled={!displayName.trim() || registerMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {registerMutation.isPending ? "Registruji..." : "Začít hrát! 🚀"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Player Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{participant?.displayName}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-pink-100">Level {participant?.level}</span>
                <span className="text-pink-100">•</span>
                <span className="text-pink-100">{participant?.totalPoints} bodů</span>
                <span className="text-pink-100">•</span>
                <span className="text-pink-100">🔥 {participant?.streak}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-pink-100 mb-1">
              {participant?.experiencePoints}/{getNextLevelXP(participant?.experiencePoints || 0)} XP
            </div>
            <Progress 
              value={getCurrentLevelProgress(participant?.experiencePoints || 0)} 
              className="w-32 h-2"
            />
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
          <TabsTrigger value="guide" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Návod</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Výzvy</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Žebříček</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Aktivity</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Medal className="h-4 w-4" />
            <span className="hidden sm:inline">Úspěchy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-pink-500" />
                  <CardTitle className="text-pink-800 dark:text-pink-200">Vítejte ve svatební hře!</CardTitle>
                </div>
                <CardDescription className="text-pink-600 dark:text-pink-400">
                  Zábavná interaktivní hra pro všechny svatební hosty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Zaregistrujte se</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Zadejte svoje jméno a připojte se ke hře</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Plňte výzvy</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vyberte si výzvy podle obtížnosti a kategorie</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sbírejte body</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Získávejte body a postupujte v levelech</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Soutěžte s ostatními</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sledujte žebříček a bojujte o první místo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Rules Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-blue-800 dark:text-blue-200">Pravidla hry</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Fairplay</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hrajte fair a respektujte ostatní hráče</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Respekt k novomanželům</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Výzvy nesmí rušit nebo narušovat průběh svatby</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Bezpečnost</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Všechny aktivity musí být bezpečné</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Zábava pro všechny</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hra má být zábavná pro všechny věkové kategorie</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Guide */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Kategorie výzev</span>
              </CardTitle>
              <CardDescription>
                Seznamte se s různými typy výzev a jejich odměnami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg border border-pink-200 dark:border-pink-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Foto výzvy</h3>
                      <p className="text-sm text-pink-600 dark:text-pink-400">10-30 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pořiďte kreativní fotky, selfie s novomanželi, nebo zachyťte speciální momenty
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Sociální výzvy</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">15-25 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Poznejte nové lidi, sdílejte příběhy nebo pomozte s organizací
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Aktivní výzvy</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">20-40 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tancujte, zpívejte, nebo se zapojte do svatebních her a aktivit
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Objevné výzvy</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">15-35 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Najděte skryté poklady, prozkoumejte místo nebo vyřešte hádanky
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Hudební výzvy</h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">10-30 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Navrhněte písničky, zazpívejte nebo se zapojte do hudebních aktivit
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Speciální výzvy</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">50-100 bodů</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Jedinečné výzvy pouze pro tuto svatbu s nejvyšší odměnou
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Guide */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Obtížnost výzev</span>
              </CardTitle>
              <CardDescription>
                Pochopte systém obtížnosti a odměn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-800/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Snadné (1⭐)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rychlé a jednoduché úkoly</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">5-15 bodů</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-800/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Střední (2⭐)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vyžaduje trochu úsilí</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500 text-white">15-25 bodů</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-800/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Náročné (3⭐)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Kreativní a časově náročnější</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-white">25-40 bodů</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-800/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Těžké (4⭐)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vyžaduje odvahu a iniciativu</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500 text-white">40-60 bodů</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-800/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Legendární (5⭐)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Epické výzvy pro hrdinné činy</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500 text-white">60-100 bodů</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips and Tricks */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-200">
                <Gift className="h-5 w-5 text-indigo-500" />
                <span>Tipy a triky</span>
              </CardTitle>
              <CardDescription className="text-indigo-600 dark:text-indigo-400">
                Jak maximalizovat vaše herní zkušenosti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Streak bonus</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Plňte výzvy po sobě pro bonus body a udržujte si streak</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Týmová práce</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Některé výzvy můžete plnit společně s ostatními hosty</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Časové bonusy</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rychlé plnění výzev může přinést dodatečné body</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Důkazy o splnění</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pořiďte si fotky nebo videa jako důkaz splnění výzev</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {challenges.map((challenge) => {
                const IconComponent = getCategoryIcon(challenge.category);
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -2 }}
                    className="group"
                  >
                    <Card className="h-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-300 cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 ${getDifficultyColor(challenge.difficultyLevel)} rounded-lg flex items-center justify-center`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                                {challenge.title}
                              </CardTitle>
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2 flex-shrink-0">
                            {challenge.pointsReward} bodů
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {Array.from({ length: challenge.difficultyLevel }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {challenge.category}
                            </span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                onClick={() => setSelectedChallenge(challenge)}
                              >
                                Splnit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <IconComponent className="h-5 w-5" />
                                  <span>{challenge.title}</span>
                                </DialogTitle>
                                <DialogDescription>
                                  {challenge.description}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-4 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Odměna:</span>
                                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-600">
                                      {challenge.pointsReward} bodů
                                    </Badge>
                                  </div>
                                </div>
                                {challenge.requiresApproval && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Důkaz splnění (volitelné):
                                    </label>
                                    <Textarea
                                      placeholder="Popište jak jste výzvu splnili..."
                                      value={proofText}
                                      onChange={(e) => setProofText(e.target.value)}
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                )}
                                <Button
                                  onClick={() => {
                                    if (selectedChallenge) {
                                      completeChallengeM.mutate({
                                        challengeId: selectedChallenge.id,
                                        proofData: proofText || undefined
                                      });
                                    }
                                  }}
                                  disabled={completeChallengeM.isPending}
                                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                >
                                  {completeChallengeM.isPending ? "Odesílám..." : "Splnit výzvu!"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle>Žebříček nejlepších</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-800/20' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20' :
                      'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-gray-300'
                      }`}>
                        <span className="text-white font-bold text-sm">{entry.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Hráč #{entry.participantId}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Level {Math.floor(entry.points / 100) + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {entry.points} bodů
                      </p>
                      {index === 0 && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          👑 Šampion
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <CardTitle>Nedávné aktivity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {activity.activityType === 'challenge_complete' ? 'Výzva splněna' : 
                           activity.activityType === 'photo_upload' ? 'Fotka nahrána' :
                           activity.activityType === 'comment' ? 'Komentář přidán' :
                           'Aktivita'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString('cs-CZ')}
                          {activity.location && ` • ${activity.location}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      +{activity.pointsEarned} bodů
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Medal className="h-5 w-5 text-purple-500" />
                <CardTitle>Úspěchy a odznaky</CardTitle>
              </div>
              <CardDescription>
                Sbírejte odznaky za různé činnosti během svatby
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Zatím žádné odznaky
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Splňte výzvy a sbírejte úspěchy!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}