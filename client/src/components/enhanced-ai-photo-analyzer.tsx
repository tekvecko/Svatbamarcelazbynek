import { useState } from "react";
import { usePhotoEnhancement, useAnalyzePhoto, useReanalyzePhoto, useUpdateEnhancementVisibility, type PhotoEnhancementSuggestion } from "@/hooks/use-photo-enhancement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Lightbulb, Eye, EyeOff, Loader2, Star, AlertTriangle, CheckCircle, Camera, Palette, Focus, Sun, Heart, Settings, Brain, TrendingUp, Clock, Target, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedAIPhotoAnalyzerProps {
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

export default function EnhancedAIPhotoAnalyzer({ photoId, photoUrl, isAdminMode = false, inlineMode = false }: EnhancedAIPhotoAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { data: enhancement, isLoading: isLoadingEnhancement, error } = usePhotoEnhancement(photoId);
  const analyzePhoto = useAnalyzePhoto();
  const updateVisibility = useUpdateEnhancementVisibility();
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

  if (!hasEnhancement) {
    return (
      <Button
        onClick={handleAnalyze}
        disabled={analyzePhoto.isPending}
        size="sm"
        variant="outline"
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-md"
      >
        {analyzePhoto.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzuji...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            AI Analýza Pro
          </>
        )}
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
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 rounded-full shadow-md"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Analýza Pro
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Celkové skóre: {enhancement.overallScore}/10</span>
            </div>

            {/* Quick Stats */}
            {enhancement.enhancementPotential && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{enhancement.enhancementPotential.easyFixes}</div>
                  <div className="text-xs text-green-700">Snadné</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-yellow-600">{enhancement.enhancementPotential.mediumFixes}</div>
                  <div className="text-xs text-yellow-700">Střední</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{enhancement.enhancementPotential.estimatedTimeMinutes}min</div>
                  <div className="text-xs text-blue-700">Čas</div>
                </div>
              </div>
            )}

            {enhancement.suggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={SeverityColors[suggestion.severity]}>
                    {getSeverityIcon(suggestion.severity)}
                    <span className="ml-1 capitalize">{suggestion.severity}</span>
                  </Badge>
                  {suggestion.impactScore && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {suggestion.impactScore}/10
                    </Badge>
                  )}
                </div>
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{suggestion.suggestion}</p>
              </div>
            ))}

            <Dialog open={showFullAnalysis} onOpenChange={setShowFullAnalysis}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowFullAnalysis(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Kompletní profesionální analýza
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Profesionální AI Analýza Fotografie
                  </DialogTitle>
                  <DialogDescription>
                    Kompletní analýza a expertní návrhy na vylepšení vaší svatební fotografie
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Top Stats Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Celkové hodnocení
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold text-blue-600">{enhancement.overallScore}/10</div>
                          <Progress value={enhancement.overallScore * 10} className="flex-1 h-3" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {enhancement.overallScore >= 8 ? 'Vynikající fotografie s vysokou kvalitou' : 
                           enhancement.overallScore >= 6 ? 'Dobrá fotografie s prostorem pro zlepšení' : 
                           'Fotografie vyžaduje výrazné vylepšení'}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Enhancement Potential Dashboard */}
                    {enhancement.enhancementPotential && (
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-500" />
                            Potenciál vylepšení
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{enhancement.enhancementPotential.easyFixes}</div>
                              <div className="text-xs text-gray-600">Snadné opravy</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{enhancement.enhancementPotential.mediumFixes}</div>
                              <div className="text-xs text-gray-600">Střední opravy</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{enhancement.enhancementPotential.hardFixes}</div>
                              <div className="text-xs text-gray-600">Náročné opravy</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{enhancement.enhancementPotential.estimatedTimeMinutes}min</div>
                              <div className="text-xs text-gray-600">Celkový čas</div>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Dopad: {enhancement.enhancementPotential.totalImpactScore}/100</span>
                            </div>
                            <Progress value={enhancement.enhancementPotential.totalImpactScore} className="mt-1 h-2" />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Detailed Scores Radar */}
                    {enhancement.detailedScores && (
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Camera className="h-5 w-5 text-purple-500" />
                            Detailní skórování
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(enhancement.detailedScores).map(([key, score]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-xs font-medium w-16 capitalize">{key}:</span>
                                <Progress value={score * 10} className="flex-1 h-2" />
                                <span className="text-xs text-gray-600 w-8">{score}/10</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Strengths */}
                  {enhancement.strengths.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Silné stránky fotografie
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {enhancement.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Enhanced Suggestions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        Profesionální návrhy na vylepšení ({enhancement.suggestions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {enhancement.suggestions.map((suggestion, index) => {
                          const IconComponent = CategoryIcons[suggestion.category as keyof typeof CategoryIcons] || Sparkles;
                          return (
                            <div key={index} className="p-5 border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <IconComponent className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                                    <Badge variant="outline" className={SeverityColors[suggestion.severity]}>
                                      {getSeverityIcon(suggestion.severity)}
                                      <span className="ml-1 capitalize">{suggestion.severity}</span>
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <Target className="h-4 w-4" />
                                      <span>Priorita: {suggestion.priority}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Jistota: {Math.round(suggestion.confidence * 100)}%</span>
                                    </div>
                                    {suggestion.impactScore && (
                                      <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <TrendingUp className="h-4 w-4" />
                                        <span>Dopad: {suggestion.impactScore}/10</span>
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-gray-700 mb-4">{suggestion.description}</p>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" />
                                        Návrh řešení
                                      </h5>
                                      <p className="text-sm text-blue-800">{suggestion.suggestion}</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Technické detaily
                                      </h5>
                                      <p className="text-sm text-gray-700 mb-2">{suggestion.technicalDetails}</p>
                                      <code className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                        {suggestion.specificValues}
                                      </code>
                                    </div>
                                  </div>
                                  
                                  {/* Enhanced Preview Section */}
                                  {suggestion.beforeAfterPreview && (
                                    <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                      <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Náhled vylepšení
                                      </h5>
                                      <p className="text-sm text-purple-800 mb-3">{suggestion.beforeAfterPreview.description}</p>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <span className="text-xs font-medium text-purple-700">Očekávané zlepšení:</span>
                                          <p className="text-xs text-purple-600">{suggestion.beforeAfterPreview.expectedImprovement}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs font-medium text-purple-700">Čas zpracování:</span>
                                          <p className="text-xs text-purple-600">{suggestion.beforeAfterPreview.processingTime}</p>
                                        </div>
                                        <div>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${DifficultyColors[suggestion.beforeAfterPreview.difficulty]}`}
                                          >
                                            <span className="capitalize">{suggestion.beforeAfterPreview.difficulty}</span>
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Related Adjustments */}
                                  {suggestion.relatedAdjustments && suggestion.relatedAdjustments.length > 0 && (
                                    <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                                      <h5 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Související úpravy
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {suggestion.relatedAdjustments.map((adj, idx) => (
                                          <Badge key={idx} variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                                            {adj}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Professional Insights */}
                  {enhancement.professionalInsights && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-indigo-500" />
                          Profesionální pozorování
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Camera className="h-4 w-4 text-indigo-500" />
                                Fotografické techniky
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {enhancement.professionalInsights.photographyTechniques.map((tech, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    {tech}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Heart className="h-4 w-4 text-pink-500" />
                                Emotivní rezonance
                              </h4>
                              <p className="text-sm text-gray-600">{enhancement.professionalInsights.emotionalResonance}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                Kulturní význam
                              </h4>
                              <p className="text-sm text-gray-600">{enhancement.professionalInsights.culturalSignificance}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                Historický kontext
                              </h4>
                              <p className="text-sm text-gray-600">{enhancement.professionalInsights.historicalContext}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Wedding Context */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-500" />
                        Svatební kontext
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-pink-50 rounded-lg">
                          <span className="text-sm font-medium text-pink-900">Typ fotografie:</span>
                          <p className="text-sm text-pink-700">{enhancement.weddingContext.photoType}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-900">Subjekty:</span>
                          <p className="text-sm text-blue-700">{enhancement.weddingContext.subjects.join(', ')}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <span className="text-sm font-medium text-green-900">Prostředí:</span>
                          <p className="text-sm text-green-700">{enhancement.weddingContext.setting}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium text-yellow-900">Osvětlení:</span>
                          <p className="text-sm text-yellow-700">{enhancement.weddingContext.lighting}</p>
                        </div>
                        {enhancement.weddingContext.emotionalTone && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm font-medium text-purple-900">Emoční tón:</span>
                            <p className="text-sm text-purple-700">{enhancement.weddingContext.emotionalTone}</p>
                          </div>
                        )}
                        {enhancement.weddingContext.significance && (
                          <div className="p-3 bg-indigo-50 rounded-lg">
                            <span className="text-sm font-medium text-indigo-900">Význam:</span>
                            <p className="text-sm text-indigo-700">{enhancement.weddingContext.significance}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

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
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return null;
}