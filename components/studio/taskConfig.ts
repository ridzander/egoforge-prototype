import type { Task } from "@/lib/types";

export const RESET_TYPE_CONFIG: Record<
  Task["resetType"],
  { label: string; badgeCls: string; help: string }
> = {
  reversible: {
    label: "Reversible",
    badgeCls: "border-border bg-secondary text-foreground font-mono",
    help: "Higher yield — environment returns to start state naturally; no manual reset needed.",
  },
  reset_free: {
    label: "Reset-free",
    badgeCls: "border-primary/40 bg-primary/10 text-primary font-mono",
    help: "Higher yield — episodes chain continuously from end state; no reset needed.",
  },
  reset: {
    label: "Reset",
    badgeCls: "border-amber-700/50 bg-amber-900/20 text-amber-400 font-mono",
    help: "Lower yield — environment must be manually reset between every episode.",
  },
};
