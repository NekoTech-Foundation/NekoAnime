
import type { Metadata } from "next";
import { inter, caveat, manrope } from "@/lib/fonts";
import "./globals.css";
// import { Sidebar } from "@/components/layout/sidebar"; // Replaced by CSGOLayout
import CSGOLayout from "@/components/theme-csgo/csgo-layout";
import { Footer } from "@/components/layout/footer";
import { NotificationManager } from "@/components/notification/notification-manager";

export const metadata: Metadata = {
  title: "NekoAnime - Xem Anime Online",
  description: "Trải nghiệm xem anime phong cách mới",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${caveat.variable} ${manrope.variable} font-sans antialiased min-h-screen flex selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <NotificationManager />
        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <CSGOLayout>
            {children}
            <Footer />
        </CSGOLayout>
      </body>
    </html>
  );
}
