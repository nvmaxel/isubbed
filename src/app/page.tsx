"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Room from "@/components/Room";
import QuestionView from "@/components/QuestionView";
import WelcomeView from "@/components/WelcomeView";
import HonestView from "@/components/HonestView";

type AppState = "question" | "welcome" | "honest";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("question");

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Room>
        <AnimatePresence mode="wait">
          {appState === "question" && (
            <QuestionView
              key="question"
              onYes={() => setAppState("welcome")}
              onNo={() => setAppState("honest")}
            />
          )}
          {appState === "welcome" && <WelcomeView key="welcome" />}
          {appState === "honest" && <HonestView key="honest" />}
        </AnimatePresence>
      </Room>
    </div>
  );
}
