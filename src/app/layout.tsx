import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Meteors } from "@/components/ui/Meteors";
import Providers from "@/components/Providers";

const lato = Raleway({ subsets: ["latin"], weight: ["100", "300", "400", "700", "900"] });

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
        <Providers>
          <div className="relative">
            <div className="absolute w-screen overflow-hidden h-screen">
              <Meteors number={20} />
            </div>
          </div>
          <div className="absolute -left-40 top-1/2 -translate-y-1/2 transform w-96 h-full bg-[#30d5c8] rounded-full blur-3xl bg-opacity-10"></div>
          <div className="absolute -right-40 top-1/2 -translate-y-1/2 transform w-96 h-full bg-[#ff007f] rounded-full blur-3xl bg-opacity-10"></div>
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-full h-96 bg-[#a020f0] rounded-full blur-3xl bg-opacity-10"></div>
          <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-full h-96 bg-[#16a34a] rounded-full blur-3xl bg-opacity-10"></div>
          <div className="size-full">{children}</div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
