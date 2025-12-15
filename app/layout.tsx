import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibe Vetting",
  description: "Vibe vetting foundation site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
