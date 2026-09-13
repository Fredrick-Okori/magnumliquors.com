import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cellar Cart & Express Checkout",
  description:
    "Review your curated fine wine and spirits selection. Climate-controlled 45-minute VIP express delivery across Kampala, Uganda with multiple payment methods.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

