import type { Task } from "@/lib/types";

export const RESET_TYPE_CONFIG: Record<
  Task["resetType"],
  { label: string; badgeCls: string; help: string }
> = {
  reversible: {
    label: "Reversible",
    badgeCls:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    help: "Higher yield — environment returns to start state naturally; no manual reset needed.",
  },
  reset_free: {
    label: "Reset-free",
    badgeCls:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    help: "Higher yield — episodes chain continuously from end state; no reset needed.",
  },
  reset: {
    label: "Reset",
    badgeCls:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300",
    help: "Lower yield — environment must be manually reset between every episode.",
  },
};
