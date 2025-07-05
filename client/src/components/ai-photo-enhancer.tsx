
import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useUpdateEnhancementVisibility, type PhotoEnhancementSuggestion } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Lightbulb, Eye, EyeOff, Loader2, Star, AlertTriangle, CheckCircle, Camera, Palette, Focus, Sun } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIPhotoEnhancerProps {
  photoId: number;
  photoUrl: string;
  isAdminMode?: boolean;
  inlineMode?: boolean;
}

const SeverityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
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
};

export default function AIPhotoEnhancer({ photoId, photoUrl, isAdminMode = false, inlineMode = false }: AIPhotoEnhancerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { data: enhancement, isLoading: isLoadingEnhancement, error } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const updateVisibility = useUpdateEnhancementVisibility();
  const reanalyzePhoto = useReanalyzePhoto();

  const hasEnhancement = enhancement && !error;
  const needsAnalysis = error?.message === 'ENHANCEMENT_NOT_FOUND';

  const handleAnalyze = async () => {
    try {
      await analyzePhoto.mutateAsync(photoId);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleReanalyze = async () => {
    try {
      await reanalyzePhoto.mutateAsync(photoId);
    } catch (error) {
      console.error('Reanalysis failed:', error);
    }
  };

  const handleVisibilityToggle = async (isVisible: boolean) => {
    if (!enhancement) return;
    await updateVisibility.mutateAsync({ photoId, isVisible });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Star className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  // For inline mode (inside other dialogs), just show a button
  if (inlineMode) {
    if (needsAnalysis && !analyzePhoto.isPending) {
      return (
        <Button
          onClick={handleAnalyze}
          size="sm"
          variant="outline"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg rounded-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Analýza
        </Button>
      );
    }
    
    if (analyzePhoto.isPending) {
      return (
        <Button
          disabled
          size="sm"
          variant="outline"
          className="bg-blue-500 text-white border-0 rounded-full"
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analýza...
        </Button>
      );
    }
    
    if (hasEnhancement) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-green-500 text-white border-0 hover:bg-green-600 rounded-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Zobrazit
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Skóre: {enhancement.overallScore}/10</span>
              </div>
              
              {enhancement.suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={SeverityColors[suggestion.severity]}>
                      {getSeverityIcon(suggestion.severity)}
                      <span className="ml-1 capitalize">{suggestion.severity}</span>
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{suggestion.suggestion}</p>
                </div>
              ))}
              
              <Button 
                onClick={() => setIsOpen(true)}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                Zobrazit kompletní analýzu
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Analýza
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Návrhy na vylepšení fotky
          </DialogTitle>
          <DialogDescription>
            Umělá inteligence analyzuje vaši svatební fotku a navrhuje vylepšení pro dosažení nejlepších výsledků.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Status */}
          {isLoadingEnhancement && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Načítám analýzu...</span>
            </div>
          )}

          {/* Need Analysis */}
          {needsAnalysis && !analyzePhoto.isPending && (
            <div className="text-center py-8">
              <div className="mb-4">
                <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Fotka zatím nebyla analyzována</h3>
                <p className="text-gray-600 mb-4">
                  Spusťte AI analýzu pro získání personalizovaných návrhů na vylepšení této svatební fotky.
                </p>
              </div>
              <Button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Spustit AI analýzu
              </Button>
            </div>
          )}

          {/* Analysis in Progress */}
          {analyzePhoto.isPending && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzuji fotku...</h3>
              <p className="text-gray-600">
                Umělá inteligence analyzuje kompozici, osvětlení, barvy a další aspekty vaší fotky.
              </p>
            </div>
          )}

          {/* Analysis Error */}
          {analyzePhoto.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {analyzePhoto.error.message || "Nepodařilo se analyzovat fotku. Zkuste to prosím znovu."}
              </AlertDescription>
            </Alert>
          )}

          {/* Analysis Results */}
          {hasEnhancement && (
            <div className="space-y-6">
              {/* Admin Controls */}
              {isAdminMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Admin nastavení
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={enhancement.isVisible}
                        onCheckedChange={handleVisibilityToggle}
                      />
                      <span className="text-sm">
                        {enhancement.isVisible ? "Návrhy jsou viditelné pro hosty" : "Návrhy jsou skryty před hosty"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleReanalyze}
                        disabled={reanalyzePhoto.isPending}
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
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
                      <span className="text-xs text-gray-500">
                        Aktualizuje analýzu s nejnovějšími AI modely
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Celkové hodnocení
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {enhancement.overallScore}/10
                    </div>
                    <div className="flex-1">
                      <Progress value={enhancement.overallScore * 10} className="h-3" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {enhancement.overallScore >= 8 ? "Výborná fotka!" : 
                     enhancement.overallScore >= 6 ? "Dobrá fotka s potenciálem pro vylepšení" :
                     "Fotka by mohla být výrazně vylepšena"}
                  </p>
                </CardContent>
              </Card>

              {/* Summary View */}
              {!showFullAnalysis && (
                <div className="space-y-4">
                  {/* Top Suggestions Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-orange-500" />
                        Hlavní návrhy na vylepšení
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {enhancement.suggestions.slice(0, 3).map((suggestion, index) => {
                          const IconComponent = CategoryIcons[suggestion.category] || Lightbulb;
                          return (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                              <div className="flex-shrink-0">
                                <IconComponent className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                  <Badge variant="outline" className={SeverityColors[suggestion.severity]}>
                                    {suggestion.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {enhancement.suggestions.length > 3 && (
                        <Button 
                          onClick={() => setShowFullAnalysis(true)}
                          variant="outline" 
                          className="w-full mt-4"
                        >
                          Zobrazit kompletní analýzu ({enhancement.suggestions.length} návrhů)
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  {enhancement.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Silné stránky fotky
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-2">
                          {enhancement.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Full Analysis View */}
              {showFullAnalysis && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Kompletní analýza</h3>
                    <Button 
                      onClick={() => setShowFullAnalysis(false)}
                      variant="outline"
                      size="sm"
                    >
                      Zobrazit souhrn
                    </Button>
                  </div>

                  {/* Wedding Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-500" />
                        Kontext fotky
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Typ fotky:</span>
                          <span className="ml-2 capitalize">{enhancement.weddingContext.photoType}</span>
                        </div>
                        <div>
                          <span className="font-medium">Osvětlení:</span>
                          <span className="ml-2 capitalize">{enhancement.weddingContext.lighting}</span>
                        </div>
                        <div>
                          <span className="font-medium">Prostředí:</span>
                          <span className="ml-2 capitalize">{enhancement.weddingContext.setting}</span>
                        </div>
                        <div>
                          <span className="font-medium">Objekty:</span>
                          <span className="ml-2">{enhancement.weddingContext.subjects.join(", ")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* All Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-orange-500" />
                        Všechny návrhy na vylepšení
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enhancement.suggestions.map((suggestion, index) => {
                          const IconComponent = CategoryIcons[suggestion.category] || Lightbulb;
                          return (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <IconComponent className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{suggestion.title}</h4>
                                    <Badge variant="outline" className={SeverityColors[suggestion.severity]}>
                                      {getSeverityIcon(suggestion.severity)}
                                      <span className="ml-1 capitalize">{suggestion.severity}</span>
                                    </Badge>
                                    <Badge variant="outline">
                                      {suggestion.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                                  <p className="text-sm font-medium text-purple-600 mb-1">{suggestion.suggestion}</p>
                                  {suggestion.technicalDetails && (
                                    <p className="text-xs text-gray-500 mb-1">
                                      <span className="font-medium">Technické info:</span> {suggestion.technicalDetails}
                                    </p>
                                  )}
                                  {suggestion.specificValues && (
                                    <p className="text-xs text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded">
                                      {suggestion.specificValues}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-500">Jistota:</span>
                                    <Progress value={suggestion.confidence * 100} className="h-2 w-20" />
                                    <span className="text-xs text-gray-500">{Math.round(suggestion.confidence * 100)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Primary Issues */}
                  {enhancement.primaryIssues.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Hlavní problémy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enhancement.primaryIssues.map((issue, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths */}
                  {enhancement.strengths.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Silné stránky fotky
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enhancement.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Enhancement Preview */}
                  {enhancement.enhancementPreview && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          Náhled vylepšené verze
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{enhancement.enhancementPreview}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
