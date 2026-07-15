import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import Header from "@/components/Header";
import SearchOverlay from "@/components/SearchOverlay";
import CartDrawer from "@/components/CartDrawer";
import CampaignEngine from "@/components/campaigns/CampaignEngine";
import TrafficTracker from "@/components/TrafficTracker";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HOQ | Premium Luxury Women's Fashion",
  description: "Redefining Modern Femininity. Explore our collection of premium cashmere, organic linen tailoring, and minimalist accessories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-primary">
        <StoreProvider>
          <TrafficTracker />
          <Header />
          <SearchOverlay />
          <CartDrawer />
          <main className="flex-1">
            {children}
            <CampaignEngine />
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
