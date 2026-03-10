"use client";

import { UploadCloud, FileType2 } from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    isLoading?: boolean;
}

export function Dropzone({ onFileSelect, isLoading }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (isLoading) return;

            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length > 0) {
                onFileSelect(droppedFiles[0]);
            }
        },
        [isLoading, onFileSelect]
    );

    const handleClick = () => {
        if (isLoading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "bg-surface border-2 border-dashed rounded-2xl p-12 text-center transition-all bg-white cursor-pointer flex flex-col items-center justify-center space-y-4 relative overflow-hidden group shadow-sm",
                isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-background/50",
                isLoading && "pointer-events-none opacity-50"
            )}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
            />

            <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors",
                isDragging ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
            )}>
                <UploadCloud className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
                {isDragging ? "Släpp dokumentet här!" : "Dra in ett dokument här eller klicka för att ladda upp"}
            </h2>

            <p className="text-sm text-muted max-w-sm">
                Stödjer PDF, DOCX, TXT och MD. Max filstorlek: 25MB.
            </p>

            <div className="mt-4 text-xs font-medium text-muted bg-background px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-border">
                <FileType2 className="w-3.5 h-3.5" />
                Dokumentet lämnar aldrig din dator
            </div>
        </div>
    );
}
