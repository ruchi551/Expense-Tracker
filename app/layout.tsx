import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import AIChatbot from "./components/AIChatbot";
import SessionWrapper from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your expenses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Navbar />
          {children}
          <AIChatbot />
        </SessionWrapper>
      </body>
    </html>
  );
}