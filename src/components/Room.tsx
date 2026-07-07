"use client";

import {
  ReactNode,
  useRef,
  useCallback,
  useState,
  useEffect,
  useSyncExternalStore,
} from "react";

interface RoomProps {
  children: ReactNode;
}

const mobileQuery = "(max-width: 768px), (pointer: coarse)";

const getMobileSnapshot = () =>
  typeof window !== "undefined" && window.matchMedia(mobileQuery).matches;

const getServerMobileSnapshot = () => false;

type LegacyMediaQueryList = MediaQueryList & {
  addListener: (listener: () => void) => void;
  removeListener: (listener: () => void) => void;
};

const subscribeToMobileChanges = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia(mobileQuery);
  const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onStoreChange);
  } else {
    legacyMediaQuery.addListener(onStoreChange);
  }

  return () => {
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", onStoreChange);
    } else {
      legacyMediaQuery.removeListener(onStoreChange);
    }
  };
};

export default function Room({ children }: RoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isMobile = useSyncExternalStore(
    subscribeToMobileChanges,
    getMobileSnapshot,
    getServerMobileSnapshot
  );
  const activeTilt = isMobile ? { x: 0, y: 0 } : tilt;

  // Desktop: mouse-based parallax
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return;

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: mx * 20, y: -my * 20 });
    },
    [isMobile]
  );

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    setTilt({ x: 0, y: 0 });
  }, [isMobile]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isMobile) return;

    // Mouse events for desktop
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile, handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: isMobile ? "none" : "1200px" }}
    >
      {/* Room background image — tilts with 3D rotation */}
      <div
        style={{
          position: "absolute",
          inset: isMobile ? "-40%" : "-10%",
          pointerEvents: "none",
          overflow: "hidden",
          transformStyle: isMobile ? "flat" : "preserve-3d",
          transform: isMobile
            ? "translateZ(0) scale(1.4)"
            : `rotateY(${activeTilt.x}deg) rotateX(${activeTilt.y}deg) translateZ(-60px) scale(1.15)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <img
          src="/assets/isubbed-bg.png"
          alt=""
          className="room-bg-img"
        />
      </div>

      {/* Content — flat translate for parallax without breaking clicks */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 z-10"
        style={{
          transform: `translate(${activeTilt.x * 0.6}px, ${-activeTilt.y * 0.6}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
