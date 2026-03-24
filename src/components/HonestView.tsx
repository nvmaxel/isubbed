"use client";

import { motion } from "framer-motion";

const channels = [
  {
    handle: "@axelnvm",
    description:
      "My main channel where the videos are a bit more tryhard.",
    url: "https://youtube.com/@axelnvm",
    avatar: "/assets/main-channel.png",
  },
  {
    handle: "@nvmaxel",
    description:
      "My second channel where I post playthroughs, irl content and stuff.",
    url: "https://youtube.com/@nvmaxel",
    avatar: "/assets/seccond-channel.png",
  },
];

export default function HonestView() {
  return (
    <motion.div
      className="flex flex-col items-center gap-8 md:gap-10 w-full max-w-xl px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="text-center space-y-4">
        <p className="text-base md:text-lg font-semibold italic text-white/90 leading-relaxed">
          Ah alright don&apos;t worry about it, At least you&apos;re being
          honest and that&apos;s cool. I think the world would be a better place
          if more people were honest.
        </p>
        <p className="text-base md:text-lg font-semibold italic text-white/90 leading-relaxed">
          Anyway, here are my channels if you change your mind and want to
          subscribe:
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {channels.map((channel) => (
          <a
            key={channel.handle}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <img
              src={channel.avatar}
              alt={channel.handle}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
            <div>
              <p className="font-bold text-base md:text-lg">
                {channel.handle}
              </p>
              <p className="text-sm text-white/70">{channel.description}</p>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
