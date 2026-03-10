"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ChevronLeft, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export default function PreviewPage() {
    const router = useRouter();
    const [text, setText] = useState("");
    const [filename, setFilename] = useState("");

    useEffect(() => {
        const storedText = sessionStorage.getItem("quizCards_text");
        const storedFile = sessionStorage.getItem("quizCards_filename");
        if (!storedText) {
            router.push("/");
        } else {
            setText(storedText);
            setFilename(storedFile || "dokument");
        }
    }, [router]);

    const handleGenerate = () => {
        // Save any edits back to session storage
        sessionStorage.setItem("quizCards_text", text);
        router.push("/generate");
    };

    if (!text) return null; // Wait for redirect if empty

    return (
        <main className="flex-1 flex flex-col p-6 sm:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/" className="inline-flex items-center text-sm text-muted hover:text-foreground mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Tillbaka till startsidan
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Förhandsgranskning</h1>
                    <p className="text-muted flex items-center gap-2 mt-2">
                        <FileText className="w-4 h-4" /> {filename}
                    </p>
                </div>

                <div className="hidden sm:block">
                    <Button onClick={handleGenerate} size="lg" className="shadow-primary/20 shadow-lg group">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Skapa quiz cards
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col flex-1 min-h-[500px] shadow-sm">
                <div className="bg-background border-b border-border px-4 py-3">
                    <p className="text-sm text-muted font-medium">Här är texten vi hittade i filen. Du kan redigera den och ta bort sånt som inte ska vara med (exempelvis sidhuvud eller referenser).</p>
                </div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 w-full bg-transparent p-6 outline-none resize-none font-sans text-foreground/90 leading-relaxed"
                    placeholder="Text från dokumentet hamnar här..."
                    spellCheck={false}
                />
            </div>

            <div className="mt-8 sm:hidden flex justify-center pb-8">
                <Button onClick={handleGenerate} size="lg" className="w-full shadow-primary/20 shadow-lg group">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Skapa quiz cards
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </main>
    );
}
