"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true);
      setPrevPath(pathname);
      setProgress(15); // Start progress immediately

      // Smooth premium loading bar progression
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 40);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setProgress(100); // Complete
        const fadeTimer = setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 150);
        return () => clearTimeout(fadeTimer);
      }, 250);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [pathname, prevPath]);

  return (
    <>
      {/* Premium Top Progress Bar */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "3px",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #06b6d4, #14b8a6, #06b6d4)",
            backgroundSize: "200% 100%",
            zIndex: 99999,
            transition: "width 0.15s ease-out, opacity 0.15s ease-in-out",
            opacity: progress === 100 ? 0 : 1,
            pointerEvents: "none",
            boxShadow: "0 1px 8px rgba(6, 182, 212, 0.4)",
          }}
        />
      )}
      {children}
    </>
  );
}


