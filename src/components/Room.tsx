"use client";

import { ReactNode } from "react";
import Atropos from "atropos/react";
import "atropos/css";

interface RoomProps {
  children: ReactNode;
}

export default function Room({ children }: RoomProps) {
  return (
    <Atropos
      className="w-full h-full"
      innerClassName="w-full h-full"
      rotateXMax={4}
      rotateYMax={4}
      shadow={false}
      highlight={false}
      rotateTouch={false}
    >
      {/* Room background image — deepest parallax layer */}
      <div
        data-atropos-offset="-5"
        style={{
          position: "absolute",
          inset: "-10%",
          pointerEvents: "none",
          overflow: "hidden",
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

      {/* Content — foreground layer */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 z-10"
        data-atropos-offset="5"
      >
        {children}
      </div>
    </Atropos>
  );
}
