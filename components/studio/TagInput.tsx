"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter…",
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className
      )}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-0.5 py-0 pr-0.5 pl-2 font-normal"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-2.5" />
          </button>
        </Badge>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
