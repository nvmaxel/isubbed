"use client";

import { motion } from "framer-motion";
import DodgeButton from "./DodgeButton";

interface QuestionViewProps {
  onYes: () => void;
  onNo: () => void;
}

export default function QuestionView({ onYes, onNo }: QuestionViewProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8 md:gap-12 w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <h1 className="text-lg md:text-2xl font-medium text-white/80 tracking-wide">
        Did you subscribe to Axel?
      </h1>

      <div className="flex items-center gap-16 md:gap-24">
        <button
          onClick={onYes}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white hover:scale-110 transition-transform duration-200 cursor-pointer"
        >
          yes
        </button>

        <DodgeButton onCaught={onNo} />
      </div>
    </motion.div>
  );
}
