import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#075C32",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://floranet.org"),
  title: {
    default: "FloraNet | Autonomous AI Agriculture & BRICS Agronomy Platform",
    template: "%s | FloraNet",
  },
  description: "Autonomous agricultural intelligence, 3D digital twin farm monitoring, Sentinel-2 multispectral NDVI radar, and regional BRICS commodity arbitrage.",
  keywords: [
    "precision agriculture",
    "BRICS agronomy",
    "digital twin farm",
    "Sentinel-2 NDVI",
    "Jeevamrutha",
    "smart LoRa irrigation",
    "agricultural AI",
    "Digital Public Goods",
    "mandi commodity prices",
  ],
  authors: [{ name: "FloraNet Foundation", url: "https://floranet.org" }],
  creator: "FloraNet Foundation",
  publisher: "FloraNet DPG Node",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FloraNet",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://floranet.org",
    title: "FloraNet | Autonomous AI Agriculture & BRICS Agronomy Platform",
    description: "Autonomous agricultural intelligence, 3D digital twin farm monitoring, Sentinel-2 multispectral NDVI radar, and regional BRICS commodity arbitrage.",
    siteName: "FloraNet",
    images: [
      {
        url: "/images/landing/hero_farm_isometric.jpg",
        width: 1200,
        height: 630,
        alt: "FloraNet Autonomous Farm System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FloraNet | Autonomous AI Agriculture & BRICS Agronomy Platform",
    description: "Autonomous agricultural intelligence, 3D digital twin farm monitoring, Sentinel-2 multispectral NDVI radar, and regional BRICS commodity arbitrage.",
    creator: "@floranet_dpg",
    images: ["/images/landing/hero_farm_isometric.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FloraNet",
  applicationCategory: "AgriculturalApplication",
  operatingSystem: "Web, Android, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: "Autonomous AI agriculture, 3D digital twin farm monitoring, multispectral Sentinel-2 NDVI radar, and regional BRICS commodity arbitrage.",
  author: {
    "@type": "Organization",
    name: "FloraNet Foundation",
    url: "https://floranet.org",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <head>
        <script
          id="floranet-schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F9F7] text-[#102A20]">
        <Providers>
          <ServiceWorkerRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
