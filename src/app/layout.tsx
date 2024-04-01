import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import background from "../../public/background.jpg";

const lato = Lato({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"] });

export const metadata: Metadata = {
  title: "Realtime Chat App",
  description: "",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={lato.className}>
        <div className="relative w-full">
          <div className="absolute -z-10 w-full">
            <Image src={background} alt="Background Image" className="w-screen h-screen object-cover" priority></Image>
          </div>
        </div>
        <div>{children}</div>
      </body>
    </html>
  );
};

export default RootLayout;
