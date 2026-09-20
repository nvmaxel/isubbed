"use client";

import { useRouter } from "next/navigation";
import QuestionView from "@/components/QuestionView";

export default function Home() {
  const router = useRouter();

  return (
    <QuestionView
      onYes={() => router.push("/yes")}
      onNo={() => router.push("/no")}
    />
  );
}
