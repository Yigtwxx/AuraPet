"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import ApolloClientProvider from "./apollo-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <MotionConfig reducedMotion="user">
        <ApolloClientProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border-strong)",
                color: "var(--color-text-primary)",
              },
              className: "!rounded-xl !shadow-lg",
            }}
            richColors
            closeButton
          />
        </ApolloClientProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
