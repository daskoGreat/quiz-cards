"use client";

import { useState, useEffect } from "react";

export interface Settings {
    ollamaUrl: string;
    model: string;
}

const DEFAULT_SETTINGS: Settings = {
    ollamaUrl: "http://localhost:11434",
    model: "llama3:latest",
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("quizCards_settings");
            if (stored) {
                setSettings(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem("quizCards_settings", JSON.stringify(updated));
            return updated;
        });
    };

    return { settings, updateSettings, isLoaded };
}
