import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "./Components/Header";
import AuthChecker from "./Components/AuthChecker";
import { Providers } from "../lib/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Технополис - Найди работу мечты",
  description: "Платформа нового поколения для поиска работы. Тысячи актуальных вакансий, умный поиск по навыкам и персональные рекомендации от ИИ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <AuthChecker />
          <Header />
          <main style={{ paddingTop: '60px' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
