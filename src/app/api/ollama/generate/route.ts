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
        const { text } = await req.json();

        const token = process.env.GITHUB_TOKEN;
        const model = process.env.GITHUB_MODEL || "gpt-4o-mini";
        const endpoint = "https://models.inference.ai.azure.com/chat/completions";

        if (!token) {
            throw new Error("GITHUB_TOKEN saknas i serverns configuration.");
        }

        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `Skapa flashcards för följande text:\n\n${text.substring(0, 15000)}` }
                ],
                temperature: 0.3,
                response_format: { type: "json_object" }
            }),
            signal: AbortSignal.timeout(180000), // 3 minuter
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`GitHub Models status: ${res.status}. ${JSON.stringify(errorData)}`);
        }

        const data = await res.json();
        const resultString = data.choices[0].message.content;

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
