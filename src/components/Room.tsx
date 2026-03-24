"use client";

import { ReactNode, useRef, useCallback, useState, useEffect } from "react";

interface RoomProps {
  children: ReactNode;
}

export default function Room({ children }: RoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const gyroActive = useRef(false);

  // Desktop: mouse-based parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (gyroActive.current) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: mx * 20, y: -my * 20 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (gyroActive.current) return;
    setTilt({ x: 0, y: 0 });
  }, []);

  // Mobile: gyroscope-based parallax
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta = e.beta ?? 0;   // front-back tilt (-180 to 180)
    const gamma = e.gamma ?? 0; // left-right tilt (-90 to 90)

    // Normalize: phone held upright (~beta 90), map tilt relative to that
    const x = Math.max(-20, Math.min(20, gamma * 0.9));
    const y = Math.max(-20, Math.min(20, (beta - 45) * 0.9));

    setTilt({ x, y });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Mouse events for desktop
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    // Try gyroscope for mobile
    const initGyro = async () => {
      // Check if DeviceOrientationEvent exists and needs permission (iOS)
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };

      if (typeof DOE.requestPermission === "function") {
        // iOS: need to request on user gesture — we'll set up a one-time tap listener
        const requestOnTap = async () => {
          try {
            const permission = await DOE.requestPermission!();
            if (permission === "granted") {
              gyroActive.current = true;
              window.addEventListener("deviceorientation", handleOrientation);
            }
          } catch {
            // Permission denied, fall back to touch
          }
          el.removeEventListener("click", requestOnTap);
        };
        el.addEventListener("click", requestOnTap, { once: true });
      } else if ("DeviceOrientationEvent" in window) {
        // Android / non-iOS: just listen
        const testHandler = (e: DeviceOrientationEvent) => {
          if (e.beta !== null || e.gamma !== null) {
            gyroActive.current = true;
          }
          window.removeEventListener("deviceorientation", testHandler);
        };
        window.addEventListener("deviceorientation", testHandler);
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    initGyro();

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleMouseMove, handleMouseLeave, handleOrientation]);

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
          className="room-bg-img"
        />
      </div>

      {/* Content — flat translate for parallax without breaking clicks */}
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
