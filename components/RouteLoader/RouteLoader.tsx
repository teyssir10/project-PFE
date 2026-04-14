"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";

export default function RouteLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const handle = requestAnimationFrame(() => {
      setLoading(false);
    });

    return () => cancelAnimationFrame(handle);
  }, [pathname]);

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Spin size="large" />
    </div>
  ) : (
    children
  );
}

