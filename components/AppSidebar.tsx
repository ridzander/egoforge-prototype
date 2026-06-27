"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Video, Database, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/studio",  label: "Studio",  icon: Layers   },
  { href: "/capture", label: "Capture", icon: Video    },
  { href: "/egodb",   label: "EgoDB",   icon: Database },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-12 shrink-0 flex-col border-r bg-muted/40 sm:w-52">
      {/* Wordmark — icon only on mobile */}
      <div className="flex h-14 items-center gap-2 border-b px-3 sm:px-4">
        <Cpu className="size-4 shrink-0 text-primary" />
        <span className="hidden text-sm font-semibold tracking-tight sm:block">
          EgoForge
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-1.5 sm:p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
