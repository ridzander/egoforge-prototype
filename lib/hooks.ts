"use client";

import { liveQuery } from "dexie";
import { useEffect, useState } from "react";

export function useLiveQuery<T>(
  querier: () => T | Promise<T>,
  deps: unknown[] = [],
  defaultValue?: T
): T | undefined {
  const [result, setResult] = useState<T | undefined>(defaultValue);

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: setResult,
      error: console.error,
    });
    return () => subscription.unsubscribe();
    // deps are caller-controlled; querier closes over them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
}
