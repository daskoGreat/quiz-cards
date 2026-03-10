# Quiz Cards 🧠

En webbapp för högstadieelever som förvandlar vilket dokument som helst (PDF, DOCX, TXT, MD) till anpassade quiz cards (flashcards) för att plugga, direkt och lokalt via Ollama.

## Funktioner
- Skapa Flashcards: Automatisk extraktion av text från dokument och generering av 3 typer av kort (Begrepp, Flerval, Sant/Falskt).
- Lokal & Trygg AI: All generering sker lokalt på din dator via Ollama. Din data lämnar aldrig din maskin.
- Spaced Repetition: Appen lär sig vad du kan och vad du behöver träna mer på, med en inbyggd studiemotor.
- Redigera & Exportera: Ändra kort som inte blev perfekta, och exportera hela kortlekar som JSON.

## Kom igång

### 1. Installera och starta Ollama
Eftersom appen körs lokalt behöver du ha [Ollama](https://ollama.com) installerat på din dator.
När det är installerat, ladda ner en bra svensktalande modell i din terminal:

```bash
ollama run llama3.1
```
Låt sedan Ollama vara igång i bakgrunden.

### 2. Starta appen
Installera beroenden och starta servern:

```bash
npm install
npm run dev
```

Appen finns nu tillgänglig på [http://localhost:3000](http://localhost:3000).

### 3. Konfigurera (Valfritt)
Klicka på kugghjulet (Inställningar) uppe i högra hörnet i appen för att verifiera att den har kontakt med din lokala Ollama-instans och för att välja vilken modell du vill använda.

## Testa direkt!
I mappen `demo/` finns det några exempeldokument som du kan dra rakt in i appen för att testa hur det fungerar.

### Systemkrav
- Node.js 18+
- Ollama
- (Next.js App Router, Tailwind v4, React 19)
