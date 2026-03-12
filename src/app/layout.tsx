import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ThemeFamilyProvider } from "@/components/layout/ThemeFamilyProvider";
import { I18nProvider } from "@/components/layout/I18nProvider";
import { AppShell } from "@/components/layout/AppShell";
import { getAllThemeFamilies, getThemeFamilyMetas } from "@/lib/theme/loader";
import { renderThemeFamilyCSS } from "@/lib/theme/render-css";
import { AppearanceProvider } from "@/components/layout/AppearanceProvider";
import { FONT_SIZES, DEFAULT_FONT_SIZE, APPEARANCE_STORAGE_KEY } from "@/lib/appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodePilot",
  description: "A desktop GUI for Claude Code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const families = getAllThemeFamilies();
  const familiesMeta = getThemeFamilyMetas();
  const themeFamilyCSS = renderThemeFamilyCSS(families);
  const validIds = families.map((f) => f.id);
  const fontSizePxMap = JSON.stringify(
    Object.fromEntries(Object.entries(FONT_SIZES).map(([k, v]) => [k, v.px]))
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: set data-theme-family from localStorage, validate against known IDs */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var v=${JSON.stringify(validIds)};var f=localStorage.getItem('codepilot_theme_family')||'default';if(v.indexOf(f)<0)f='default';document.documentElement.setAttribute('data-theme-family',f)}catch(e){}})();` }} />
        {/* Anti-FOUC: set font-size from localStorage before hydration.
            Key and px map generated from @/lib/appearance — no hardcoded values. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem(${JSON.stringify(APPEARANCE_STORAGE_KEY)});var m=${fontSizePxMap};var p=m[s]||${FONT_SIZES[DEFAULT_FONT_SIZE].px};document.documentElement.style.fontSize=p+'px'}catch(e){}})();` }} />
        <style id="theme-family-vars" dangerouslySetInnerHTML={{ __html: themeFamilyCSS }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ThemeFamilyProvider families={familiesMeta}>
            <AppearanceProvider>
              <I18nProvider>
                <AppShell>{children}</AppShell>
              </I18nProvider>
            </AppearanceProvider>
          </ThemeFamilyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
