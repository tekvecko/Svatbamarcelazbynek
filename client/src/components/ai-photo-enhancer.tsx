
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

const CategoryIcons = {
  lighting: Sun,
  composition: Camera,
  color: Palette,
  technical: Focus,
  artistic: Sparkles,
};

const SeverityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-red-100 text-red-800 border-red-200",
};

export default function AIPhotoEnhancer({ photoId, photoUrl, isAdminMode = false, inlineMode = false }: AIPhotoEnhancerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: enhancement, isLoading: isLoadingEnhancement, error } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const updateVisibility = useUpdateEnhancementVisibility();

  const hasEnhancement = enhancement && !error;
  const needsAnalysis = error?.message === 'ENHANCEMENT_NOT_FOUND';

  const handleAnalyze = async () => {
    try {
      await analyzePhoto.mutateAsync(photoId);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Error will be handled by React Query and shown in UI
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

  const renderSuggestionCard = (suggestion: PhotoEnhancementSuggestion, index: number) => {
    const CategoryIcon = CategoryIcons[suggestion.category] || Lightbulb;
    
    return (
      <Card key={index} className={`border-l-4 ${suggestion.severity === 'high' ? 'border-l-red-500' : suggestion.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-base">{suggestion.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={SeverityColors[suggestion.severity]} variant="outline">
                {getSeverityIcon(suggestion.severity)}
                <span className="ml-1 capitalize">{suggestion.severity}</span>
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {Math.round(suggestion.confidence * 100)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-3">
            {suggestion.description}
          </CardDescription>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Doporučení:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {suggestion.suggestion}
            </p>
          </div>
        </CardContent>
      </Card>
    );
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
                <span className="font-medium">Skóre: {enhancement.overallScore}/10</span>
              </div>
              
              {enhancement.suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{suggestion.suggestion}</div>
                </div>
              ))}
              
              <button 
                onClick={() => setIsOpen(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-800"
              >
                Zobrazit kompletní analýzu
              </button>
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

          {needsAnalysis && !analyzePhoto.isPending && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analyzovat fotku pomocí AI</h3>
                  <p className="text-gray-600 mb-4">
                    Nechte umělou inteligenci analyzovat tuto fotku a získejte odborné návrhy na vylepšení osvětlení, kompozice a celkového vzhledu.
                  </p>
                  <Button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Spustit AI analýzu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {analyzePhoto.isPending && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Analýza probíhá...</h3>
                  <p className="text-gray-600">
                    AI analyzuje vaši fotku. Může to trvat několik sekund.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {analyzePhoto.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Chyba při analýze:</strong>
                <p className="mt-1">
                  {analyzePhoto.error.message.includes('OPENAI_API_KEY') || analyzePhoto.error.message.includes('Failed to analyze') 
                    ? 'AI analýza není momentálně dostupná. Kontaktujte správce.'
                    : 'Nastala chyba při analýze fotky. Zkuste to prosím znovu.'}
                </p>
                <Button 
                  onClick={() => analyzePhoto.reset()} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Zkusit znovu
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhancement Results */}
          {hasEnhancement && (
            <>
              {/* Admin Controls */}
              {isAdminMode && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Nastavení viditelnosti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Zobrazit návrhy hostům</p>
                        <p className="text-sm text-gray-600">Hosté uvidí AI návrhy na vylepšení této fotky</p>
                      </div>
                      <Switch
                        checked={enhancement.isVisible}
                        onCheckedChange={handleVisibilityToggle}
                        disabled={updateVisibility.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Score */}
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Celkové hodnocení
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-emerald-600">
                      {enhancement.overallScore}/10
                    </div>
                    <div className="flex-1">
                      <Progress value={enhancement.overallScore * 10} className="h-3" />
                      <p className="text-sm text-gray-600 mt-1">
                        {enhancement.overallScore >= 8 ? 'Výborná fotka!' : 
                         enhancement.overallScore >= 6 ? 'Dobrá fotka s potenciálem pro vylepšení' : 
                         'Fotka by mohla být výrazně vylepšena'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {enhancement.strengths.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Silné stránky
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {enhancement.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Primary Issues */}
              {enhancement.primaryIssues.length > 0 && (
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-5 w-5" />
                      Hlavní problémy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {enhancement.primaryIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-800">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Enhancement Preview */}
              {enhancement.enhancementPreview && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Eye className="h-5 w-5" />
                      Náhled vylepšení
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 italic">"{enhancement.enhancementPreview}"</p>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {enhancement.suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Návrhy na vylepšení</h3>
                    <Badge variant="secondary">{enhancement.suggestions.length}</Badge>
                  </div>

                  <div className="space-y-4">
                    {enhancement.suggestions
                      .sort((a, b) => {
                        const severityOrder = { high: 3, medium: 2, low: 1 };
                        return severityOrder[b.severity] - severityOrder[a.severity];
                      })
                      .map((suggestion, index) => renderSuggestionCard(suggestion, index))
                    }
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              <div className="text-center text-sm text-gray-500">
                <p>Analýza provedena: {new Date(enhancement.analysisDate).toLocaleString('cs-CZ')}</p>
                <p className="mt-1">Powered by AI</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
