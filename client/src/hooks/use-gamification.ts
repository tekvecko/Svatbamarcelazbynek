import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface GameParticipant {
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

export interface GameChallenge {
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
  createdAt: string;
}

export interface GameActivity {
  id: number;
  participantId: number;
  activityType: string;
  referenceId?: number;
  pointsEarned: number;
  metadata?: string;
  location?: string;
  timestamp: string;
}

export interface GameLeaderboard {
  id: number;
  participantId: number;
  category: string;
  points: number;
  rank: number;
  periodStart: string;
  periodEnd: string;
  updatedAt: string;
}

export interface GameUserAchievement {
  id: number;
  participantId: number;
  achievementId: number;
  earnedAt: string;
  progress: number;
}

export function useGameParticipant() {
  return useQuery({
    queryKey: ["/api/game/participant"],
    queryFn: async () => {
      const response = await api.get("/api/game/participant");
      return response.data as GameParticipant | null;
    },
  });
}

export function useGameChallenges(isActive?: boolean) {
  return useQuery({
    queryKey: ["/api/game/challenges", { active: isActive }],
    queryFn: async () => {
      const params = isActive !== undefined ? `?active=${isActive}` : "";
      const response = await api.get(`/api/game/challenges${params}`);
      return response.data as GameChallenge[];
    },
  });
}

export function useGameLeaderboard(category: string = "overall", limit: number = 10) {
  return useQuery({
    queryKey: ["/api/game/leaderboard", { category, limit }],
    queryFn: async () => {
      const response = await api.get(`/api/game/leaderboard?category=${category}&limit=${limit}`);
      return response.data as GameLeaderboard[];
    },
  });
}

export function useGameActivities(userOnly?: boolean, limit: number = 20) {
  return useQuery({
    queryKey: ["/api/game/activities", { userOnly, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userOnly) params.append("user_only", "true");
      if (limit) params.append("limit", limit.toString());
      
      const response = await api.get(`/api/game/activities?${params.toString()}`);
      return response.data as GameActivity[];
    },
  });
}

export function useGameAchievements() {
  return useQuery({
    queryKey: ["/api/game/achievements"],
    queryFn: async () => {
      const response = await api.get("/api/game/achievements");
      return response.data as GameUserAchievement[];
    },
  });
}

export function useRegisterParticipant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (displayName: string) => {
      const response = await api.post("/api/game/participant", { displayName });
      return response.data as GameParticipant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
    },
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ challengeId, proofData }: { challengeId: number; proofData?: any }) => {
      const response = await api.post(`/api/game/challenges/${challengeId}/complete`, { proofData });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/leaderboard"] });
    },
  });
}

export function useJoinGameEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await api.post(`/api/game/events/${eventId}/join`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
    },
  });
}

// Auto-trigger activities for common wedding interactions
export function useCreateGameActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (activity: {
      activityType: string;
      referenceId?: number;
      pointsEarned: number;
      metadata?: any;
      location?: string;
    }) => {
      const response = await api.post("/api/game/activities", activity);
      return response.data as GameActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/participant"] });
    },
  });
}

// Helper function to automatically award points for wedding activities
export function useAutoGameification() {
  const createActivity = useCreateGameActivity();
  const { data: participant } = useGameParticipant();

  const awardPoints = (activityType: string, points: number, referenceId?: number, metadata?: any) => {
    if (participant) {
      createActivity.mutate({
        activityType,
        pointsEarned: points,
        referenceId,
        metadata
      });
    }
  };

  return {
    awardPointsForPhotoUpload: (photoId: number) => awardPoints("photo_upload", 10, photoId),
    awardPointsForComment: (photoId: number) => awardPoints("comment", 5, photoId),
    awardPointsForLike: (photoId: number) => awardPoints("like", 2, photoId),
    awardPointsForPlaylistSong: (songId: number) => awardPoints("playlist_song", 15, songId),
    awardPointsForCheckIn: (location: string) => awardPoints("check_in", 20, undefined, { location }),
    participant
  };
}