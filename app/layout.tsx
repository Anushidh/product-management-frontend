import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/ui/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Product Management App",
  description: "Full stack machine task",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AppProviders>{children}</AppProviders>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
