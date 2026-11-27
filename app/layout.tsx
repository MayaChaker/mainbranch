import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

const newsreader = localFont({
  variable: "--font-newsreader",
  src: [
    { path: "./fonts/newsreader.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-italic.woff2", weight: "400", style: "italic" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  src: "./fonts/inter.woff2",
  weight: "400 500",
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains-mono",
  src: "./fonts/jetbrains-mono.woff2",
  weight: "400",
});

export const metadata: Metadata = {
  title: "MainBranch — Where developers branch out.",
  description:
    "A developer community platform: discover communities, publish technical posts, and build your public profile.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
