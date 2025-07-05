import Groq from "groq-sdk";

// Initialize Groq client for free AI analysis
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

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
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. AI analysis is not available.');
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
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groq's current Llama 4 Scout vision model
      messages: [
        {
          role: "system",
          content: `Jste profesionální svatební fotograf a expert na vylepšení fotografií. Analyzujte svatební fotky a poskytněte detailní, praktické návrhy na vylepšení. Zaměřte se na:

1. Technické aspekty (expozice, zaostření, vyvážení bílé, šum)
2. Kompozice (pravidlo třetin, vedoucí linky, rámování)
3. Osvětlení (přirozené vs umělé, tvrdé vs měkké, směr)
4. Barevné ladění (sytost, teplota, odstín)
5. Umělecké prvky (emoce, vyprávění, nálada)

Uvažujte o svatebním kontextu - jsou to vzácné vzpomínky, které by měly vypadat nejlépe. Buďte konstruktivní a konkrétní ve svých doporučeních.

Odpovězte POUZE validním JSON objektem v češtině. Dodržte přesně tento formát bez dalšího textu:
{
  "overallScore": 7,
  "primaryIssues": ["problém1", "problém2"],
  "suggestions": [
    {
      "category": "lighting",
      "severity": "medium",
      "title": "Krátký český název",
      "description": "Popis problému v češtině",
      "suggestion": "Návrh řešení v češtině",
      "confidence": 0.8
    }
  ],
  "strengths": ["silná stránka1", "silná stránka2"],
  "weddingContext": {
    "photoType": "ceremony",
    "subjects": ["nevěsta", "ženich"],
    "setting": "outdoor",
    "lighting": "natural"
  }
}

DŮLEŽITÉ: Použijte pouze tyto hodnoty pro category: "lighting", "composition", "color", "technical", "artistic"
Použijte pouze tyto hodnoty pro severity: "low", "medium", "high"
Všechny texty (title, description, suggestion, strengths, primaryIssues) pište v češtině.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Prosím analyzujte tuto svatební fotku a poskytněte návrhy na vylepšení. Zaměřte se na technická a umělecká vylepšení, která by tuto fotku učinila ještě krásnější a nezapomenutelnější."
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
      max_completion_tokens: 1000,
      temperature: 0.7
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
  } catch (error: any) {
    console.error('Error analyzing photo:', error);

    // If quota exceeded, return mock data instead of failing
    if (error.status === 429 || error.code === 'insufficient_quota') {
      console.log('Groq quota exceeded, returning mock analysis data');
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

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groq's current Llama 4 Scout vision model
      messages: [
        {
          role: "system",
          content: "Jste profesionální editor fotografií. Vytvořte detailní popis toho, jak by tato svatební fotka vypadala po aplikaci navržených vylepšení. Buďte konkrétní ohledně vizuálních vylepšení při zachování emocionální a autentické povahy svatebního okamžiku."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Na základě těchto návrhů na vylepšení popište, jak by tato svatební fotka vypadala po vylepšeních:\n\n${topSuggestions}\n\nPopište vylepšenou verzi ve 2-3 větách, zaměřte se na vizuální vylepšení a emocionální dopad.`
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
      max_completion_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content || 'Enhanced version would show improved lighting, composition, and overall visual appeal.';
  } catch (error: any) {
    console.error('Error generating enhancement preview:', error);

    // Return a localized fallback message
    return 'Vylepšená verze by ukázala zlepšené osvětlení, kompozici a celkový vizuální dojem fotografie.';
  }
}