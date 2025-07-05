import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface PhotoEnhancementSuggestion {
  category: 'lighting' | 'composition' | 'color' | 'technical' | 'artistic';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  confidence: number;
}

export interface PhotoEnhancementAnalysis {
  id: number;
  photoId: number;
  overallScore: number;
  primaryIssues: string[];
  suggestions: PhotoEnhancementSuggestion[];
  strengths: string[];
  weddingContext: {
    photoType: string;
    subjects: string[];
    setting: string;
    lighting: string;
  };
  enhancementPreview?: string;
  analysisDate: string;
  isVisible: boolean;
}

async function fetchPhotoEnhancement(photoId: number): Promise<PhotoEnhancementAnalysis> {
  const response = await fetch(`/api/photos/${photoId}/enhancement`);
  if (response.status === 404) {
    throw new Error('ENHANCEMENT_NOT_FOUND');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch photo enhancement');
  }
  return response.json();
}

async function analyzePhoto(photoId: number): Promise<PhotoEnhancementAnalysis> {
  const response = await fetch(`/api/photos/${photoId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to analyze photo');
  }
  return response.json();
}

async function updateEnhancementVisibility(photoId: number, isVisible: boolean): Promise<void> {
  const response = await fetch(`/api/photos/${photoId}/enhancement/visibility`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isVisible }),
  });
  if (!response.ok) {
    throw new Error('Failed to update enhancement visibility');
  }
}

export function usePhotoEnhancement(photoId: number) {
  return useQuery({
    queryKey: ["/api/photos", photoId, "enhancement"],
    queryFn: () => fetchPhotoEnhancement(photoId),
    retry: (failureCount, error) => {
      // Don't retry if enhancement doesn't exist
      if (error.message === 'ENHANCEMENT_NOT_FOUND') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useAnalyzePhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: analyzePhoto,
    onSuccess: (data, photoId) => {
      queryClient.setQueryData(["/api/photos", photoId, "enhancement"], data);

      toast({
        title: "Analýza dokončena",
        description: `Celkové skóre: ${data.overallScore}/10. Nalezeno ${data.suggestions.length} návrhů na vylepšení.`,
      });
    },
    onError: (error) => {
      let description = error.message;

      // Provide more user-friendly error messages
      if (error.message.includes('quota') || error.message.includes('503')) {
        description = "AI analýza je dočasně nedostupná kvůli překročení limitu. Zkuste to prosím později.";
      } else if (error.message.includes('OPENAI_API_KEY')) {
        description = "AI analýza není momentálně nakonfigurována.";
      }

      toast({
        title: "Chyba při analýze",
        description,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEnhancementVisibility() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ photoId, isVisible }: { photoId: number; isVisible: boolean }) =>
      updateEnhancementVisibility(photoId, isVisible),
    onSuccess: (_, { photoId, isVisible }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos", photoId, "enhancement"] });

      toast({
        title: isVisible ? "Návrhy zobrazeny" : "Návrhy skryty",
        description: isVisible 
          ? "Návrhy na vylepšení jsou nyní viditelné pro hosty" 
          : "Návrhy na vylepšení jsou skryty před hosty",
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

const enhancePhoto = async (photoId: number, enhancement: string) => {
    if (!photoId || !enhancement) {
      throw new Error('Photo ID and enhancement type are required');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await api.enhancePhoto(photoId, enhancement);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enhancement failed';
      setError(message);
      console.error('Photo enhancement error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };