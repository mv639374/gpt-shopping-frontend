import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { StatusIndicator } from "@/components/StatusIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GPT Shopping Analytics",
  description: "AEO and GEO Dashboard for ChatGPT Product Tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <StatusIndicator />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
