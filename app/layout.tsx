// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Raleway, Aboreto } from "next/font/google";
import Providers from "./providers";
import { cookies } from "next/headers"; // ⬅️ keep this

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-raleway",
  display: "swap",
});
const aboreto = Aboreto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-aboreto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ASR Aviation",
  description: "Premium Private Jet Charter Services",
};

// ⬇️ make this async so we can await cookies()
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser: any | null = null;

  try {
    // ⬇️ await cookies() because in your TS types it returns a Promise
    const jar = await cookies();
    const raw = jar.get("asr_user")?.value;
    if (raw) initialUser = JSON.parse(decodeURIComponent(raw));
  } catch {
    // ignore parse / absence
  }

  return (
    <html lang="en" className={`${raleway.variable} ${aboreto.variable}`}>
      <body className="font-sans bg-white text-gray-900">
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
