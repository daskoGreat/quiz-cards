"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { BrainCircuit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveDeck, Deck, Card } from "@/lib/storage";
import { parseJsonResponse } from "@/lib/utils";

export default function GeneratePage() {
    const router = useRouter();
    const { settings, isLoaded } = useSettings();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        const text = sessionStorage.getItem("quizCards_text");
        if (!text) {
            router.push("/");
            return;
        }

        let isSubscribed = true;

        async function generateCards() {
            try {
                const res = await fetch("/api/ollama/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text,
                    }),
                });

                const data = await parseJsonResponse(res);
                if (!res.ok) {
                    throw new Error(data.error || "Okänt fel vid generering");
                }

                if (isSubscribed) {
                    // Process and save deck
                    const generatedCards = data.deck.cards || [];
                    const deck: Deck = {
                        id: crypto.randomUUID(),
                        title: data.deck.title || "Ny Quiz",
                        language: data.deck.language || "sv",
                        createdAt: Date.now(),
                        cards: generatedCards.map((c: any) => ({
                            ...c,
                            id: crypto.randomUUID(),
                            nextReviewDate: Date.now(),
                            interval: 0,
                            efactor: 2.5,
                        })),
                    };

                    await saveDeck(deck);
                    sessionStorage.setItem("quizCards_currentDeck", deck.id);
                    sessionStorage.removeItem("quizCards_text"); // Cleanup

                    router.push("/study");
                }
            } catch (err: any) {
                if (isSubscribed) {
                    setError(err.message || "Misslyckades att ansluta till AI-tjänsten. Kontrollera din anslutning.");
                }
            }
        }

        generateCards();

        return () => {
            isSubscribed = false;
        };
    }, [isLoaded, settings, router]);

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-[80vh]">
            <div className="w-full max-w-2xl mx-auto space-y-8 text-center animate-in fade-in duration-500">

                {!error ? (
                    <>
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]" />
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary animate-[spin_1.5s_ease-in-out_infinite]" />
                            <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                AI-motorn läser texten...
                            </h1>
                            <p className="text-muted text-lg">
                                Genererar smarta quiz cards. Det här kan ta någon minut.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 opacity-50 pointer-events-none">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card-base h-40 flex flex-col gap-3 animate-pulse">
                                    <div className="h-4 bg-muted/20 rounded w-1/3" />
                                    <div className="h-4 bg-muted/20 rounded w-full" />
                                    <div className="h-4 bg-muted/20 rounded w-5/6" />
                                    <div className="mt-auto h-8 bg-muted/20 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                                Något gick fel
                            </h1>
                            <p className="text-muted bg-surface border border-danger/20 rounded-lg p-4 max-w-md mx-auto">
                                {error}
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={() => router.push("/")}>
                                Avbryt
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Försök igen
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
