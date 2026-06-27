"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetPrompt({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-800/60 bg-amber-900/20 p-4">
      <div className="flex items-center gap-3">
        <RotateCcw className="size-4 shrink-0 text-amber-400" />
        <p className="font-mono text-xs text-amber-200">
          Return objects to start before the next episode.
        </p>
      </div>
      <Button size="sm" onClick={onDone} className="shrink-0">
        Done, next
      </Button>
    </div>
  );
}
