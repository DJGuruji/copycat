import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import "aos/dist/aos.css"; // AOS styles
import AOSInitializer from "@/components/AOSInitializer";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

const themeScript = `(function(){try{var t=localStorage.getItem('copycat-theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CopyCat",
  description: "A light workspace for projects and saved values",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${ibmPlexMono.variable} font-sans antialiased min-h-screen bg-canvas text-ink`}
      >
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
