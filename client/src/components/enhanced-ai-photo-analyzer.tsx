import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useReanalyzePhoto, useUpdateEnhancementVisibility, type PhotoEnhancementSuggestion } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Lightbulb, Eye, EyeOff, Loader2, Star, AlertTriangle, CheckCircle, Camera, Palette, Focus, Sun, Heart, Settings, Brain, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedAIPhotoAnalyzerProps {
  photoId: number;
  className?: string;
  isAdminMode?: boolean;
  inlineMode?: boolean;
}

export function EnhancedAIPhotoAnalyzer({ photoId, className, isAdminMode = false, inlineMode = false }: EnhancedAIPhotoAnalyzerProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const { data: enhancement, isLoading: isLoadingEnhancement, error } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const reanalyzePhoto = useReanalyzePhoto();
  const updateVisibility = useUpdateEnhancementVisibility();

  const isAnalyzing = analyzePhoto.isPending || reanalyzePhoto.isPending;
  const hasEnhancement = enhancement && !error;

  const handleAnalyze = () => {
    if (hasEnhancement) {
      reanalyzePhoto.mutate(photoId);
    } else {
      analyzePhoto.mutate({ photoId: photoId, photoUrl: '' });
    }
  };

  const toggleVisibility = (suggestionId: string, visible: boolean) => {
    if (enhancement) {
      updateVisibility.mutate({
        photoId: photoId,
        suggestionId: suggestionId,
        isVisible: visible
      });
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

  const SeverityColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
    critical: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const DifficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
    professional: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const CategoryIcons = {
    lighting: Sun,
    composition: Camera,
    color: Palette,
    technical: Focus,
    artistic: Sparkles,
    exposure: Sun,
    focus: Focus,
    noise: AlertTriangle,
    'white-balance': Palette,
    contrast: Star,
    saturation: Palette,
    sharpness: Focus,
    highlights: Sun,
    shadows: Sun,
    clarity: Focus,
    vibrance: Palette,
    cropping: Settings,
    perspective: Camera,
    'skin-tones': Palette,
    background: Camera,
    'motion-blur': Focus,
    'depth-of-field': Focus,
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoadingEnhancement) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Načítání analýzy...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Foto Analyzátor
          </CardTitle>
          <CardDescription>
            Pokročilá analýza a návrhy na vylepšení fotografie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant={hasEnhancement ? "secondary" : "default"}
              className={hasEnhancement ? "bg-green-600 hover:bg-green-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : hasEnhancement ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? "Analyzuji..." : hasEnhancement ? "Přeanalyzovat" : "Spustit analýzu"}
            </Button>

            {hasEnhancement && (
              <Button
                variant="outline"
                onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showAllSuggestions ? "Skrýt detaily" : "Zobrazit vše"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {hasEnhancement && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Celkové hodnocení
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    {enhancement.overallScore}/10
                  </div>
                  <Progress value={enhancement.overallScore * 10} className="flex-1" />
                </div>

                {enhancement.overallScore >= 8 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Výborná fotografie! Jen malé vylepšení je potřeba.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {enhancement.overallScore < 6 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Fotografie má potenciál pro významné vylepšení.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {enhancement.suggestions && enhancement.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  Návrhy na vylepšení ({enhancement.suggestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(showAllSuggestions ? enhancement.suggestions : enhancement.suggestions.slice(0, 3))
                    .map((suggestion, index) => (
                    <div key={index} className="space-y-3">
                      <div className={`p-4 rounded-lg border ${SeverityColors[suggestion.severity]}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(suggestion.category)}
                              <span className="font-medium">{suggestion.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Priorita {suggestion.priority}
                              </Badge>
                            </div>

                            <p className="text-sm">{suggestion.description}</p>

                            {suggestion.suggestion && (
                              <div className="bg-white/50 p-2 rounded text-sm">
                                <strong>Doporučení:</strong> {suggestion.suggestion}
                              </div>
                            )}

                            {suggestion.technicalDetails && (
                              <button
                                onClick={() => toggleSection(`technical-${index}`)}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {expandedSection === `technical-${index}` ? "Skrýt" : "Zobrazit"} technické detaily
                              </button>
                            )}

                            {expandedSection === `technical-${index}` && suggestion.technicalDetails && (
                              <div className="bg-gray-50 p-2 rounded text-xs">
                                <strong>Technické:</strong> {suggestion.technicalDetails}
                                {suggestion.specificValues && (
                                  <div className="mt-1">
                                    <strong>Hodnoty:</strong> {suggestion.specificValues}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/*<div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                            <Switch
                              checked={suggestion.visible !== false}
                              onCheckedChange={(checked) => toggleVisibility(String(index), checked)}
                            />
                          </div>*/}
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showAllSuggestions && enhancement.suggestions.length > 3 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAllSuggestions(true)}
                      className="w-full"
                    >
                      Zobrazit všech {enhancement.suggestions.length} návrhů
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {enhancement.strengths && enhancement.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Silné stránky
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {enhancement.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context Information */}
          {enhancement.weddingContext && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Kontext fotografie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancement.weddingContext.photoType && (
                    <div>
                      <span className="text-sm font-medium">Typ:</span>
                      <p className="text-sm text-gray-600">{enhancement.weddingContext.photoType}</p>
                    </div>
                  )}
                  {enhancement.weddingContext.setting && (
                    <div>
                      <span className="text-sm font-medium">Prostředí:</span>
                      <p className="text-sm text-gray-600">{enhancement.weddingContext.setting}</p>
                    </div>
                  )}
                  {enhancement.weddingContext.lighting && (
                    <div>
                      <span className="text-sm font-medium">Osvětlení:</span>
                      <p className="text-sm text-gray-600">{enhancement.weddingContext.lighting}</p>
                    </div>
                  )}
                  {enhancement.weddingContext.subjects && Array.isArray(enhancement.weddingContext.subjects) && (
                    <div>
                      <span className="text-sm font-medium">Objekty:</span>
                      <p className="text-sm text-gray-600">{enhancement.weddingContext.subjects.join(", ")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Controls */}
          {isAdminMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Administrace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={enhancement.isVisible}
                      onCheckedChange={(checked) => {
                        updateVisibility.mutate({ photoId, isVisible: checked });
                      }}
                    />
                    <span className="text-sm">Veřejně viditelná analýza</span>
                  </div>
                  <Button
                    onClick={() => reanalyzePhoto.mutate(photoId)}
                    disabled={reanalyzePhoto.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {reanalyzePhoto.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Znovu analyzuji...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Znovu analyzovat
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}