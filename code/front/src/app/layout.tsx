import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthGuard } from "@/components/AuthGuard";
import "./globals.css";

const headingFont = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biblioo",
  description: "Organize, descubra e compartilhe histórias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}>
          <AuthGuard>{children}</AuthGuard>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
