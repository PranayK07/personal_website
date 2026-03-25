import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pranay Kakkar",
  description: "Personal portfolio website of Pranay Kakkar, a Computer Science student from Connecticut. Explore my projects, skills, and get in touch.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="antialiased font-body" suppressHydrationWarning={true}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
