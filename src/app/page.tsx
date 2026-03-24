"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Room from "@/components/Room";
import QuestionView from "@/components/QuestionView";
import WelcomeView from "@/components/WelcomeView";
import HonestView from "@/components/HonestView";

type AppState = "question" | "welcome" | "honest";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("question");

  const navigate = useCallback((state: AppState) => {
    window.history.pushState({ state }, "", `/${state === "question" ? "" : state}`);
    setAppState(state);
  }, []);

  useEffect(() => {
    // Replace current entry so back from "question" exits the site
    window.history.replaceState({ state: "question" }, "", "/");

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state?.state as AppState | undefined;
      setAppState(state ?? "question");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Room>
        <AnimatePresence mode="wait">
          {appState === "question" && (
            <QuestionView
              key="question"
              onYes={() => navigate("welcome")}
              onNo={() => navigate("honest")}
            />
          )}
          {appState === "welcome" && <WelcomeView key="welcome" />}
          {appState === "honest" && <HonestView key="honest" />}
        </AnimatePresence>
      </Room>
    </div>
  );
}
