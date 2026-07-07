"use client";

import { useState, useCallback, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DodgeButtonProps {
  label: string;
  maxDodges: number;
  messages: string[];
  eyeImages: string[];
  onCaught: () => void;
}

export default function DodgeButton({
  label,
  maxDodges,
  messages,
  eyeImages,
  onCaught,
}: DodgeButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState(0);
  const [caught, setCaught] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [bubbleShift, setBubbleShift] = useState(0);

  const buttonRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dodgeCount = useRef(0);
  const currentOffset = useRef({ x: 0, y: 0 });
  const isCaught = useRef(false);
  const lastDodgeTime = useRef(0);
  const caughtAtTime = useRef(0);

  const clampSpeechBubble = useCallback(() => {
    if (stage <= 0 || !buttonRef.current || !bubbleRef.current) return;

    const viewportMargin = 12;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const bubbleWidth = bubbleRef.current.offsetWidth;
    const baseLeft = buttonRect.left + buttonRect.width * 0.6;
    const baseRight = baseLeft + bubbleWidth;
    const maxRight = window.innerWidth - viewportMargin;

    let nextShift = 0;

    if (baseLeft < viewportMargin) {
      nextShift = viewportMargin - baseLeft;
    } else if (baseRight > maxRight) {
      nextShift = maxRight - baseRight;
    }

    setBubbleShift((currentShift) =>
      Math.abs(currentShift - nextShift) < 0.5 ? currentShift : nextShift
    );
  }, [stage]);

  useLayoutEffect(() => {
    if (stage <= 0) return;

    const frameId = window.requestAnimationFrame(clampSpeechBubble);
    const settleTimerId = window.setTimeout(clampSpeechBubble, 300);
    window.addEventListener("resize", clampSpeechBubble);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimerId);
      window.removeEventListener("resize", clampSpeechBubble);
    };
  }, [stage, bubbleKey, offset.x, offset.y, clampSpeechBubble]);

  const dodge = useCallback(() => {
    if (isCaught.current || !buttonRef.current) return;

    const now = Date.now();
    if (now - lastDodgeTime.current < 150) return;
    lastDodgeTime.current = now;

    dodgeCount.current += 1;
    const count = dodgeCount.current;

    setStage(count);
    setBubbleKey((k) => k + 1);

    if (count >= maxDodges) {
      isCaught.current = true;
      caughtAtTime.current = now;
      currentOffset.current = { x: 0, y: 0 };
      setOffset({ x: 0, y: 0 });
      setCaught(true);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobileViewport = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)"
    ).matches;
    const cur = currentOffset.current;

    const homeLeft = rect.left - cur.x;
    const homeTop = rect.top - cur.y;
    const btnW = rect.width;
    const btnH = rect.height;

    const safeLeft = isMobileViewport ? 24 : 60;
    const safeRight = Math.max(
      safeLeft,
      vw - btnW - (isMobileViewport ? 24 : 180)
    );
    const safeTop = isMobileViewport ? 120 : 160;
    const safeBottom = Math.max(
      safeTop,
      vh - btnH - (isMobileViewport ? 80 : 60)
    );
    const minViewportSize = Math.min(vw, vh);
    const minTravelDistance = Math.min(
      isMobileViewport ? 180 : 140,
      Math.max(isMobileViewport ? 150 : 120, minViewportSize * 0.45)
    );
    const minHomeDistance = Math.min(
      isMobileViewport ? 160 : 120,
      Math.max(isMobileViewport ? 150 : 100, minViewportSize * 0.4)
    );

    const forbiddenLeft = vw * 0.2;
    const forbiddenRight = vw * 0.8;
    const forbiddenTop = vh * 0.2;
    const forbiddenBottom = vh * 0.8;

    let newX: number;
    let newY: number;
    let bestX = cur.x;
    let bestY = cur.y;
    let bestScore = -Infinity;
    let attempts = 0;

    do {
      const edge = Math.floor(Math.random() * 4);
      let targetX: number;
      let targetY: number;

      if (edge === 0) {
        targetX = safeLeft + Math.random() * (vw * 0.15);
        targetY = safeTop + Math.random() * (safeBottom - safeTop);
      } else if (edge === 1) {
        targetX = Math.min(safeRight, vw * 0.75 + Math.random() * (vw * 0.15));
        targetY = safeTop + Math.random() * (safeBottom - safeTop);
      } else if (edge === 2) {
        targetX = safeLeft + Math.random() * (safeRight - safeLeft);
        targetY = safeTop + Math.random() * (vh * 0.12);
      } else {
        targetX = safeLeft + Math.random() * (safeRight - safeLeft);
        targetY = Math.min(safeBottom, vh * 0.78 + Math.random() * (vh * 0.12));
      }

      newX = targetX - homeLeft;
      newY = targetY - homeTop;

      const minX = safeLeft - homeLeft;
      const maxX = safeRight - homeLeft;
      const minY = safeTop - homeTop;
      const maxY = safeBottom - homeTop;
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));

      const landX = homeLeft + newX;
      const landY = homeTop + newY;
      const inForbidden =
        landX + btnW > forbiddenLeft &&
        landX < forbiddenRight &&
        landY + btnH > forbiddenTop &&
        landY < forbiddenBottom;
      const travelDistance = Math.hypot(newX - cur.x, newY - cur.y);
      const homeDistance = Math.hypot(newX, newY);
      const score =
        travelDistance +
        homeDistance -
        (inForbidden ? minTravelDistance + minHomeDistance : 0);

      if (score > bestScore) {
        bestScore = score;
        bestX = newX;
        bestY = newY;
      }

      attempts++;
      if (
        !inForbidden &&
        travelDistance >= minTravelDistance &&
        homeDistance >= minHomeDistance
      ) {
        break;
      }
    } while (attempts < 30);

    if (attempts >= 30) {
      newX = bestX;
      newY = bestY;
    }

    currentOffset.current = { x: newX, y: newY };
    setOffset({ x: newX, y: newY });
  }, [maxDodges]);

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
    if (!isCaught.current) return;
    if (Date.now() - caughtAtTime.current < 350) return;
    onCaught();
  }, [onCaught]);

  return (
    <motion.div
      ref={buttonRef}
      className="relative z-50 cursor-pointer select-none"
      animate={{ x: offset.x, y: offset.y }}
      transition={{
        type: "spring",
        stiffness: caught ? 300 : Math.max(200, 500 - stage * 60),
        damping: caught ? 25 : 15 + stage * 2,
        mass: 1 + stage * 0.15,
      }}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onUpdate={clampSpeechBubble}
    >
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {stage > 0 && (
          <motion.div
            key={bubbleKey}
            className="absolute -top-8 left-[60%] whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div
              ref={bubbleRef}
              style={{ transform: `translateX(${bubbleShift}px)` }}
            >
              <div className="speech-bubble text-black text-xs md:text-sm font-bold text-center">
                {messages[stage - 1]}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyes */}
      <AnimatePresence>
        {stage > 0 && (
          <motion.div
            className="flex justify-center -mb-6"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <img
              src={eyeImages[Math.min(stage - 1, eyeImages.length - 1)]}
              alt=""
              className="w-24 h-16 md:w-32 md:h-20 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button text */}
      <span className="text-5xl md:text-7xl lg:text-8xl font-bold text-white block">
        {label}
      </span>
    </motion.div>
  );
}
