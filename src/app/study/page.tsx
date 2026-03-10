"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeck, saveDeck, Deck, Card } from "@/lib/storage";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/Button";
import { Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditModal } from "@/components/EditModal";

export default function StudyPage() {
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    useEffect(() => {
        const deckId = sessionStorage.getItem("quizCards_currentDeck");
        if (!deckId) {
            router.push("/");
            return;
        }

        async function load() {
            const d = await getDeck(deckId!);
            if (d) {
                // Filter to only mcq cards, just in case legacy concepts exist
                const mcqCards = d.cards.filter(c => c.type === "mcq" || c.options);
                setDeck({ ...d, cards: mcqCards });
            } else {
                router.push("/");
            }
        }
        load();
    }, [router]);

    if (!deck) return null;

    const currentCard = deck.cards[currentIndex];

    // Progress calculation based on total cards
    const progressPercent = deck.cards.length > 0
        ? Math.round((currentIndex / deck.cards.length) * 100)
        : 100;

    const handleNext = (wasCorrect: boolean) => {
        if (wasCorrect) setCorrectAnswers(prev => prev + 1);
        setCurrentIndex(prev => prev + 1);
    };

    const handleEditSave = async (updatedCard: Card) => {
        const updatedCards = deck.cards.map(c => c.id === updatedCard.id ? updatedCard : c);
        const updatedDeck = { ...deck, cards: updatedCards };
        setDeck(updatedDeck);
        await saveDeck(updatedDeck);
    };

    return (
        <>
            <main className="flex-1 flex flex-col pt-6 pb-12 px-4 sm:px-6 w-full max-w-4xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-muted hover:text-foreground font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Avsluta quizet
                    </Link>
                    <span className="text-sm font-bold text-foreground bg-surface border border-border px-3 py-1 rounded-full shadow-sm">
                        {deck.title}
                    </span>
                </div>

                {currentIndex < deck.cards.length ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="w-full max-w-2xl mx-auto mb-8">
                            <div className="flex justify-between text-xs font-bold text-muted mb-2 uppercase tracking-wide">
                                <span>Progress</span>
                                <span>{currentIndex} av {deck.cards.length}</span>
                            </div>
                            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {currentCard && (
                            <Flashcard
                                // Using key forces a fresh mount per card, avoiding stale state locks
                                key={currentCard.id}
                                card={currentCard}
                                onNext={handleNext}
                                onEdit={() => setEditingCard(currentCard)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
                            <Trophy className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-4">Bra jobbat!</h2>
                        <p className="text-muted max-w-md text-lg mx-auto mb-8">
                            Du fick {correctAnswers} rätt av {deck.cards.length} möjliga. Grym insats!
                        </p>

                        <div className="p-6 bg-surface border border-border rounded-2xl w-full max-w-sm mb-8 shadow-card">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-muted font-medium">Totalt antal rätt</span>
                                <span className="text-xl font-bold text-success">{Math.round((correctAnswers / deck.cards.length) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-success transition-all duration-1000 ease-out"
                                    style={{ width: `${(correctAnswers / deck.cards.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => router.push("/")} size="lg">
                                Tillbaka till start
                            </Button>
                            <Button variant="primary" onClick={() => {
                                setCurrentIndex(0);
                                setCorrectAnswers(0);
                            }} size="lg">
                                Försök igen
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <EditModal
                card={editingCard}
                onClose={() => setEditingCard(null)}
                onSave={handleEditSave}
            />
        </>
    );
}
