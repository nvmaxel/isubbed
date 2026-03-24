"use client";

import { motion } from "framer-motion";

export default function WelcomeView() {
  // Replace with your unlisted video ID
  const videoId = "dQw4w9WgXcQ";

  return (
    <motion.div
      className="flex flex-col items-center gap-6 md:gap-10 w-full max-w-2xl px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight">
        WELCOME
      </h1>

      <div className="w-full aspect-video bg-white rounded-sm overflow-hidden shadow-2xl">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Welcome video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}
