"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/lib/storage";
import { Lightbulb, Info, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

interface FlashcardProps {
    card: Card;
    onNext: (wasCorrect: boolean) => void;
    onEdit: () => void;
}

export function Flashcard({ card, onNext, onEdit }: FlashcardProps) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    // Reset state when card changes
    useEffect(() => {
        setSelectedIdx(null);
        setIsLocked(false);
    }, [card]);

    const handleSelect = (idx: number) => {
        if (isLocked) return;
        setSelectedIdx(idx);
    };

    const checkAnswer = () => {
        if (selectedIdx === null) return;
        setIsLocked(true);
    };

    const handleNext = () => {
        const wasCorrect = selectedIdx === card.correctIndex;
        onNext(wasCorrect);
    };

    const isCorrect = selectedIdx === card.correctIndex;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-in fade-in duration-300">

            <div className="w-full bg-surface border border-border shadow-card rounded-2xl p-5 sm:p-10 flex flex-col mb-6">
                <div className="flex justify-between items-start mb-6 w-full">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Fråga
                    </span>
                    <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 text-muted hover:text-foreground">
                        Redigera
                    </Button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-8">
                    {card.question}
                </h2>

                <div className="w-full space-y-3">
                    {card.options?.map((opt, idx) => {
                        const isSelected = selectedIdx === idx;
                        const isCorrectOption = idx === card.correctIndex;

                        let btnClass = "bg-background border-border hover:border-primary/50 hover:bg-primary/5 text-foreground";

                        if (isLocked) {
                            if (isCorrectOption) {
                                btnClass = "bg-success/10 border-success/50 text-success-foreground ring-1 ring-success/50";
                            } else if (isSelected && !isCorrectOption) {
                                btnClass = "bg-danger/10 border-danger/50 text-danger-foreground opacity-80";
                            } else {
                                btnClass = "bg-background border-border opacity-50";
                            }
                        } else if (isSelected) {
                            btnClass = "bg-primary/10 border-primary ring-1 ring-primary text-foreground";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={cn(
                                    "w-full text-left border rounded-xl p-4 text-base font-medium transition-all duration-200 flex items-center justify-between group",
                                    btnClass,
                                    !isLocked && "cursor-pointer"
                                )}
                                disabled={isLocked}
                            >
                                <span>{opt}</span>

                                {/* Visual indicator for radio-like feel */}
                                {!isLocked && (
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ml-4",
                                        isSelected ? "border-primary" : "border-muted/30 group-hover:border-primary/50"
                                    )}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-in zoom-in-50" />}
                                    </div>
                                )}

                                {/* Status indicator after lock */}
                                {isLocked && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-success shrink-0 ml-4 animate-in zoom-in-50" />}
                                {isLocked && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-danger shrink-0 ml-4 animate-in zoom-in-50" />}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Section (Shown after checking) */}
                {isLocked && (
                    <div className="mt-8 animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                        <div className={cn(
                            "flex items-center gap-2 text-lg font-bold",
                            isCorrect ? "text-success" : "text-danger"
                        )}>
                            {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            {isCorrect ? "Rätt svar!" : "Fel svar!"}
                        </div>

                        {card.explanation && (
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-primary-hover">
                                <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium leading-relaxed">{card.explanation}</p>
                            </div>
                        )}

                        {card.sourceSnippet && (
                            <div className="bg-background rounded-xl p-4 flex gap-3 text-muted border border-border/50">
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider">Källa i dokumentet</p>
                                    <p className="text-sm font-serif italic border-l-2 border-muted/30 pl-3 py-1">"{card.sourceSnippet}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex justify-end">
                {!isLocked ? (
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto px-8"
                        disabled={selectedIdx === null}
                        onClick={checkAnswer}
                    >
                        Kontrollera svar
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto px-8 group"
                        onClick={handleNext}
                    >
                        Nästa fråga
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </div>

        </div>
    );
}
