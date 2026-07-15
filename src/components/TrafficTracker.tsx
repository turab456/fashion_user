"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastLoggedPath = useRef<string>("");

  useEffect(() => {
    // Avoid double logging identical paths within same rendering cycles
    const queryStr = searchParams?.toString();
    const fullPath = pathname + (queryStr ? `?${queryStr}` : "");
    if (lastLoggedPath.current === fullPath) return;
    lastLoggedPath.current = fullPath;

    const logTraffic = async () => {
      try {
        await fetch("https://fashion-be-nfrg.onrender.com/api/v1/traffic/hit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            path: fullPath,
            referrer: typeof document !== "undefined" ? document.referrer : ""
          })
        });
      } catch (err) {
        console.error("Traffic tracking error:", err);
      }
    };

    const timeout = setTimeout(logTraffic, 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return null;
}

export default function TrafficTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
