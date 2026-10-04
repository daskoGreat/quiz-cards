import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Du är en pedagogisk och peppande lärare för svenska högstadieelever (13-16 år).
Din uppgift är att skapa ett flervalsquiz (Multiple Choice Quiz) baserat på den text du får.

REGLER FÖR FRÅGOR:
1. Använd svenska. Språket ska vara tydligt och anpassat för åldersgruppen.
2. Skapa så många meningsfulla frågor som möjligt från texten. Fokusera på begrepp, fakta och samband.
3. Varje fråga MÅSTE ha exakt 4 svarsalternativ.
4. EXAKT ETT av alternativen måste vara korrekt.
5. De felaktiga svaren (distraktorer) ska vara rimliga men tydligt felaktiga för någon som läst texten.
6. Förklaringen ska vara pedagogisk och hjälpa eleven att förstå VARFÖR svaret är rätt, inte bara bekräfta det.
7. Frågorna ska vara korta och kärnfulla.

DU MÅSTE SVARA EXAKT ENLIGT DETTA JSON-SCHEMA:
{
  "title": "En passande titel på quizet",
    "language": "sv",
      "cards": [
          {
                "question": "Frågan",
                      "options": ["alternativ A", "alternativ B", "alternativ C", "alternativ D"],
                            "answer": "Det exakta textinnehållet för det rätta svaret (måste finnas i options)",
                                  "explanation": "En pedagogisk förklaring",
                                        "topic": "Ämnesområde",
                                              "difficulty": 1 // 1-3
                                                  }
                                                    ]
                                                    }

                                                    VIKTIGT:
                                                    - Returnera ENDAST giltig JSON.
                                                    - Se till att 'answer' matchar exakt ett av elementen i 'options'.
                                                    - Variera ordningen på alternativen i JSON-outputen så att det rätta svaret inte alltid kommer först.
                                                    `;

function splitTextIntoChunks(text: string, maxChunkSize: number = 2500): string[] {
    const chunks: string[] = [];
    let currentPos = 0;

  while (currentPos < text.length) {
        let endPos = Math.min(currentPos + maxChunkSize, text.length);

      // Try to find a good breaking point (period or newline)
      if (endPos < text.length) {
              const lastPeriod = text.lastIndexOf(".", endPos);
              const lastNewline = text.lastIndexOf("\n", endPos);
              const breakpoint = Math.max(lastPeriod, lastNewline);

          if (breakpoint > currentPos + maxChunkSize * 0.5) {
                    endPos = breakpoint + 1;
          }
      }

      chunks.push(text.substring(currentPos, endPos).trim());
        currentPos = endPos;
  }

  return chunks.filter(c => c.length > 100); // Ignore very small chunks
}

function validateCard(card: any): boolean {
    if (!card.question || !Array.isArray(card.options) || card.options.length !== 4) return false;
    if (!card.answer || !card.explanation) return false;

  const uniqueOptions = new Set(card.options);
    if (uniqueOptions.size !== 4) return false;

  if (!card.options.includes(card.answer)) return false;

  return true;
}

function shuffleCard(card: any) {
    const options = [...card.options];

  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
  }

  const newCorrectIndex = options.indexOf(card.answer);

  return {
        ...card,
        id: crypto.randomUUID(),
        options,
        correctIndex: newCorrectIndex,
        type: "mcq" // Ensure backward compatibility with UI if it expects 'type'
  };
}

function repairJson(brokenJson: string): string {
    const match = brokenJson.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (match) return match[1];

  const braceMatch = brokenJson.match(/\{[\s\S]*\}/);
    if (braceMatch) return braceMatch[0];

  return brokenJson;
}

async function generateWithRetry(chunk: string, model: string, token: string, endpoint: string, retries = 2): Promise<any[]> {
    for (let i = 0; i <= retries; i++) {
          try {
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
                                          { role: "user", content: `Skapa så många unika quizfrågor som möjligt för följande text:\n\n${chunk}` }
                                                    ],
                                        temperature: 0.3,
                                        response_format: { type: "json_object" }
                            }),
                            signal: AbortSignal.timeout(60000), // 1 minute per chunk
                  });

            if (!res.ok) { console.warn(`Gateway HTTP ${res.status} for chunk:`, await res.text()); continue; }

            const data = await res.json();
                  const content = data.choices[0].message.content;
                  let parsed = JSON.parse(repairJson(content));

            if (parsed && Array.isArray(parsed.cards)) {
                      return parsed.cards.filter(validateCard).map(shuffleCard);
            }
          } catch (e) {
                  console.warn(`Retry ${i} failed for chunk:`, e);
          }
    }
    return [];
}

export async function POST(req: NextRequest) {
    try {
          const { text } = await req.json();

      // GitHub Models (models.inference.ai.azure.com) retired 2026-07-30.
      // Using Groq instead - free tier, no credit card required.
      const token = process.env.GROQ_API_KEY;
          const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
          const endpoint = "https://api.groq.com/openai/v1/chat/completions";

      if (!token) {
              throw new Error("GROQ_API_KEY saknas i serverns konfiguration.");
      }

      const chunks = splitTextIntoChunks(text);
          console.log(`Processing document in ${chunks.length} chunks`);

      // Limit maximum chunks to avoid extreme runtimes/costs
      const limitedChunks = chunks.slice(0, 10);

      let allCards: any[] = [];
          let deckTitle = "Genererat Quiz";

      // Process chunks (can be concurrent, but let's be safe with rate limits)
      const chunkResults = await Promise.all(
              limitedChunks.map(chunk => generateWithRetry(chunk, model, token, endpoint))
            );

      chunkResults.forEach((cards) => {
              allCards = [...allCards, ...cards];
      });

      // Deduplicate based on question text
      const seenQuestions = new Set();
          const uniqueCards = allCards.filter(card => {
                  const normalized = card.question.toLowerCase().trim();
                  if (seenQuestions.has(normalized)) return false;
                  seenQuestions.add(normalized);
                  return true;
          });

      const finalDeck = {
              title: deckTitle,
              language: "sv",
              total_questions: uniqueCards.length,
              cards: uniqueCards
      };

      console.log(`Generated ${uniqueCards.length} unique cards from ${chunks.length} chunks`);

      return NextResponse.json({ success: true, deck: finalDeck });
    } catch (error: any) {
          console.error("Generate API Error:", error.message);
          return NextResponse.json(
            { error: "Misslyckades att generera kort. " + error.message },
            { status: 500 }
                );
    }
}
