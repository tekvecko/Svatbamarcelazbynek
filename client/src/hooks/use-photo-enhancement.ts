import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface PhotoEnhancementSuggestion {
  category: 'lighting' | 'composition' | 'color' | 'technical' | 'artistic' | 'exposure' | 'focus' | 'noise' | 'white-balance' | 'contrast' | 'saturation' | 'sharpness' | 'highlights' | 'shadows' | 'clarity' | 'vibrance' | 'cropping' | 'perspective' | 'skin-tones' | 'background' | 'motion-blur' | 'depth-of-field';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  technicalDetails: string;
  specificValues: string;
  confidence: number;
  priority: number;
  beforeAfterPreview?: {
    description: string;
    expectedImprovement: string;
    processingTime: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'professional';
  };
  relatedAdjustments?: string[];
  impactScore: number;
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
    emotionalTone?: string;
    significance?: string;
  };
  detailedScores?: {
    technical: number;
    artistic: number;
    composition: number;
    lighting: number;
    colors: number;
    emotion: number;
    storytelling: number;
    memoryValue: number;
  };
  enhancementPotential?: {
    easyFixes: number;
    mediumFixes: number;
    hardFixes: number;
    totalImpactScore: number;
    estimatedTimeMinutes: number;
  };
  professionalInsights?: {
    photographyTechniques: string[];
    historicalContext: string;
    culturalSignificance: string;
    emotionalResonance: string;
  };
  enhancementPreview?: string;
  analysisDate: string;
  isVisible: boolean;
  analysisMetadata?: {
    aiModel: string;
    analysisTime: number;
    confidence: number;
    usedFallback: boolean;
    errorDetails?: string;
  };
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
  console.log('Starting photo analysis for photo ID:', photoId);

  const response = await fetch(`/api/photos/${photoId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Analysis request failed:', response.status, errorText);
    throw new Error(`Failed to analyze photo: ${response.status} ${response.statusText}`);
  }

  const analysis = await response.json();
  console.log('Photo analysis completed:', analysis);
  return analysis;
}

async function reanalyzePhoto(photoId: number): Promise<PhotoEnhancementAnalysis> {
  const response = await fetch(`/api/photos/${photoId}/reanalyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to reanalyze photo');
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
      if (error.message.includes('quota') || error.message.includes('503') || error.message.includes('429')) {
        description = "AI služby jsou dočasně nedostupné. Analýza bude použita základní algoritmy místo AI.";
      } else if (error.message.includes('GROQ_API_KEY') || error.message.includes('API')) {
        description = "AI analýza používá základní algoritmy. Pro pokročilou AI analýzu je potřeba nakonfigurovat API klíče.";
      } else if (error.message.includes('Failed to analyze')) {
        description = "Analýza byla dokončena pomocí základních algoritmů místo AI.";
      }

      toast({
        title: "Chyba při analýze",
        description,
        variant: "destructive",
      });
    },
  });
}

export function useReanalyzePhoto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (photoId: number) => reanalyzePhoto(photoId),
    onSuccess: (data, photoId) => {
      queryClient.setQueryData(["/api/photos", photoId, "enhancement"], data);
      toast({
        title: "Znovuanalýza dokončena",
        description: `Aktualizované skóre: ${data.overallScore}/10. Nalezeno ${data.suggestions.length} návrhů na vylepšení.`,
      });
    },
    onError: (error) => {
      let description = error.message;

      if (error.message.includes('quota') || error.message.includes('503') || error.message.includes('429')) {
        description = "AI služby jsou dočasně nedostupné. Byla použita základní analýza místo pokročilé AI.";
      } else if (error.message.includes('GROQ_API_KEY') || error.message.includes('API')) {
        description = "Používá se základní analýza. Pro pokročilé AI funkce je potřeba nakonfigurovat API klíče.";
      } else if (error.message.includes('Failed to')) {
        description = "Analýza byla dokončena pomocí základních algoritmů.";
      }

      toast({
        title: "Chyba při znovuanalýze",
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