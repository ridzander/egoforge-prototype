"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

export function TaskPanel({ task }: { task: Task | undefined }) {
  if (!task?.instructions && !task?.exemplarUrl) return null;

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border p-3">
      {task.instructions && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {task.instructions}
        </p>
      )}
      {task.exemplarUrl && (
        <Button variant="outline" size="sm" className="self-start gap-1.5 text-xs" asChild>
          <a href={task.exemplarUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3" />
            Watch exemplar
          </a>
        </Button>
      )}
    </div>
  );
}
