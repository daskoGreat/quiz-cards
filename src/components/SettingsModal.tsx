"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";
import { useSettings } from "@/hooks/useSettings";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings, isLoaded } = useSettings();
    const [url, setUrl] = useState(settings.ollamaUrl);
    const [model, setModel] = useState(settings.model);
    const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    useEffect(() => {
        if (isLoaded) {
            setUrl(settings.ollamaUrl);
            setModel(settings.model);
        }
    }, [settings, isLoaded]);

    if (!isOpen) return null;

    const testConnection = async () => {
        setStatus("testing");
        setMessage("");
        try {
            const res = await fetch("/api/ollama/health", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ollamaUrl: url }),
            });
            const data = await res.json();

            if (res.ok && data.status === "ok") {
                setStatus("success");
                setMessage("Anslutning lyckades!");
                if (data.models) {
                    setAvailableModels(data.models.map((m: any) => m.name));
                }
            } else {
                setStatus("error");
                setMessage(data.error || "Oväntat fel.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Kunde inte ansluta till servern.");
        }
    };

    const handleSave = () => {
        updateSettings({ ollamaUrl: url, model });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-2xl shadow-card-hover w-full max-w-md p-6 flex flex-col space-y-6 relative slide-in-from-bottom-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
                    title="Stäng"
                >
                    <X className="w-5 h-5" />
                </button>

                <div>
                    <h2 className="text-xl font-semibold text-foreground">Inställningar</h2>
                    <p className="text-sm text-muted">Konfigurera din lokala Ollama-integration.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Ollama Base URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="http://localhost:11434"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Modellnamn</label>
                        {availableModels.length > 0 ? (
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            >
                                {availableModels.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="llama3.1"
                            />
                        )}
                        <p className="text-xs text-muted">Exempel: llama3.1, mistral, gemma</p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={testConnection} isLoading={status === "testing"}>
                            Testa anslutning
                        </Button>

                        {status === "success" && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                                <CheckCircle2 className="w-4 h-4" /> {message}
                            </div>
                        )}
                        {status === "error" && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-danger">
                                <AlertCircle className="w-4 h-4" /> {message}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">Avbryt</Button>
                    <Button variant="primary" onClick={handleSave} className="w-full sm:w-auto order-1 sm:order-2">Spara</Button>
                </div>
            </div>
        </div>
    );
}
