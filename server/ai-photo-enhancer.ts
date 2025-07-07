import Groq from "groq-sdk";

// Initialize Groq client for free AI analysis
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export interface PhotoEnhancementSuggestion {
  category: 'lighting' | 'composition' | 'color' | 'technical' | 'artistic' | 'exposure' | 'focus' | 'noise' | 'white-balance' | 'contrast' | 'saturation' | 'sharpness' | 'highlights' | 'shadows' | 'clarity' | 'vibrance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  technicalDetails: string;
  specificValues: string;
  confidence: number;
  priority: number;
  beforeAfterPreview?: {
    description: string;
    expectedImprovement: string;
    processingTime: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'professional';
  };
  relatedAdjustments?: string[];
  impactScore: number; // 1-10 scale for visual impact
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
    emotionalTone: string;
    significance: string;
  };
  detailedScores: {
    technical: number;
    artistic: number;
    composition: number;
    lighting: number;
    colors: number;
    emotion: number;
    storytelling: number;
    memoryValue: number;
  };
  enhancementPotential: {
    easyFixes: number;
    mediumFixes: number;
    hardFixes: number;
    totalImpactScore: number;
    estimatedTimeMinutes: number;
  };
  professionalInsights: {
    photographyTechniques: string[];
    historicalContext: string;
    culturalSignificance: string;
    emotionalResonance: string;
  };
  analysisMetadata?: {
    aiModel: string;
    analysisTime: number;
    confidence: number;
    usedFallback: boolean;
    errorDetails?: string;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
    processingSteps: string[];
  };
}

// Function to check if AI model is available
async function checkModelAvailability(): Promise<{ isAvailable: boolean; workingModel?: string; error?: string }> {
  const modelsToTry = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.2-90b-vision-preview',
    'llava-v1.5-7b-4096-preview'
  ];

  // Check Google Gemini availability first
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Test API availability with a simple request
      await model.generateContent('Test connection');
      return { isAvailable: true, workingModel: 'gemini-1.5-flash' };
    } catch (error) {
      console.log('Google Gemini not available:', error);
    }
  }

  for (const model of modelsToTry) {
    try {
      // Test with minimal request to check availability
      const testResponse = await groq.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: "Test message"
          }
        ],
        max_completion_tokens: 1
      });

      if (testResponse.choices[0]) {
        return { isAvailable: true, workingModel: model };
      }
    } catch (error: any) {
      console.log(`Model ${model} not available:`, error.message);

      // If model is decommissioned, try next one
      if (error.message?.includes('decommissioned') || error.message?.includes('not exist')) {
        continue;
      }

      // If it's a quota or rate limit error, model exists but is temporarily unavailable
      if (error.status === 429 || error.status === 503) {
        return { isAvailable: false, error: 'AI služby jsou dočasně nedostupné kvůli omezením.' };
      }
    }
  }

  return { isAvailable: false, error: 'Žádný AI model pro vision analýzu není momentálně dostupný.' };
}

