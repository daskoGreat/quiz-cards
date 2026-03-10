"use client";

import { BrainCircuit, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/Button";
import { SettingsModal } from "./SettingsModal";

export function Navbar() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-90 transition-opacity">
                        <BrainCircuit className="w-6 h-6" />
                        <span>Quiz<span className="text-foreground">Cards</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Inställningar"
                            title="Inställningar"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="w-5 h-5 text-muted hover:text-foreground" />
                        </Button>
                    </div>
                </div>
            </nav>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}
