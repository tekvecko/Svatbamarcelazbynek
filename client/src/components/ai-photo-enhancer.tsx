import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useReanalyzePhoto, useUpdateEnhancementVisibility, type PhotoEnhancementSuggestion } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Lightbulb, Eye, EyeOff, Loader2, Star, AlertTriangle, CheckCircle, Camera, Palette, Focus, Sun } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIPhotoEnhancerProps {
  photoId: number;
  className?: string;
}

function AIPhotoEnhancer({ photoId, className }: AIPhotoEnhancerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: enhancement, isLoading: enhancementLoading } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const reanalyzePhoto = useReanalyzePhoto();
  const updateVisibility = useUpdateEnhancementVisibility();

  const isAnalyzing = analyzePhoto.isPending || reanalyzePhoto.isPending;
  const hasEnhancement = !!enhancement;

  const handleAnalyze = () => {
    if (hasEnhancement) {
      reanalyzePhoto.mutate(photoId);
    } else {
      analyzePhoto.mutate(photoId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'composition': return <Camera className="h-4 w-4" />;
      case 'lighting': return <Sun className="h-4 w-4" />;
      case 'color': return <Palette className="h-4 w-4" />;
      case 'focus': return <Focus className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || enhancementLoading}
          variant={hasEnhancement ? "secondary" : "default"}
          size="sm"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : hasEnhancement ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {isAnalyzing ? "Analyzuji..." : hasEnhancement ? "Znovu analyzovat" : "AI Analýza"}
        </Button>

        {hasEnhancement && (
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? "Skrýt" : "Zobrazit"} detaily
          </Button>
        )}
      </div>

      {hasEnhancement && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              Skóre: {enhancement.overallScore}/100
            </span>
            <Progress value={enhancement.overallScore} className="flex-1 max-w-32" />
          </div>

          {showDetails && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                {enhancement.suggestions && enhancement.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Návrhy na vylepšení:</h4>
                    <div className="space-y-2">
                      {enhancement.suggestions.slice(0, 2).map((suggestion, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(suggestion.category)}
                            <span className="font-medium">{suggestion.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.severity}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enhancement.strengths && enhancement.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-700">Silné stránky:</h4>
                    <div className="flex flex-wrap gap-1">
                      {enhancement.strengths.slice(0, 3).map((strength, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default AIPhotoEnhancer;
export { AIPhotoEnhancer };