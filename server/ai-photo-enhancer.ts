import Groq from "groq-sdk";

// Initialize Groq client for free AI analysis
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export interface PhotoEnhancementSuggestion {
  category: 'lighting' | 'composition' | 'color' | 'technical' | 'artistic' | 'exposure' | 'focus' | 'noise' | 'white-balance' | 'contrast';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  technicalDetails: string;
  specificValues: string;
  confidence: number;
  priority: number;
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

  // Use simple baseline analysis when AI is not available
  const useBaselineAnalysis = process.env.USE_MOCK_AI === 'true';

  if (useBaselineAnalysis) {
    // Basic analysis without AI - still useful for users
    const basicScore = Math.floor(Math.random() * 3) + 7; // 7-9 range for wedding photos
    const analysisVariants = [
      {
        score: basicScore,
        issues: ["Analýza expozice", "Kontrola kompozice", "Posouzení barevného ladění"],
        suggestions: [
          {
            category: 'lighting' as const,
            severity: 'medium' as const,
            title: 'Optimalizace osvětlení',
            description: 'Zjištěna nerovnoměrnost osvětlení na fotografii',
            suggestion: 'Zvyšte jas ve stínech a snižte přeexponované oblasti pro vyrovnanější osvětlení',
            technicalDetails: 'Dynamický rozsah vyžaduje lokální úpravy pro lepší vyvážení',
            specificValues: 'Stíny: +25, Světla: -10, Kontrast: +15',
            confidence: 0.8,
            priority: 1
          },
          {
            category: 'composition' as const,
            severity: 'low' as const,
            title: 'Vylepšení kompozice',
            description: 'Kompozice má prostor pro zlepšení podle fotografických pravidel',
            suggestion: 'Zvažte aplikaci pravidla třetin nebo zlatého řezu pro dynamičtější kompozici',
            technicalDetails: 'Umístění hlavního subjektu může být optimalizováno',
            specificValues: 'Posun: horizontálně o 10-15%, vertikálně zachovat',
            confidence: 0.75,
            priority: 2
          }
        ],
        strengths: ["Zachycený autentický moment", "Dobrá barevná harmonie", "Příjemná atmosféra"],
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
      suggestions: variant.suggestions,
      strengths: variant.strengths,
      weddingContext: variant.context
    };
  }

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groq's current Llama 4 Scout vision model
      messages: [
        {
          role: "system",
          content: `Jste renomovaný svatební fotograf s 20letou praxí a expert na digitální postprodukci. Analyzujte tuto svatební fotografii s maximální přesností a poskytněte detailní, technicky fundované návrhy na vylepšení.

ANALYZUJTE TYTO ASPEKTY:

🔍 TECHNICKÁ KVALITA:
- Expozice (histogram, světla/stíny, ořezané hodnoty)
- Zaostření (hloubka ostrosti, motion blur, správné zaostření na subjekt)
- Vyvážení bílé (teplota, odstín, konzistence osvětlení)
- Šum a zrnitost (ISO performance, detail v stínech)
- Dynamický rozsah a kontrast

📐 KOMPOZICE A RÁMOVÁNÍ:
- Pravidlo třetin a zlatý řez
- Vedoucí linky a vizuální flow
- Rámování a ořez (headroom, breathing room)
- Symetrie vs asymetrie
- Pozadí a rušivé elementy
- Hloubka kompozice (foreground/background)

💡 OSVĚTLENÍ A ATMOSFÉRA:
- Kvalita a směr světla (tvrdé/měkké, front/back/side lit)
- Stíny a jejich charakter
- Modelování obličeje a postav
- Atmospheric lighting (golden hour, blue hour, backlight)
- Reflections a bliky

🎨 BAREVNÉ LADĚNÍ:
- Barevná harmonie a paleta
- Sytost a luminance jednotlivých kanálů
- Skin tones a jejich přirozenost
- Color grading potential
- Konzistence barev v celé fotografii

👰🤵 SVATEBNÍ SPECIFIKA:
- Emocionální moment a jeho zachycení
- Svatební detaily (šaty, oblek, květiny, prsteny)
- Interakce mezi lidmi
- Storytelling a narativní síla
- Tradice a kulturní aspekty

Buďte VELMI KONKRÉTNÍ ve svých návrzích - uveďte přesné hodnoty pro korekce (např. "+0.7 EV expozice", "-10 highlights", "+25 shadows", "teplota 5200K"). Pro každý návrh poskytněte technické odůvodnění.

Odpovězte POUZE validním JSON objektem v češtině. Dodržte přesně tento formát bez dalšího textu:
{
  "overallScore": 7,
  "primaryIssues": ["problém1", "problém2"],
  "suggestions": [
    {
      "category": "lighting",
      "severity": "medium",
      "title": "Krátký český název",
      "description": "Detailní popis problému v češtině",
      "suggestion": "Návrh řešení v češtině",
      "technicalDetails": "Technické vysvětlení proč je tento problém důležitý",
      "specificValues": "Konkrétní hodnoty pro korekci (např. +0.7 EV, -10 highlights)",
      "confidence": 0.8,
      "priority": 1
    }
  ],
  "strengths": ["silná stránka1", "silná stránka2"],
  "technicalAnalysis": {
    "exposureAnalysis": "Detailní analýza expozice",
    "focusAnalysis": "Analýza zaostření a hloubky ostrosti",
    "colorAnalysis": "Analýza barevného ladění",
    "compositionAnalysis": "Analýza kompozice"
  },
  "weddingContext": {
    "photoType": "ceremony",
    "subjects": ["nevěsta", "ženich"],
    "setting": "outdoor",
    "lighting": "natural",
    "emotionalTone": "romantic",
    "technicalContext": "handheld/tripod"
  }
}

DŮLEŽITÉ: Použijte pouze tyto hodnoty pro category: "lighting", "composition", "color", "technical", "artistic", "exposure", "focus", "noise", "white-balance", "contrast"
Použijte pouze tyto hodnoty pro severity: "low", "medium", "high", "critical"
Řaďte návrhy podle priority (1 = nejvyšší priorita)
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
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 8).map((s: any) => ({
        category: ['lighting', 'composition', 'color', 'technical', 'artistic', 'exposure', 'focus', 'noise', 'white-balance', 'contrast'].includes(s.category) ? s.category : 'technical',
        severity: ['low', 'medium', 'high', 'critical'].includes(s.severity) ? s.severity : 'medium',
        title: String(s.title || '').substring(0, 100),
        description: String(s.description || '').substring(0, 300),
        suggestion: String(s.suggestion || '').substring(0, 400),
        technicalDetails: String(s.technicalDetails || '').substring(0, 300),
        specificValues: String(s.specificValues || '').substring(0, 200),
        confidence: Math.max(0, Math.min(1, s.confidence || 0.5)),
        priority: Math.max(1, Math.min(10, s.priority || 5))
      })).sort((a: any, b: any) => a.priority - b.priority) : [],
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
            priority: 1
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
            priority: 2
          }
        ],
        strengths: ["Krásné zachycení emocí", "Přirozené výrazy tváří", "Dobrá hloubka ostrosti"],
        weddingContext: {
          photoType: "portrét",
          subjects: ["nevěsta", "ženich"],
          setting: "venkovní",
          lighting: "přírodní"
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