"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropzone } from "@/components/Dropzone";
import { SavedDecks } from "@/components/SavedDecks";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ett okänt fel uppstod");

      sessionStorage.setItem("quizCards_text", data.text);
      sessionStorage.setItem("quizCards_filename", file.name);
      router.push("/preview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Förvandla dina anteckningar till <span className="text-primary">Quiz Cards</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Plugga smartare, inte hårdare. Ladda upp ett dokument så skapar vi flashcards med frågor och svar.
            Helt automatiskt och lokalt på din dator.
          </p>
        </header>

        <div className="space-y-4">
          <Dropzone onFileSelect={handleFileSelect} isLoading={isLoading} />
          {error && (
            <div className="p-4 rounded-xl bg-danger/10 text-danger text-sm font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        <SavedDecks />

        {/* How it works */}
        <section className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-border">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">1</div>
            <h3 className="text-lg font-semibold">Ladda upp</h3>
            <p className="text-muted text-sm leading-relaxed">Dra in dina anteckningar, kompendium eller instuderingsfrågor. Vi plockar ut texten åt dig.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">2</div>
            <h3 className="text-lg font-semibold">Generera</h3>
            <p className="text-muted text-sm leading-relaxed">Din lokala AI analyserar texten och bygger smarta kort med begrepp, flerval och sant/falskt.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">3</div>
            <h3 className="text-lg font-semibold">Plugga!</h3>
            <p className="text-muted text-sm leading-relaxed">Träna på korten, få feedback på hur det går, och redigera dem precis som du vill ha dem.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
