import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Camera, Brain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HuggingFaceAI from "./huggingface-ai";

export default function AIFeatures() {
  const { data: photosData = { photos: [] } } = useQuery({
    queryKey: ["/api/photos"],
    queryFn: async () => {
      const response = await fetch("/api/photos");
      if (!response.ok) {
        throw new Error("Failed to fetch photos");
      }
      return response.json();
    },
  });

  const photos = photosData.photos || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Asistent pro Svatbu
        </h2>
        <p className="text-gray-600 mb-6">
          Využijte umělou inteligenci pro analýzu vašich svatebních fotografií
        </p>
      </div>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Standardní AI
          </TabsTrigger>
          <TabsTrigger value="huggingface" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Hugging Face
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                AI Analýza Fotografií
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Aktivní
                </Badge>
              </CardTitle>
              <CardDescription>
                Pokročilá analýza svatebních fotografií s návrhy na vylepšení
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Automatická analýza kompozice, osvětlení a kvality</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Personalizované návrhy na vylepšení fotografií</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Hodnocení technické kvality a svatebního kontextu</span>
                </div>
                <Alert>
                  <Camera className="h-4 w-4" />
                  <AlertDescription>
                    AI analýza je k dispozici pro každou nahranou fotografii. 
                    Klikněte na tlačítko "AI Analýza" u libovolné fotky v galerii.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="huggingface" className="space-y-6">
          <HuggingFaceAI photos={photos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}