import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sạch sẽ • Chất lượng • Bền vững • Toàn cầu >> Nông sản Sạch | Sạch sẽ • Chất lượng • Bền vững • Toàn cầu",
  description: "Chuyên cung cấp các sản phẩm nông sản sạch, trái cây xuất khẩu, hạt dinh dưỡng và nông sản hữu cơ chất lượng cao đạt tiêu chuẩn toàn cầu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} antialiased`}
    >
      <body className="min-h-screen bg-background font-body text-foreground">
        {children}
      </body>
    </html>
  );
}
