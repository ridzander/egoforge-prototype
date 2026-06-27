"use client";

import { useEffect } from "react";

export function HeroGlow() {
  useEffect(() => {
    const el = document.getElementById("hero-glow");
    if (!el) return;

    function onMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      el!.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0, 225, 171, 0.08) 0%, transparent 70%)`;
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      id="hero-glow"
      className="hero-glow pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
