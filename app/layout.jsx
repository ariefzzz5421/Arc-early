import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "Arc Early — live memecoins, ecosystem & Arc mainnet watch",
    template: "%s · Arc Early",
  },
  description:
    "Live RadarDex community-token data, fail-closed Arc mainnet bridge status, official ecosystem directory, testnet stream and sourced network updates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
