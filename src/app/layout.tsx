import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css";
import AOSInitializer from "@/components/AOSInitializer";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CopyCat",
  description: "A workspace for projects and saved values",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable} font-sans antialiased min-h-screen bg-canvas text-ink`}
      >
        <AuthProvider>
          <AOSInitializer>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </AOSInitializer>
        </AuthProvider>
      </body>
    </html>
  );
}
