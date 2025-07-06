import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Sparkles, Image, MessageCircle, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface HuggingFaceAnalysis {
  overallScore: number;
  categories: {
    composition: number;
    lighting: number;
    colors: number;
    emotion: number;
    technical: number;
  };
  suggestions: string[];
  strengths: string[];
  weddingContext: {
    photoType: string;
    subjects: string[];
    setting: string;
    mood: string;
  };
  enhancementTips: string[];
  isWeddingRelevant: boolean;
  aiModel: string;
  processingTime: number;
}

interface HuggingFaceAIProps {
  photos: any[];
}

export default function HuggingFaceAI({ photos }: HuggingFaceAIProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [analysis, setAnalysis] = useState<HuggingFaceAnalysis | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const { toast } = useToast();

  const checkHuggingFaceStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch("/api/huggingface/status");
      const data = await response.json();
      setStatus(data);
      
      if (data.isAvailable) {
        toast({
          title: "Hugging Face připojeno",
          description: "AI model je připraven k použití",
        });
      } else {
        toast({
          title: "Hugging Face není dostupný",
          description: data.error || "Zkontrolujte konfiguraci API klíče",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check status:", error);
      toast({
        title: "Chyba při kontrole stavu",
        description: "Nepodařilo se zkontrolovat stav Hugging Face",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const analyzePhoto = async (photo: any) => {
    if (!photo) return;
    
    setIsAnalyzing(true);
    setSelectedPhoto(photo);
    setAnalysis(null);
    
    try {
      const imageUrl = photo.url || photo.secureUrl || photo.filename;
      const response = await fetch("/api/huggingface/analyze-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error("Analysis failed");
      }
      
      const data = await response.json();
      setAnalysis(data);
      
      toast({
        title: "Analýza dokončena",
        description: `Fotografie analyzována pomocí ${data.aiModel}`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analýza selhala",
        description: "Nepodařilo se analyzovat fotografii",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCaption = async (photo: any) => {
    if (!photo) return;
    
    setIsGeneratingCaption(true);
    setCaption("");
    
    try {
      const imageUrl = photo.url || photo.secureUrl || photo.filename;
      const response = await fetch("/api/huggingface/generate-caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error("Caption generation failed");
      }
      
      const data = await response.json();
      setCaption(data.caption);
      
      toast({
        title: "Popisek vygenerován",
        description: "AI vytvořilo popisek pro fotografii",
      });
    } catch (error) {
      console.error("Caption generation failed:", error);
      toast({
        title: "Generování popisku selhalo",
        description: "Nepodařilo se vygenerovat popisek",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const ScoreCard = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{Math.round(score)}%</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Check */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>Hugging Face AI</CardTitle>
          </div>
          <CardDescription>
            Pokročilá analýza fotografií pomocí Hugging Face modelů
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              onClick={checkHuggingFaceStatus}
              disabled={isCheckingStatus}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isCheckingStatus ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>Zkontrolovat stav</span>
            </Button>
            
            {status && (
              <div className="flex items-center space-x-2">
                {status.isAvailable ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Připraveno</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Nedostupné</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {status && !status.isAvailable && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {status.error || "Hugging Face API není dostupné. Zkontrolujte konfiguraci HUGGINGFACE_API_KEY."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Photo Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="h-5 w-5" />
            <span>Výběr fotografie</span>
          </CardTitle>
          <CardDescription>
            Vyberte fotografii pro analýzu pomocí Hugging Face AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.slice(0, 8).map((photo, index) => (
              <motion.div
                key={photo.id || index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selectedPhoto?.id === photo.id 
                    ? 'border-purple-500 ring-2 ring-purple-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url || photo.secureUrl || photo.filename}
                  alt="Wedding photo"
                  className="w-full h-24 object-cover"
                />
              </motion.div>
            ))}
          </div>
          
          {selectedPhoto && (
            <div className="mt-4 flex space-x-2">
              <Button
                onClick={() => analyzePhoto(selectedPhoto)}
                disabled={isAnalyzing}
                className="flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <span>Analyzovat fotografii</span>
              </Button>
              
              <Button
                onClick={() => generateCaption(selectedPhoto)}
                disabled={isGeneratingCaption}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isGeneratingCaption ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                <span>Vygenerovat popisek</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span>Analýza fotografie</span>
                </CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {analysis.aiModel}
                </Badge>
              </div>
              <CardDescription>
                Zpracováno za {analysis.processingTime}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scores" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="scores">Skóre</TabsTrigger>
                  <TabsTrigger value="context">Kontext</TabsTrigger>
                  <TabsTrigger value="suggestions">Návrhy</TabsTrigger>
                  <TabsTrigger value="strengths">Silné stránky</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scores" className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {analysis.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600">Celkové skóre</div>
                  </div>
                  
                  <div className="space-y-3">
                    <ScoreCard label="Kompozice" score={analysis.categories.composition} color="blue" />
                    <ScoreCard label="Osvětlení" score={analysis.categories.lighting} color="yellow" />
                    <ScoreCard label="Barvy" score={analysis.categories.colors} color="green" />
                    <ScoreCard label="Emoce" score={analysis.categories.emotion} color="red" />
                    <ScoreCard label="Technická kvalita" score={analysis.categories.technical} color="purple" />
                  </div>
                </TabsContent>
                
                <TabsContent value="context" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Typ fotografie</h4>
                      <p className="text-sm text-gray-600">{analysis.weddingContext.photoType}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Nálada</h4>
                      <p className="text-sm text-gray-600">{analysis.weddingContext.mood}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Prostředí</h4>
                      <p className="text-sm text-gray-600">{analysis.weddingContext.setting}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Objekty</h4>
                      <div className="flex flex-wrap gap-1">
                        {analysis.weddingContext.subjects.map((subject, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="suggestions" className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="strengths" className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Caption */}
      {caption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span>Vygenerovaný popisek</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm italic">{caption}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}