import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Vercel's serverless functions hard-reject request/response bodies over ~4.5MB
// with a plain-text "Request Entity Too Large" (or a timeout page) before our
// route handlers ever run, so res.json() throws on that non-JSON body instead
// of the error we meant to show. Parse defensively and fall back to a message
// that explains what actually happened.
export async function parseJsonResponse(res: Response): Promise<any> {
    const raw = await res.text();
    try {
        return JSON.parse(raw);
    } catch {
        if (res.status === 413) {
            throw new Error("Filen/datan är för stor för servern att hantera. Prova med en mindre fil.");
        }
        if (res.status === 504 || res.status === 408) {
            throw new Error("Förfrågan tog för lång tid och avbröts av servern. Prova med en mindre fil eller text.");
        }
        throw new Error(`Servern svarade oväntat (HTTP ${res.status}). Försök igen om en stund.`);
    }
}
