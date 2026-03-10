import { get, set, del, keys } from "idb-keyval";

export interface Card {
    id: string; // generate with crypto.randomUUID()
    type: "concept" | "truefalse" | "mcq";
    difficulty: number;
    question: string;
    answer: string;
    explanation: string;
    options: string[];
    correctIndex: number;
    sourceSnippet: string;
    // Spaced repetition fields
    nextReviewDate?: number;
    interval?: number;
    efactor?: number;
}

export interface Deck {
    id: string;
    title: string;
    language: string;
    createdAt: number;
    cards: Card[];
}

export async function saveDeck(deck: Deck): Promise<void> {
    await set(`deck_${deck.id}`, deck);
}

export async function getDeck(id: string): Promise<Deck | undefined> {
    return await get(`deck_${id}`);
}

export async function getAllDecks(): Promise<Deck[]> {
    const allKeys = await keys();
    const deckKeys = allKeys.filter((k) => typeof k === "string" && k.startsWith("deck_"));
    const decks: Deck[] = [];
    for (const k of deckKeys) {
        const d = await get(k as string);
        if (d) decks.push(d);
    }
    return decks.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteDeck(id: string): Promise<void> {
    await del(`deck_${id}`);
}
