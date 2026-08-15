import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Barlow_Condensed, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Frame & Roll — Bikepacking & Adventure Bags",
    template: "%s | Frame & Roll",
  },
  description:
    "Frame bags, handlebar rolls, seat packs, and panniers for gravel and adventure riding. Ask the Pack Guide anything about our bags.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#e4570f",
              colorForeground: "#1c2a21",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
