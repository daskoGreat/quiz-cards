import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Du är en pedagogisk och peppande lärare för högstadieelever (13-16 år).
Din uppgift är att läsa elevens text och skapa ett detaljerat och lärorikt flervalsquiz (Multiple Choice Quiz).
Skriv på svenska om inte texten är på engelska. Tonen ska vara tydlig, uppmuntrande men inte barnslig. Inga magi-påståenden.

Du MÅSTE svara EXAKT enligt detta JSON-schema:
{
  "title": "En passande titel på kortleken",
  "language": "sv",
  "cards": [
    {
      "type": "mcq",
      "difficulty": 1, // 1 (lätt), 2 (medel), 3 (svårt)
      "question": "Frågan",
      "answer": "Det rätta svarsalternativet",
      "explanation": "En kort förklaring varför detta är rätt",
      "options": ["alt 1", "alt 2", "alt 3", "alt 4"], // Du måste alltid ge exakt 4 svarsalternativ. Ett rätt och tre felaktiga (men rimliga).
      "correctIndex": 0, // Indexet för det rätta alternativet i listan ovan (0, 1, 2 eller 3)
      "sourceSnippet": "Exakt citat från texten som bevisar svaret"
    }
  ]
}

Skapa upp till 10 kort. ALLA kort måste vara av typen "mcq" och ha exakt 4 svarsalternativ.
ALLTID returnera en GILTIG JSON. Inget tacksnack eller förklaringar utanför JSON-objektet.
`;

function repairJson(brokenJson: string): string {
    const match = brokenJson.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (match) return match[1];

    const braceMatch = brokenJson.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];

    return brokenJson;
}

export async function POST(req: NextRequest) {
    try {
        const { text, ollamaUrl, model } = await req.json();
        const url = ollamaUrl || "http://localhost:11434";
        const selectedModel = model || "llama3.1";

        const res = await fetch(`${url}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: selectedModel,
                prompt: `Skapa flashcards för följande text:\n\n${text.substring(0, 15000)}`, // limit text len basic
                system: SYSTEM_PROMPT,
                stream: false,
                format: "json", // Help Ollama stay structured
                options: {
                    temperature: 0.3,
                }
            }),
            signal: AbortSignal.timeout(180000), // 3 minuter
        });

        if (!res.ok) {
            throw new Error(`Ollama status: ${res.status}`);
        }

        const data = await res.json();
        const resultString = data.response;

        let parsedCards = null;
        try {
            parsedCards = JSON.parse(resultString);
        } catch {
            try {
                const repaired = repairJson(resultString);
                parsedCards = JSON.parse(repaired);
            } catch (e) {
                throw new Error("Kunde inte läsa resultatet från AI. Svaret var inte giltig JSON.");
            }
        }

        return NextResponse.json({ success: true, deck: parsedCards });
    } catch (error: any) {
        console.error("Generate API Error:", error.message);
        return NextResponse.json(
            { error: "Misslyckades att generera kort. " + error.message },
            { status: 500 }
        );
    }
}
