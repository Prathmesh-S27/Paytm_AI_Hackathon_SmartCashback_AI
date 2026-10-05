import type { Metadata } from "next";
import "./globals.css";
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: "Cashback MVP",
  description: "Smart Cashback, Hyperlocal Rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-50 min-h-screen flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
