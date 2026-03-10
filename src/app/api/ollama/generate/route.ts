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
      "options": ["alternativ A", "alternativ B", "DET RÄTTA SVARET", "alternativ D"], // Alltid 4 alternativ. Se till att variera vilket index som är det rätta!
      "correctIndex": 2, // Indexet för det rätta alternativet i listan ovan (0, 1, 2 eller 3)
      "sourceSnippet": "Exakt citat från texten som bevisar svaret"
    }
  ]
}

Skapa upp till 10 kort. ALLA kort måste vara av typen "mcq" och ha exakt 4 svarsalternativ.
VIKTIGT: Placera INTE alltid det rätta svaret på första plats (index 0). Variera positionen slumpmässigt för varje fråga.
ALLTID returnera en GILTIG JSON. Inget tacksnack eller förklaringar utanför JSON-objektet.
`;

function shuffleOptions(card: any) {
    if (!card.options || !Array.isArray(card.options)) return card;

    const options = [...card.options];
    const correctAnswer = card.answer;

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    // Find new index of the correct answer
    const newCorrectIndex = options.indexOf(correctAnswer);

    // If for some reason the answer string wasn't in options, or multiple matches,
    // we fallback to the AI's provided correctIndex if it still points to the right text
    // but usually index calculation based on text is safer after a shuffle.

    return {
        ...card,
        id: crypto.randomUUID(),
        options,
        correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : card.correctIndex
    };
}

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
        // Strip 'openai/' prefix if it exists to prevent 'unknown model' errors
        const rawModel = process.env.GITHUB_MODEL || "gpt-4o-mini";
        const model = rawModel.replace(/^openai\//, "");
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

        if (parsedCards && Array.isArray(parsedCards.cards)) {
            parsedCards.cards = parsedCards.cards.map((card: any) => shuffleOptions(card));
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
