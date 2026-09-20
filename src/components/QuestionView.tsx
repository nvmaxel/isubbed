"use client";

import { motion } from "framer-motion";

interface QuestionViewProps {
  onYes: () => void;
  onNo: () => void;
}

export default function QuestionView({ onYes, onNo }: QuestionViewProps) {
  return (
    <motion.div
      className="relative -top-10 flex flex-col items-center gap-4 md:gap-6 w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <h1 className="text-lg md:text-2xl font-medium text-white tracking-wide">
        Did you sub to Axel?
      </h1>

      <div className="flex w-full items-center justify-center gap-16 md:gap-24">
        <button
          onClick={onYes}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white hover:scale-110 transition-transform duration-200 cursor-pointer"
        >
          yes
        </button>

        <button
          onClick={onNo}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white hover:scale-110 transition-transform duration-200 cursor-pointer"
        >
          no
        </button>
      </div>
    </motion.div>
  );
}
