import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Ingen fil uppladdad." }, { status: 400 });
        }

        // Keep in sync with MAX_FILE_SIZE_MB in src/components/Dropzone.tsx.
        // Vercel rejects larger request bodies itself before this code runs,
        // with a non-JSON response, so this must stay at or below ~4.5MB.
        if (file.size > 4 * 1024 * 1024) {
            return NextResponse.json({ error: "Filen är för stor. Max 4MB." }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = "";

        const mimeType = file.type;
        const name = file.name.toLowerCase();

        console.log(`Extracting file: ${name}, type: ${mimeType}, size: ${file.size}`);

        if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
            // pdf2json requires parsing through an event emitter
            const PDFParser = require("pdf2json");
            const pdfParser = new PDFParser(null, 1);

            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            name.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer: buffer });
            text = result.value;
        } else if (name.endsWith(".txt") || name.endsWith(".md") || mimeType.startsWith("text/")) {
            text = buffer.toString("utf-8");
        } else {
            console.error(`Unsupported file type: ${mimeType} for file ${name}`);
            return NextResponse.json({ error: "Ogiltig filtyp. Använd PDF, DOCX, TXT eller MD." }, { status: 400 });
        }

        if (!text || text.trim().length === 0) {
            console.error("Text was empty after extraction");
            return NextResponse.json({ error: "Kunde inte hitta någon text i dokumentet." }, { status: 400 });
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error("Extraction error:", error);
        return NextResponse.json({ error: `Gick inte att extrahera text från filen: ${error.message}` }, { status: 500 });
    }
}
