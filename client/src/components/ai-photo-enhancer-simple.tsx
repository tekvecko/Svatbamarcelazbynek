import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useReanalyzePhoto } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sparkles, Loader2, Star, CheckCircle, Eye, Zap, Brain } from "lucide-react";

interface SimpleAIPhotoAnalyzerProps {
  photoId: number;
  photoUrl: string;
  inlineMode?: boolean;
}

export default function SimpleAIPhotoAnalyzer({ photoId, photoUrl, inlineMode = false }: SimpleAIPhotoAnalyzerProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { data: enhancement, isLoading: isLoadingEnhancement, error } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const reanalyzePhoto = useReanalyzePhoto();

  const hasEnhancement = enhancement && !error;

  const handleAnalyze = async () => {
    try {
      await analyzePhoto.mutateAsync({ photoId, photoUrl });
    } catch (error) {
      console.error('Failed to analyze photo:', error);
    }
  };

  if (isLoadingEnhancement) {
    return (
      <Button
        disabled
        size="sm"
        variant="outline"
        className="bg-gray-100 text-gray-600 border-0 rounded-full"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Načítám...
      </Button>
    );
  }

  if (analyzePhoto.isPending) {
    return (
      <Button
        disabled
        size="sm"
        variant="outline"
        className="bg-blue-500 text-white border-0 rounded-full opacity-90"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        AI Pracuje...
      </Button>
    );
  }

  if (!hasEnhancement) {
    return (
      <Button
        onClick={handleAnalyze}
        disabled={analyzePhoto.isPending}
        size="sm"
        variant="outline"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-md transition-all duration-300"
      >
        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
        AI Analýza
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 rounded-full shadow-md transition-all duration-300"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            AI Výsledek
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Celkové skóre: {enhancement.overallScore}/10</span>
            </div>

            {enhancement.suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{suggestion.suggestion}</p>
              </div>
            ))}

            <Dialog open={showFullAnalysis} onOpenChange={setShowFullAnalysis}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 rounded-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detailní analýza
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    AI Analýza Fotografie
                  </DialogTitle>
                  <DialogDescription>
                    Detailní analýza a návrhy na vylepšení
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{enhancement.overallScore}/10</div>
                    <p className="text-sm text-gray-600">Celkové hodnocení</p>
                  </div>

                  {enhancement.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <p className="text-gray-700 mt-2">{suggestion.description}</p>
                      <div className="mt-2 p-3 bg-blue-50 rounded">
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        onClick={() => reanalyzePhoto.mutate(photoId)}
        disabled={reanalyzePhoto.isPending}
        size="sm"
        variant="outline"
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 rounded-full"
      >
        {reanalyzePhoto.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Znovu...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Znovu
          </>
        )}
      </Button>
    </div>
  );
}