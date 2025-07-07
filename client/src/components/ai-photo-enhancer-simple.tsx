
import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useReanalyzePhoto } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Star, CheckCircle, Eye, Zap, Brain } from "lucide-react";

interface SimpleAIPhotoAnalyzerProps {
  photoId: number;
  className?: string;
}

export default function SimpleAIPhotoAnalyzer({ photoId, className }: SimpleAIPhotoAnalyzerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { data: enhancement, isLoading: enhancementLoading } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const reanalyzePhoto = useReanalyzePhoto();

  const isAnalyzing = analyzePhoto.isPending || reanalyzePhoto.isPending;
  const hasEnhancement = !!enhancement;

  const handleAnalyze = () => {
    if (hasEnhancement) {
      reanalyzePhoto.mutate(photoId);
    } else {
      analyzePhoto.mutate(photoId);
    }
  };

  const getButtonState = () => {
    if (isAnalyzing) {
      return {
        text: "AI Pracuje...",
        variant: "secondary" as const,
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        className: "bg-blue-600 hover:bg-blue-700 text-white"
      };
    }
    
    if (hasEnhancement) {
      return {
        text: "AI Výsledek",
        variant: "secondary" as const,
        icon: <CheckCircle className="h-4 w-4" />,
        className: "bg-green-600 hover:bg-green-700 text-white"
      };
    }
    
    return {
      text: "AI Analýza",
      variant: "default" as const,
      icon: <Sparkles className="h-4 w-4" />,
      className: "bg-purple-600 hover:bg-purple-700 text-white"
    };
  };

  const buttonState = getButtonState();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || enhancementLoading}
          variant={buttonState.variant}
          size="sm"
          className={buttonState.className}
        >
          {buttonState.icon}
          {buttonState.text}
        </Button>

        {hasEnhancement && (
          <>
            <Button
              onClick={() => handleAnalyze()}
              variant="outline"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
            >
              <Zap className="h-4 w-4" />
              Znovu
            </Button>
            
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <Eye className="h-4 w-4" />
              Detaily
            </Button>
            
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
            >
              <Brain className="h-4 w-4" />
              Nastavení
            </Button>
          </>
        )}
      </div>

      {/* Inline Details Section */}
      {showDetails && hasEnhancement && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              AI Analýza Detaily
            </CardTitle>
            <CardDescription>
              Celkové skóre: {enhancement.overallScore}/100
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enhancement.suggestions && enhancement.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Návrhy na vylepšení:</h4>
                <div className="space-y-2">
                  {enhancement.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={suggestion.severity === 'high' ? 'destructive' : 
                                      suggestion.severity === 'medium' ? 'default' : 'secondary'}>
                          {suggestion.category}
                        </Badge>
                        <span className="text-sm font-medium">{suggestion.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                      {suggestion.suggestion && (
                        <p className="text-sm text-blue-600 mt-1">{suggestion.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {enhancement.strengths && enhancement.strengths.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-green-700">Silné stránky:</h4>
                <div className="flex flex-wrap gap-1">
                  {enhancement.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inline Settings Section */}
      {showSettings && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Nastavení AI analýzy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Typ analýzy</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Kompozice</Badge>
                <Badge variant="outline">Osvětlení</Badge>
                <Badge variant="outline">Barvy</Badge>
                <Badge variant="outline">Technické</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Úroveň detailu</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Základní</Button>
                <Button variant="default" size="sm">Pokročilá</Button>
                <Button variant="outline" size="sm">Expert</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
