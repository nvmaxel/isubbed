"use client";

import { motion } from "framer-motion";

const channels = [
  {
    label: "Twitch",
    handle: "@nvmaxel_",
    description: "I stream here",
    url: "https://www.twitch.tv/nvmaxel_",
    avatar: "/assets/twitch-channel.png",
  },
  {
    label: "YouTube",
    handle: "@axelnvm",
    description: "I post less here",
    url: "https://youtube.com/@axelnvm",
    avatar: "/assets/main-channel.png",
  },
  {
    label: "More YouTube",
    handle: "@nvmaxel",
    description: "I post more here",
    url: "https://youtube.com/@nvmaxel",
    avatar: "/assets/seccond-channel.png",
  },
];

export default function HonestView() {
  return (
    <motion.div
      className="relative -top-10 flex flex-col items-center gap-3 md:gap-5 w-full max-w-xl px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="flex justify-center w-full text-center">
        <p className="max-w-[390px] text-base md:text-lg font-semibold italic text-white/90 leading-relaxed">
          Don&apos;t worry about it, here are my channels if you change your mind:
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {channels.map((channel) => (
          <div key={channel.handle} className="flex flex-col gap-2">
            <p className="text-sm font-medium italic text-white/90">
              {channel.label}
            </p>
            <a
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
          </div>
        ))}
      </div>
    </motion.div>
  );
}
