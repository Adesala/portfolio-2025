import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageAnimatePresence from "./components/PageAnimations/PageAnimatePresence";
import Link from "next/link";




export const metadata = {
  title: "Interactive Portfolio",
  description: "Developed with love",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
       
        <PageAnimatePresence>
        <Link href="/">
        <div className="homeBtn">
          <p>ADEOLA TCHAOU</p>
        </div>
        </Link>
        
        {children}
        </PageAnimatePresence>
      </body>
    </html>
  );
}
