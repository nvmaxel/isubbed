"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DodgeButtonProps {
  onCaught: () => void;
}

const MAX_DODGES = 4;

const SPEECH_BUBBLES = [
  "nice try",
  "not gonna happen",
  "seriously??",
  "fine... you win",
];

export default function DodgeButton({ onCaught }: DodgeButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState(0); // 0 = initial, 1-4 = dodge stages
  const [caught, setCaught] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);

  const buttonRef = useRef<HTMLDivElement>(null);
  const dodgeCount = useRef(0);
  const currentOffset = useRef({ x: 0, y: 0 });
  const isCaught = useRef(false);
  const lastDodgeTime = useRef(0);

  const dodge = useCallback(() => {
    if (isCaught.current || !buttonRef.current) return;

    const now = Date.now();
    if (now - lastDodgeTime.current < 150) return;
    lastDodgeTime.current = now;

    dodgeCount.current += 1;
    const count = dodgeCount.current;

    // Update stage for eyes + speech bubble
    setStage(count);
    setBubbleKey((k) => k + 1);

    if (count >= MAX_DODGES) {
      // Give in — snap back, become clickable
      isCaught.current = true;
      currentOffset.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
      setCaught(true);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cur = currentOffset.current;

    const homeLeft = rect.left - cur.x;
    const homeTop = rect.top - cur.y;
    const btnW = rect.width;
    const btnH = rect.height;

    // Safe area: generous margins so eyes+bubble never clip
    const safeLeft = 60;
    const safeRight = vw - btnW - 180;
    const safeTop = 160;
    const safeBottom = vh - btnH - 60;

    // Forbidden zone: center area where question text + yes button live
    const forbiddenLeft = vw * 0.2;
    const forbiddenRight = vw * 0.8;
    const forbiddenTop = vh * 0.2;
    const forbiddenBottom = vh * 0.8;

    let newX: number;
    let newY: number;
    let attempts = 0;

    do {
      // Pick a random edge zone — all 4 sides equally weighted
      const edge = Math.floor(Math.random() * 4);
      let targetX: number;
      let targetY: number;

      if (edge === 0) {
        // Left strip
        targetX = safeLeft + Math.random() * (vw * 0.15);
        targetY = safeTop + Math.random() * (safeBottom - safeTop);
      } else if (edge === 1) {
        // Right strip
        targetX = Math.min(safeRight, vw * 0.75 + Math.random() * (vw * 0.15));
        targetY = safeTop + Math.random() * (safeBottom - safeTop);
      } else if (edge === 2) {
        // Top strip
        targetX = safeLeft + Math.random() * (safeRight - safeLeft);
        targetY = safeTop + Math.random() * (vh * 0.12);
      } else {
        // Bottom strip
        targetX = safeLeft + Math.random() * (safeRight - safeLeft);
        targetY = Math.min(safeBottom, vh * 0.78 + Math.random() * (vh * 0.12));
      }

      // Convert screen position to offset from home
      newX = targetX - homeLeft;
      newY = targetY - homeTop;

      // Check if this position lands in the forbidden center zone
      const landX = homeLeft + newX;
      const landY = homeTop + newY;
      const inForbidden =
        landX + btnW > forbiddenLeft &&
        landX < forbiddenRight &&
        landY + btnH > forbiddenTop &&
        landY < forbiddenBottom;

      attempts++;
      if (!inForbidden && Math.abs(newX - cur.x) + Math.abs(newY - cur.y) > 80) {
        break;
      }
    } while (attempts < 30);

    // Clamp to safe bounds
    const minX = safeLeft - homeLeft;
    const maxX = safeRight - homeLeft;
    const minY = safeTop - homeTop;
    const maxY = safeBottom - homeTop;
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    currentOffset.current = { x: newX, y: newY };
    setOffset({ x: newX, y: newY });
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!isCaught.current) dodge();
  }, [dodge]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isCaught.current) {
        e.preventDefault();
        dodge();
      }
    },
    [dodge]
  );

  const handleClick = useCallback(() => {
    if (isCaught.current) onCaught();
  }, [onCaught]);

  return (
    <motion.div
      ref={buttonRef}
      className="relative z-50 cursor-pointer select-none"
      animate={{ x: offset.x, y: offset.y }}
      transition={{
        type: "spring",
        stiffness: caught ? 300 : Math.max(200, 500 - dodgeCount.current * 60),
        damping: caught ? 25 : 15 + dodgeCount.current * 2,
        mass: 1 + dodgeCount.current * 0.15,
      }}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {stage > 0 && (
          <motion.div
            key={bubbleKey}
            className="absolute -top-14 left-[60%] whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="speech-bubble text-black text-xs md:text-sm font-bold uppercase text-center">
              {SPEECH_BUBBLES[stage - 1]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyes — appear after first dodge */}
      <AnimatePresence>
        {stage > 0 && (
          <motion.div
            className="flex justify-center -mb-6"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <img
              src={`/assets/${stage}.png`}
              alt=""
              className="w-24 h-16 md:w-32 md:h-20 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* "no" text */}
      <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white block">
        no
      </span>
    </motion.div>
  );
}