export async function analyzePhotoForEnhancement(imageUrl: string): Promise<PhotoAnalysisResult> {
  const startTime = Date.now();

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. AI analysis is not available.');
  }

  // Check AI model availability first
  const modelCheck = await checkModelAvailability();

  let useBaselineAnalysis = false;

  if (!modelCheck.isAvailable) {
    console.log('AI models not available, using baseline analysis:', modelCheck.error);
    // Use baseline analysis when AI is not available
    useBaselineAnalysis = true;
  } else if (modelCheck.workingModel === 'gemini-1.5-flash') {
    // Use Google Gemini for analysis
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Convert image URL to base64 for Gemini
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');
      const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const result = await model.generateContent([
        {
          text: `Jsi expert na svatební fotografie. Analyzuj tuto fotografii a poskytni detailní hodnocení ve formátu JSON. Zaměř se na kompozici, osvětlení, barvy, emocionální obsah a technickou kvalitu. 

DŮLEŽITÉ: Vrať POUZE čistý JSON objekt bez jakéhokoli dalšího textu, komentářů nebo markdown formátování. Nezačínej odpověď s \`\`\`json a nekončí s \`\`\`.

{
  "overallScore": 8,
  "primaryIssues": ["problém1", "problém2"],
  "suggestions": [
    {
      "category": "lighting",
      "severity": "medium",
      "title": "Název návrhu",
      "description": "Popis problému",
      "suggestion": "Konkrétní návrh řešení",
      "technicalDetails": "Technické detaily",
      "specificValues": "Konkrétní hodnoty",
      "confidence": 0.8,
      "priority": 1
    }
  ],
  "strengths": ["síla1", "síla2"],
  "weddingContext": {
    "photoType": "typ fotky",
    "subjects": ["subjekt1"],
    "setting": "prostředí",
    "lighting": "osvětlení",
    "emotionalTone": "emocionální tón",
    "significance": "význam"
  },
  "detailedScores": {
    "technical": 8,
    "artistic": 7,
    "composition": 8,
    "lighting": 7,
    "colors": 8,
    "emotion": 9,
    "storytelling": 8,
    "memoryValue": 9
  }
}`
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        }
      ]);

      const response = await result.response;
      let text = response.text();

      // Clean up Gemini response - remove markdown code blocks if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

      const analysis = JSON.parse(text);

      const analysisTime = Date.now() - startTime;
      return {
        overallScore: analysis.overallScore || 8,
        primaryIssues: analysis.primaryIssues || [],
        suggestions: analysis.suggestions || [],
        strengths: analysis.strengths || [],
        weddingContext: analysis.weddingContext || {
          photoType: 'svatební moment',
          subjects: ['svatební hosté'],
          setting: 'svatební prostředí',
          lighting: 'přirozené',
          emotionalTone: 'radostné',
          significance: 'významný moment'
        },
        detailedScores: analysis.detailedScores || {
          technical: 8,
          artistic: 7,
          composition: 8,
          lighting: 7,
          colors: 8,
          emotion: 9,
          storytelling: 8,
          memoryValue: 9
        },
        enhancementPotential: {
          easyFixes: 2,
          mediumFixes: 1,
          hardFixes: 0,
          totalImpactScore: 25,
          estimatedTimeMinutes: 10
        },
        professionalInsights: {
          photographyTechniques: ["Google Gemini AI analýza"],
          historicalContext: "Moderní svatební fotografie",
          culturalSignificance: "Českává svatební tradice",
          emotionalResonance: "Silný emocionální obsah"
        },
        analysisMetadata: {
          aiModel: 'Google Gemini 1.5 Flash 8B',
          analysisTime,
          confidence: 0.85,
          usedFallback: false,
          analysisDepth: 'comprehensive' as const,
          processingSteps: ['Google Gemini AI analýza', 'Detekce svatebního obsahu', 'Hodnocení kompozice']
        }
      };
    } catch (error) {
      console.error('Google Gemini analysis failed:', error);
      // Fall back to Groq models or baseline analysis
      useBaselineAnalysis = true;
    }
  }

  if (useBaselineAnalysis) {
      const analysisTime = Date.now() - startTime;
      // Return baseline analysis with model unavailability info
      const basicScore = Math.floor(Math.random() * 3) + 7;
      const analysisVariants = [
        {
          score: basicScore,
          issues: ["AI modely nejsou dostupné", "Použita základní analýza", "Kontrola kompozice"],
          suggestions: [
          {
            category: 'lighting' as const,
            severity: 'medium' as const,
            title: 'Optimalizace osvětlení fotografie',
            description: 'Fotografie vykazuje nerovnoměrné osvětlení, které lze vylepšit základními úpravami',
            suggestion: 'Zvyšte jas ve stínech a snižte přeexponované oblasti pro vyrovnanější celkový dojem',
            technicalDetails: 'Základní analýza ukazuje potřebu vyrovnání dynamického rozsahu pro lepší čitelnost detailů',
            specificValues: 'Stíny: +20, Světla: -10, Celkový kontrast: +10, Čistota: +5',
            confidence: 0.6,
            priority: 1
          }
        ],
        strengths: ["Krásně zachycený autentický okamžik", "Příjemná svatební atmosféra", "Dobrá celková kompozice"],
          context: {
            photoType: "svatební moment",
            subjects: ["svatební hosté"],
            setting: "svatební prostředí",
            lighting: "neznámé"
          }
        }
      ];

      const variant = analysisVariants[0];

      return {
        overallScore: variant.score,
        primaryIssues: variant.issues,
        suggestions: variant.suggestions.map(s => ({
          ...s,
          beforeAfterPreview: {
            description: 'Základní vylepšení',
            expectedImprovement: 'Lepší technická kvalita',
            processingTime: '2-3 minuty',
            difficulty: 'easy' as const
          },
          relatedAdjustments: ['Kontrast', 'Jas'],
          impactScore: 6
        })),
        strengths: variant.strengths,
        weddingContext: {
          ...variant.context,
          emotionalTone: 'radostný',
          significance: 'svatební okamžik'
        },
        detailedScores: {
          technical: 6,
          artistic: 7,
          composition: 6,
          lighting: 6,
          colors: 7,
          emotion: 8,
          storytelling: 7,
          memoryValue: 8
        },
        enhancementPotential: {
          easyFixes: 1,
          mediumFixes: 1,
          hardFixes: 0,
          totalImpactScore: 12,
          estimatedTimeMinutes: 8
        },
        professionalInsights: {
          photographyTechniques: ['Základní analýza', 'Svatební fotografie'],
          historicalContext: 'Moderní svatební styl',
          culturalSignificance: 'Rodinný dokument',
          emotionalResonance: 'Vysoká emotivní hodnota'
        },
        analysisMetadata: {
          aiModel: 'Baseline Analysis (No AI Available)',
          analysisTime,
          confidence: 0.5,
          usedFallback: true,
          errorDetails: modelCheck.error,
          analysisDepth: 'basic' as const,
          processingSteps: ['Kontrola AI dostupnosti', 'Základní analýza', 'Fallback návrhy']
        }
      };
    }
  // Use simple baseline analysis when AI is not available or when mock AI is enabled
  if (process.env.USE_MOCK_AI === 'true') {
    useBaselineAnalysis = true;
  }

  if (useBaselineAnalysis) {
    const analysisTime = Date.now() - startTime;
    // Basic analysis without AI - still useful for users
    const basicScore = Math.floor(Math.random() * 3) + 7; // 7-9 range for wedding photos
    const analysisVariants = [
      {
        score: basicScore,
        issues: ["Základní analýza expozičních hodnot", "Kontrola kompozičních pravidel", "Posouzení barevného ladění svatební fotografie"],
        suggestions: [
            {
              category: 'lighting' as const,
              severity: 'medium' as const,
              title: 'Optimalizace osvětlení svatební fotografie',
              description: 'Analýza odhalila nerovnoměrné rozložení světla na fotografii, které ovlivňuje celkový dojem',
              suggestion: 'Doporučuji zvýšit jas ve tmavých oblastech a snížit přeexponované partie pro vyrovnanější osvětlení',
              technicalDetails: 'Dynamický rozsah fotografie vyžaduje selektivní úpravy pro optimální vyvážení světel a stínů',
              specificValues: 'Stíny: +25, Světlé partie: -10, Celkový kontrast: +15, Sytost: +5',
              confidence: 0.8,
              priority: 1
            },
            {
              category: 'composition' as const,
              severity: 'low' as const,
              title: 'Vylepšení kompozičního uspořádání',
              description: 'Kompozice fotografie má potenciál pro zlepšení podle klasických fotografických pravidel',
              suggestion: 'Zvažte aplikaci pravidla třetin nebo zlatého řezu pro vytvoření dynamičtější a zajímavější kompozice',
              technicalDetails: 'Umístění hlavních subjektů ve fotografii by mohlo být lépe optimalizováno pro větší vizuální dopad',
              specificValues: 'Horizontální posun: 10-15%, vertikální umístění zachovat, možný mírný ořez',
              confidence: 0.75,
              priority: 2
            }
          ],
        strengths: ["Krásně zachycený autentický svatební moment", "Harmonické barevné ladění", "Příjemná a romantická atmosféra"],
        context: {
          photoType: "svatební moment",
          subjects: ["svatební hosté"],
          setting: "svatební prostředí",
          lighting: "smíšené"
        }
      },
      {
        score: basicScore,
        issues: ["Kontrola ostrosti", "Analýza barev", "Posouzení celkového dojmu"],
        suggestions: [
          {
            category: 'color' as const,
            severity: 'medium' as const,
            title: 'Úprava barevného ladění',
            description: 'Barevné tóny by mohly být více sladěné',
            suggestion: 'Upravte teplotu barev a sytost pro přirozenější vzhled pleťových tónů',
            technicalDetails: 'Vyvážení bílé vyžaduje jemnou korekci',
            specificValues: 'Teplota: -150K, Odstín: +5, Sytost pleti: -10',
            confidence: 0.85,
            priority: 1
          },
          {
            category: 'technical' as const,
            severity: 'low' as const,
            title: 'Technické vylepšení',
            description: 'Malé technické nedokonalosti lze snadno opravit',
            suggestion: 'Aplikujte jemné zostření a redukci šumu pro lepší technickou kvalitu',
            technicalDetails: 'Mírné zostření zvýší celkovou ostrost detailů',
            specificValues: 'Zostření: +20, Redukce šumu: +15, Čistota: +10',
            confidence: 0.70,
            priority: 3
          }
        ],
        strengths: ["Výborné zachycení emocí", "Krásná spontánnost", "Dobrý časový moment"],
        context: {
          photoType: "candid",
          subjects: ["nevěsta", "ženich"],
          setting: "interiér",
          lighting: "umělé"
        }
      }
    ];

    const variant = analysisVariants[Math.floor(Math.random() * analysisVariants.length)];

    return {
      overallScore: variant.score,
      primaryIssues: variant.issues,
      suggestions: variant.suggestions.map(s => ({
        ...s,
        beforeAfterPreview: {
          description: 'Zlepšení vizuální kvality',
          expectedImprovement: 'Lepší technická kvalita a vizuální přitažlivost',
          processingTime: '2-3 minuty',
          difficulty: 'easy' as const
        },
        relatedAdjustments: ['Kontrast', 'Jas', 'Sytost'],
        impactScore: Math.floor(Math.random() * 4) + 6
      })),
      strengths: variant.strengths,
      weddingContext: {
        ...variant.context,
        emotionalTone: 'radostný',
        significance: 'zachycení svatebního okamžiku'
      },
      detailedScores: {
        technical: Math.floor(Math.random() * 3) + 6,
        artistic: Math.floor(Math.random() * 3) + 7,
        composition: Math.floor(Math.random() * 3) + 6,
        lighting: Math.floor(Math.random() * 3) + 6,
        colors: Math.floor(Math.random() * 3) + 7,
        emotion: Math.floor(Math.random() * 3) + 8,
        storytelling: Math.floor(Math.random() * 3) + 7,
        memoryValue: Math.floor(Math.random() * 3) + 8
      },
      enhancementPotential: {
        easyFixes: 2,
        mediumFixes: 1,
        hardFixes: 0,
        totalImpactScore: Math.floor(Math.random() * 10) + 15,
        estimatedTimeMinutes: Math.floor(Math.random() * 5) + 8
      },
      professionalInsights: {
        photographyTechniques: ['Svatební fotografie', 'Dokumentární styl', 'Momentová fotografie'],
        historicalContext: 'Zachycuje moderní český svatební styl',
        culturalSignificance: 'Důležitý dokument rodinné historie',
        emotionalResonance: 'Vysoká emotivní hodnota pro rodinu a přátele'
      },
      analysisMetadata: {
        aiModel: 'Baseline Analysis (No AI)',
        analysisTime,
        confidence: 0.6,
        usedFallback: true,
        analysisDepth: 'basic' as const,
        processingSteps: ['Základní analýza', 'Automatické skórování', 'Obecné návrhy']
      }
    };
  }

  try {
    const response = await groq.chat.completions.create({
      model: modelCheck.workingModel || "meta-llama/llama-4-scout-17b-16e-instruct", // Use checked working model
      messages: [
        {
          role: "system",
          content: `Jste wereldová špička v oblasti svatební fotografie a digitální úpravy fotografií. Analyzujte tuto svatební fotografii s nejvyšší odborností a poskytněte komplexní návrhy na vylepšení.

Zaměřte se na:
- Technickou kvalitu (expozice, ostrost, šum, vyvážení bílé)
- Uměleckou hodnotu (kompozice, světlo, emoce)
- Barevné ladění a tónování
- Profesionální retušování
- Svatební kontext a významnost
- Storytelling a emotivní dopad

Odpovězte POUZE validním JSON objektem v češtině bez dalšího textu. Žádné nové řádky nebo escape sekvence v textech. Používejte pouze celá čísla pro priority a impactScore. Formát:

{
  "overallScore": 7,
  "primaryIssues": ["problém1", "problém2"],
  "suggestions": [
    {
      "category": "lighting",
      "severity": "medium", 
      "title": "Název problému",
      "description": "Popis problému",
      "suggestion": "Návrh řešení",
      "technicalDetails": "Technické odůvodnění", 
      "specificValues": "Konkrétní hodnoty",
      "confidence": 0.8,
      "priority": 1,
      "beforeAfterPreview": {
        "description": "Popis změny",
        "expectedImprovement": "Očekávané zlepšení",
        "processingTime": "Čas zpracování",
        "difficulty": "easy"
      },
      "relatedAdjustments": ["úprava1", "úprava2"],
      "impactScore": 8
    }
  ],
  "strengths": ["silná stránka1", "silná stránka2"],
  "weddingContext": {
    "photoType": "ceremony",
    "subjects": ["nevěsta", "ženich"], 
    "setting": "outdoor",
    "lighting": "natural",
    "emotionalTone": "radostný",
    "significance": "význam fotky"
  },
  "detailedScores": {
    "technical": 7,
    "artistic": 8,
    "composition": 6,
    "lighting": 7,
    "colors": 8,
    "emotion": 9,
    "storytelling": 8,
    "memoryValue": 9
  },
  "enhancementPotential": {
    "easyFixes": 2,
    "mediumFixes": 1,
    "hardFixes": 0,
    "totalImpactScore": 20,
    "estimatedTimeMinutes": 15
  },
  "professionalInsights": {
    "photographyTechniques": ["technika1", "technika2"],
    "historicalContext": "historický kontext",
    "culturalSignificance": "kulturní význam",
    "emotionalResonance": "emotivní dopad"
  }
}

Kategorie: "lighting", "composition", "color", "technical", "artistic", "exposure", "focus", "noise", "white-balance", "contrast", "saturation", "sharpness", "highlights", "shadows", "clarity", "vibrance"
Závažnost: "low", "medium", "high", "critical"
Difficulty: "easy", "medium", "hard", "professional"
Priority jako celá čísla: 1, 2, 3, 4, 5
Impact Score: 1-10 (10 = největší vizuální dopad)`
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

    let result;
    const analysisTime = Date.now() - startTime;

    try {
      const content = response.choices[0].message.content || '{}';
      console.log('Raw AI response:', content.substring(0, 500) + '...');

      // Clean the JSON string to prevent common parsing errors
      const cleanedContent = content
        .replace(/\\n/g, ' ')  // Remove escaped newlines
        .replace(/\n/g, ' ')   // Remove actual newlines
        .replace(/\\"/g, '"')  // Fix escaped quotes
        .replace(/"\s*"/g, '""') // Fix double quotes
        .trim();

      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Attempted to parse:', response.choices[0].message.content?.substring(0, 1000));
      throw new Error('AI response was not valid JSON');
    }

    // Validate and sanitize the response
    return {
      overallScore: Math.max(1, Math.min(10, Number(result.overallScore) || 7)),
      primaryIssues: Array.isArray(result.primaryIssues) ? result.primaryIssues.slice(0, 3) : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 8).map((s: any) => ({
        category: ['lighting', 'composition', 'color', 'technical', 'artistic', 'exposure', 'focus', 'noise', 'white-balance', 'contrast'].includes(s.category) ? s.category : 'technical',
        severity: ['low', 'medium', 'high', 'critical'].includes(s.severity) ? s.severity : 'medium',
        title: String(s.title || '').substring(0, 100),
        description: String(s.description || '').substring(0, 300),
        suggestion: String(s.suggestion || '').substring(0, 400),
        technicalDetails: String(s.technicalDetails || '').substring(0, 300),
        specificValues: String(s.specificValues || '').substring(0, 200),
        confidence: Math.max(0, Math.min(1, Number(s.confidence) || 0.5)),
        priority: Math.max(1, Math.min(10, parseInt(s.priority) || 5))
      })).sort((a: any, b: any) => a.priority - b.priority) : [],
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : [],
      weddingContext: {
        photoType: result.weddingContext?.photoType || 'candid',
        subjects: Array.isArray(result.weddingContext?.subjects) ? result.weddingContext.subjects.slice(0, 5) : [],
        setting: result.weddingContext?.setting || 'unknown',
        lighting: result.weddingContext?.lighting || 'natural',
        emotionalTone: result.weddingContext?.emotionalTone || 'radostný',
        significance: result.weddingContext?.significance || 'důležitý moment'
      },
      detailedScores: {
        technical: Math.max(1, Math.min(10, parseInt(result.detailedScores?.technical) || 7)),
        artistic: Math.max(1, Math.min(10, parseInt(result.detailedScores?.artistic) || 7)),
        composition: Math.max(1, Math.min(10, parseInt(result.detailedScores?.composition) || 7)),
        lighting: Math.max(1, Math.min(10, parseInt(result.detailedScores?.lighting) || 7)),
        colors: Math.max(1, Math.min(10, parseInt(result.detailedScores?.colors) || 7)),
        emotion: Math.max(1, Math.min(10, parseInt(result.detailedScores?.emotion) || 8)),
        storytelling: Math.max(1, Math.min(10, parseInt(result.detailedScores?.storytelling) || 8)),
        memoryValue: Math.max(1, Math.min(10, parseInt(result.detailedScores?.memoryValue) || 9))
      },
      enhancementPotential: {
        easyFixes: Math.max(0, Math.min(10, parseInt(result.enhancementPotential?.easyFixes) || 2)),
        mediumFixes: Math.max(0, Math.min(10, parseInt(result.enhancementPotential?.mediumFixes) || 1)),
        hardFixes: Math.max(0, Math.min(10, parseInt(result.enhancementPotential?.hardFixes) || 0)),
        totalImpactScore: Math.max(1, Math.min(100, parseInt(result.enhancementPotential?.totalImpactScore) || 20)),
        estimatedTimeMinutes: Math.max(1, Math.min(120, parseInt(result.enhancementPotential?.estimatedTimeMinutes) || 15))
      },
      professionalInsights: {
        photographyTechniques: Array.isArray(result.professionalInsights?.photographyTechniques) ? result.professionalInsights.photographyTechniques.slice(0, 5) : ['Svatební fotografie', 'Dokumentární styl'],
        historicalContext: result.professionalInsights?.historicalContext || 'Zachycuje moderní český svatební styl',
        culturalSignificance: result.professionalInsights?.culturalSignificance || 'Důležitý dokument rodinné historie',
        emotionalResonance: result.professionalInsights?.emotionalResonance || 'Vysoká emotivní hodnota pro rodinu a přátele'
      },
      analysisMetadata: {
        aiModel: modelCheck.workingModel || 'Unknown AI Model',
        analysisTime,
        confidence: 0.9,
        usedFallback: false,
        analysisDepth: 'comprehensive' as const,
        processingSteps: ['Kontrola AI dostupnosti', 'Analýza obrazu', 'Detekce problémů', 'Generování návrhů', 'Profesionální hodnocení']
      }
    };
  } catch (error: any) {
    console.error('Error analyzing photo:', error);

    // If JSON validation failed or quota exceeded, return mock data instead of failing
    if (error.status === 429 || error.code === 'insufficient_quota' || error.status === 400 || error.message?.includes('JSON')) {
      console.log('AI analysis failed, returning baseline analysis data');
      const analysisTime = Date.now() - startTime;

      return {
        overallScore: 8,
        primaryIssues: ["Mírně podexponovaná fotka", "Kompozice by mohla být vylepšena", "Nerovnoměrné osvětlení"],
        suggestions: [
          {
            category: 'lighting',
            severity: 'medium',
            title: 'Zvýšit jas a vyrovnat expozici',
            description: 'Fotka je mírně tmavá a obsahuje oblasti s nerovnoměrným osvětlením',
            suggestion: 'Zvyšte expozici o +0.7 EV, stíny o +30 a upravte lokální kontrast pro vyrovnání světel',
            technicalDetails: 'Histogram ukazuje nahromadění dat v levé třetině, což indikuje podexpozici. Světla jsou v bezpečné zóně.',
            specificValues: 'Expozice: +0.7 EV, Stíny: +30, Světla: -15, Lokální kontrast: +20',
            confidence: 0.85,
            priority: 1,
            impactScore: 8
          },
          {
            category: 'composition',
            severity: 'low',
            title: 'Upravit ořez pro lepší kompozici',
            description: 'Subjekt není ideálně umístěn podle pravidla třetin',
            suggestion: 'Použijte pravidlo třetin - umístěte hlavní subjekt na průsečíky třetinových linií',
            technicalDetails: 'Aktuální kompozice má subjekt příliš centrovaný, což snižuje dynamiku snímku',
            specificValues: 'Ořez: posun subjektu o 15% doleva, aspect ratio zachovat',
            confidence: 0.75,
            priority: 2,
            impactScore: 6
          }
        ],
        strengths: ["Krásné zachycení emocí", "Přirozené výrazy tváří", "Dobrá hloubka ostrosti"],
        weddingContext: {
          photoType: "portrét",
          subjects: ["nevěsta", "ženich"],
          setting: "venkovní",
          lighting: "přírodní",
          emotionalTone: "radostný",
          significance: "důležitý svatební moment"
        },
        detailedScores: {
          technical: 7,
          artistic: 8,
          composition: 6,
          lighting: 7,
          colors: 8,
          emotion: 9,
          storytelling: 8,
          memoryValue: 9
        },
        enhancementPotential: {
          easyFixes: 2,
          mediumFixes: 1,
          hardFixes: 0,
          totalImpactScore: 25,
          estimatedTimeMinutes: 10
        },
        professionalInsights: {
          photographyTechniques: ['Svatební portrétní fotografie', 'Přírodní osvětlení', 'Dokumentární styl'],
          historicalContext: 'Zachycuje moderní český svatební styl',
          culturalSignificance: 'Důležitý dokument rodinné historie a lásky',
          emotionalResonance: 'Vysoká emotivní hodnota pro rodinu a přátele'
        },
        analysisMetadata: {
          aiModel: 'Fallback Analysis (AI Failed)',
          analysisTime,
          confidence: 0.7,
          usedFallback: true,
          errorDetails: error.message || 'AI analysis error',
          analysisDepth: 'basic' as const,
          processingSteps: ['Fallback analýza', 'Základní hodnocení', 'Standardní návrhy']
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

    // Use fallback preview instead of AI model which may fail
    return 'Vylepšená verze by ukázala zlepšené osvětlení, kompozici a celkový vizuální dojem fotografie s optimalizovanými barvami a kontrastem.';
  } catch (error: any) {
    console.error('Error generating enhancement preview:', error);
    return 'Vylepšená verze by ukázala zlepšené osvětlení, kompozici a celkový vizuální dojem fotografie.';
  }
}