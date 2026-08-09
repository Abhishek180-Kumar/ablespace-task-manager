import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider, noFlashThemeScript } from "@/lib/theme";
import { ConfirmProvider } from "@/lib/confirm";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Professional task management system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}