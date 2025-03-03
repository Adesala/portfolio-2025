import { Wallpoet, Oswald } from "next/font/google";
import "./globals.css";
import PageAnimatePresence from "./components/PageAnimations/PageAnimatePresence";
import Link from "next/link";

 const wallpoet = Wallpoet({   weight: '400', // Cette police n'a qu'un seul poids
subsets: ['latin'],
display: 'swap',})

 const oswald = Oswald({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})


export const metadata = {
  title: "Interactive Portfolio",
  description: "Developed with love",
};




export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${wallpoet.className} ${oswald.classNAme} antialiased`}
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
