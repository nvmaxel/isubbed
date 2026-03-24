"use client";

import { ReactNode, useRef, useCallback, useState, useEffect } from "react";

interface RoomProps {
  children: ReactNode;
}

export default function Room({ children }: RoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Map mouse position to -1...1 range
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: mx * 20, y: -my * 20 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Room background image — tilts with 3D rotation */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          pointerEvents: "none",
          overflow: "hidden",
          transformStyle: "preserve-3d",
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(-60px) scale(1.05)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <img
          src="/assets/room.avif"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Content — tilts more for foreground parallax separation */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 z-10"
        style={{
          transform: `translate(${tilt.x * 0.6}px, ${-tilt.y * 0.6}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
