import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PhotoEnhancementSuggestion {
  category: 'lighting' | 'composition' | 'color' | 'technical' | 'artistic';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  confidence: number;
}

export interface PhotoAnalysisResult {
  overallScore: number;
  primaryIssues: string[];
  suggestions: PhotoEnhancementSuggestion[];
  strengths: string[];
  weddingContext: {
    photoType: string;
    subjects: string[];
    setting: string;
    lighting: string;
  };
}

export async function analyzePhotoForEnhancement(imageUrl: string): Promise<PhotoAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. AI analysis is not available.');
  }

  // Mock mode for testing when quota is exceeded
  const useMockData = process.env.USE_MOCK_AI === 'true';
  
  if (useMockData) {
    return {
      overallScore: 8,
      primaryIssues: ["Mírně podexponovaná fotka", "Kompozice by mohla být vylepšena"],
      suggestions: [
        {
          category: 'lighting',
          severity: 'medium',
          title: 'Zvýšit jas',
          description: 'Fotka je mírně tmavá',
          suggestion: 'Zvyšte expozici o +0.7 EV a stíny o +30',
          confidence: 0.85
        },
        {
          category: 'composition',
          severity: 'low',
          title: 'Upravit ořez',
          description: 'Subjekt není ideálně umístěn',
          suggestion: 'Použijte pravidlo třetin pro lepší kompozici',
          confidence: 0.75
        }
      ],
      strengths: ["Krásné svatební okamžiky", "Dobré emoční zachycení"],
      weddingContext: {
        photoType: "candid",
        subjects: ["bride", "groom"],
        setting: "outdoor",
        lighting: "natural"
      }
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional wedding photographer and photo enhancement expert. Analyze wedding photos and provide detailed, actionable enhancement suggestions. Focus on:

1. Technical aspects (exposure, focus, white balance, noise)
2. Composition (rule of thirds, leading lines, framing)
3. Lighting (natural vs artificial, harsh vs soft, direction)
4. Color grading (saturation, temperature, tint)
5. Artistic elements (emotion, storytelling, mood)

Consider the wedding context - these are precious memories that should look their best. Be constructive and specific in your recommendations.

Respond with JSON in this exact format:
{
  "overallScore": number (1-10),
  "primaryIssues": ["issue1", "issue2"],
  "suggestions": [
    {
      "category": "lighting|composition|color|technical|artistic",
      "severity": "low|medium|high",
      "title": "Short title",
      "description": "What's the issue",
      "suggestion": "How to fix it",
      "confidence": number (0-1)
    }
  ],
  "strengths": ["strength1", "strength2"],
  "weddingContext": {
    "photoType": "ceremony|reception|portraits|candid|group",
    "subjects": ["bride", "groom", "guests"],
    "setting": "indoor|outdoor|church|venue",
    "lighting": "natural|artificial|mixed|golden hour"
  }
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this wedding photo and provide enhancement suggestions. Focus on technical and artistic improvements that would make this photo even more beautiful and memorable."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and sanitize the response
    return {
      overallScore: Math.max(1, Math.min(10, result.overallScore || 7)),
      primaryIssues: Array.isArray(result.primaryIssues) ? result.primaryIssues.slice(0, 3) : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 5).map((s: any) => ({
        category: ['lighting', 'composition', 'color', 'technical', 'artistic'].includes(s.category) ? s.category : 'technical',
        severity: ['low', 'medium', 'high'].includes(s.severity) ? s.severity : 'medium',
        title: String(s.title || '').substring(0, 100),
        description: String(s.description || '').substring(0, 200),
        suggestion: String(s.suggestion || '').substring(0, 300),
        confidence: Math.max(0, Math.min(1, s.confidence || 0.5))
      })) : [],
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : [],
      weddingContext: {
        photoType: result.weddingContext?.photoType || 'candid',
        subjects: Array.isArray(result.weddingContext?.subjects) ? result.weddingContext.subjects.slice(0, 5) : [],
        setting: result.weddingContext?.setting || 'unknown',
        lighting: result.weddingContext?.lighting || 'natural'
      }
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    throw new Error('Failed to analyze photo for enhancement suggestions');
  }
}

export async function generateEnhancementPreview(
  imageUrl: string, 
  suggestions: PhotoEnhancementSuggestion[]
): Promise<string> {
  try {
    const topSuggestions = suggestions
      .filter(s => s.severity === 'high' || s.severity === 'medium')
      .slice(0, 3)
      .map(s => `- ${s.title}: ${s.suggestion}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a professional photo editor. Create a detailed description of how this wedding photo would look after applying the suggested enhancements. Be specific about visual improvements while maintaining the emotional and authentic nature of the wedding moment."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on these enhancement suggestions, describe how this wedding photo would look after improvements:\n\n${topSuggestions}\n\nDescribe the enhanced version in 2-3 sentences, focusing on the visual improvements and emotional impact.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 200
    });

    return response.choices[0].message.content || 'Enhanced version would show improved lighting, composition, and overall visual appeal.';
  } catch (error) {
    console.error('Error generating enhancement preview:', error);
    return 'Enhanced version would show improved lighting, composition, and overall visual appeal.';
  }
}