"use client";

import { useEffect, useState } from "react";
import { getAllDecks, deleteDeck, Deck } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { BookOpen, Download, Trash2, Calendar } from "lucide-react";

export function SavedDecks() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const router = useRouter();

    const load = async () => setDecks(await getAllDecks());
    useEffect(() => { load() }, []);

    const handleStudy = (id: string) => {
        sessionStorage.setItem("quizCards_currentDeck", id);
        router.push("/study");
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Är du säker på att du vill ta bort detta quiz?")) {
            await deleteDeck(id);
            load();
        }
    };

    const handleExport = (e: React.MouseEvent, deck: Deck) => {
        e.stopPropagation();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `${deck.title}.json`);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        dlAnchorElem.remove();
    };

    if (decks.length === 0) return null;

    return (
        <section className="pt-8 border-t border-border animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Dina sparade Quiz
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {decks.map(deck => (
                    <div
                        key={deck.id}
                        onClick={() => handleStudy(deck.id)}
                        className="bg-surface border border-border rounded-xl p-4 flex flex-col cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all shadow-sm group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-foreground line-clamp-1">{deck.title}</h3>
                            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-7 sm:w-7 p-0" onClick={(e) => handleExport(e, deck)} title="Exportera som JSON">
                                    <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-danger hover:bg-danger/10 hover:text-danger" onClick={(e) => handleDelete(e, deck.id)} title="Ta bort">
                                    <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-muted font-medium bg-background px-3 py-1.5 rounded-lg border border-border border-dashed">
                            <span>{deck.cards.length} kort</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(deck.createdAt).toLocaleDateString("sv-SE")}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
