import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tech Intelligence Digest",
  description: "Aggregates and summarizes AI, CS, UI/UX news",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Tech Intelligence Digest</h1>
            <a className="text-sm text-blue-600 hover:underline" href="/">Dashboard</a>
          </div>
        </header>
        <main className="container py-6 space-y-6">{children}</main>
        <footer className="border-t">
          <div className="container py-6 text-sm text-gray-500">? {new Date().getFullYear()} Tech Intelligence Digest</div>
        </footer>
      </body>
    </html>
  );
}
