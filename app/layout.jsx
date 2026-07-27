import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "Arc Early — screener, bridge & mainnet watch for Circle's Arc L1",
    template: "%s · Arc Early",
  },
  description:
    "Early tooling for Circle's Arc blockchain: sample token screener, testnet-safe USDC route planner, live Arc Testnet stream, ecosystem directory and network updates.",
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
