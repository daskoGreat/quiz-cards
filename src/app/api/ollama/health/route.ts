import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { ollamaUrl } = await req.json();
        const url = ollamaUrl || "http://localhost:11434";

        const res = await fetch(`${url}/api/tags`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            throw new Error(`Ollama returned status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({ status: "ok", models: data.models });
    } catch (err: any) {
        console.error("Ollama Health Error:", err.message);
        return NextResponse.json(
            { error: "Ollama svarar inte. Starta Ollama på din dator och kolla så din Base URL stämmer." },
            { status: 503 }
        );
    }
}
