import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pranay Kakkar - Computer Science Student",
  description: "Personal portfolio website of Pranay Kakkar, a Computer Science student from South Windsor, CT. Explore my projects, skills, and get in touch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
