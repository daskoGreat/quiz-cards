import { useState, useEffect } from "react";
import { Card } from "@/lib/storage";
import { X, Lock } from "lucide-react";
import { Button } from "./ui/Button";

interface EditModalProps {
    card: Card | null;
    onClose: () => void;
    onSave: (updated: Card) => void;
}

export function EditModal({ card, onClose, onSave }: EditModalProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [explanation, setExplanation] = useState("");
    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        if (card) {
            setQuestion(card.question || "");
            setAnswer(card.answer || "");
            setExplanation(card.explanation || "");
            setOptions(card.options || []);
        }
    }, [card]);

    if (!card) return null;

    const handleOptionChange = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        setOptions(newOpts);
    };

    const handleSave = () => {
        onSave({
            ...card,
            question,
            answer,
            explanation,
            options,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface border border-border shadow-card-hover rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">

                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Redigera Kort</h2>
                        <p className="text-sm text-muted">Ändra formuleringarna så de passar dig bättre.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-muted/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Fråga</label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full text-foreground bg-background border border-border rounded-lg p-3 min-h-[80px] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Svar</label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full text-foreground bg-background border border-border rounded-lg p-3 min-h-[80px] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {card.type === "mcq" && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Svarsalternativ</label>
                            {options.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="w-full text-foreground bg-background border border-border rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            ))}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Förklaring</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="w-full text-foreground bg-background border border-border rounded-lg p-3 min-h-[100px] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {card.sourceSnippet && (
                        <div className="space-y-1.5 pt-4 border-t border-border">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted">
                                <Lock className="w-4 h-4" />
                                Källmaterial (Låst)
                            </div>
                            <p className="text-sm text-muted bg-muted/10 p-3 rounded-lg italic">
                                "{card.sourceSnippet}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border flex flex-col sm:flex-row justify-end gap-3 shrink-0 bg-surface/50 rounded-b-2xl">
                    <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">Avbryt</Button>
                    <Button variant="primary" onClick={handleSave} className="w-full sm:w-auto order-1 sm:order-2">Spara ändringar</Button>
                </div>

            </div>
        </div>
    );
}
