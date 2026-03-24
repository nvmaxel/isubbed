import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iSubbed",
  description: "Did you subscribe to Axel?",
  openGraph: {
    title: "iSubbed",
    description: "Did you subscribe to Axel?",
    siteName: "iSubbed",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full overflow-hidden bg-[#1a0a0a] text-white font-sans select-none">
        {children}
      </body>
    </html>
  );
}
