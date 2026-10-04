import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
      try {
              // Uses Vercel AI Gateway (GitHub Models was retired 2026-07-30).
        const token = process.env.AI_GATEWAY_API_KEY;

        if (!token) {
                  return NextResponse.json(
                      { error: "AI_GATEWAY_API_KEY saknas. Kontakta administratören." },
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
