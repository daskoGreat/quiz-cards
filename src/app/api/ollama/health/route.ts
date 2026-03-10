import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Since we are now using GitHub Models with server-side tokens,
        // we just check if the token is configured.
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json(
                { error: "GitHub API Token saknas. Kontakta administratören." },
                { status: 500 }
            );
        }

        return NextResponse.json({ status: "ok", message: "AI-motorn är redo." });
    } catch (err: any) {
        console.error("Health Error:", err.message);
        return NextResponse.json(
            { error: "Ett oväntat fel uppstod." },
            { status: 500 }
        );
    }
}
