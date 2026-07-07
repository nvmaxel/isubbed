"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DodgeButtonProps {
  label: string;
  maxDodges: number;
  messages: string[];
  eyeImages: string[];
  onCaught: () => void;
}

const estimateSpeechBubbleWidth = (message: string, isMobile: boolean) => {
  const approximateCharacterWidth = isMobile ? 7 : 8;
  const approximateHorizontalPadding = isMobile ? 32 : 38;

  return (
    message.length * approximateCharacterWidth + approximateHorizontalPadding
  );
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getVisualGroupBounds = (
  buttonRect: DOMRect,
  bubbleElement: HTMLDivElement | null,
  message: string,
  isMobile: boolean
) => {
  const estimatedBubbleWidth = estimateSpeechBubbleWidth(message, isMobile);
  const estimatedBubbleHeight = isMobile ? 34 : 38;
  const bubbleLeft = buttonRect.width * 0.6;
  const bubbleTop = -32;
  const bounds = {
    left: 0,
    top: 0,
    right: buttonRect.width,
    bottom: buttonRect.height,
  };

  if (bubbleElement) {
    const bubbleRect = bubbleElement.getBoundingClientRect();
    bounds.left = Math.min(bounds.left, bubbleRect.left - buttonRect.left);
    bounds.top = Math.min(bounds.top, bubbleRect.top - buttonRect.top);
    bounds.right = Math.max(bounds.right, bubbleRect.right - buttonRect.left);
    bounds.bottom = Math.max(
      bounds.bottom,
      bubbleRect.bottom - buttonRect.top
    );
  }

  bounds.top = Math.min(bounds.top, bubbleTop);
  bounds.right = Math.max(bounds.right, bubbleLeft + estimatedBubbleWidth);
  bounds.bottom = Math.max(bounds.bottom, bubbleTop + estimatedBubbleHeight);

  return bounds;
};

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

  const buttonRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const dodgeCount = useRef(0);
  const currentOffset = useRef({ x: 0, y: 0 });
  const isCaught = useRef(false);
  const lastDodgeTime = useRef(0);
  const caughtAtTime = useRef(0);

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
    const groupBounds = getVisualGroupBounds(
      rect,
      bubbleRef.current,
      messages[count - 1] ?? "",
      isMobileViewport
    );
    const viewportMargin = isMobileViewport ? 12 : 16;

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
    const groupMinX = viewportMargin - groupBounds.left - homeLeft;
    const groupMaxX = vw - viewportMargin - groupBounds.right - homeLeft;
    const groupMinY = viewportMargin - groupBounds.top - homeTop;
    const groupMaxY = vh - viewportMargin - groupBounds.bottom - homeTop;

    const groupOverflow = (x: number, y: number) => {
      const left = homeLeft + x + groupBounds.left;
      const right = homeLeft + x + groupBounds.right;
      const top = homeTop + y + groupBounds.top;
      const bottom = homeTop + y + groupBounds.bottom;

      return (
        Math.max(0, viewportMargin - left) +
        Math.max(0, right - (vw - viewportMargin)) +
        Math.max(0, viewportMargin - top) +
        Math.max(0, bottom - (vh - viewportMargin))
      );
    };

    const clampToGroupBounds = (x: number, y: number) => ({
      x:
        groupMinX <= groupMaxX
          ? clamp(x, groupMinX, groupMaxX)
          : (groupMinX + groupMaxX) / 2,
      y:
        groupMinY <= groupMaxY
          ? clamp(y, groupMinY, groupMaxY)
          : (groupMinY + groupMaxY) / 2,
    });

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
      newX = clamp(newX, minX, maxX);
      newY = clamp(newY, minY, maxY);

      const landX = homeLeft + newX;
      const landY = homeTop + newY;
      const inForbidden =
        landX + btnW > forbiddenLeft &&
        landX < forbiddenRight &&
        landY + btnH > forbiddenTop &&
        landY < forbiddenBottom;
      const travelDistance = Math.hypot(newX - cur.x, newY - cur.y);
      const homeDistance = Math.hypot(newX, newY);
      const overflow = groupOverflow(newX, newY);
      const groupFits = overflow === 0;
      const hasMeaningfulDistance =
        travelDistance >= minTravelDistance && homeDistance >= minHomeDistance;
      const score =
        (groupFits ? 10000 : 0) +
        (hasMeaningfulDistance ? 5000 : 0) +
        travelDistance +
        homeDistance -
        overflow * 20 -
        (inForbidden ? minTravelDistance + minHomeDistance : 0);

      if (score > bestScore) {
        bestScore = score;
        bestX = newX;
        bestY = newY;
      }

      attempts++;
      if (
        groupFits &&
        !inForbidden &&
        hasMeaningfulDistance
      ) {
        break;
      }
    } while (attempts < 80);

    if (attempts >= 80) {
      newX = bestX;
      newY = bestY;
    }

    const clampedGroupOffset = clampToGroupBounds(newX, newY);
    newX = clampedGroupOffset.x;
    newY = clampedGroupOffset.y;

    currentOffset.current = { x: newX, y: newY };
    setOffset({ x: newX, y: newY });
  }, [maxDodges, messages]);

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
            <div ref={bubbleRef}>
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
