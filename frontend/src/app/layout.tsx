import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, Newspaper, MessageSquare, Users, BarChart3 } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "渋谷共創ダッシュボード",
  description: "渋谷区の共創ダッシュボード - ニュース収集からコミュニティ形成、KPI生成まで",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "渋谷共創",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <div className="min-h-screen flex flex-col">
          {/* モバイルヘッダー */}
          <header className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <h1 className="text-lg font-bold text-gray-800 text-center">
              渋谷共創ダッシュボード
            </h1>
          </header>

          <div className="flex flex-1">
            {/* デスクトップサイドバー */}
            <nav className="hidden md:flex w-64 bg-white shadow-lg flex-col">
              <div className="p-6">
                <h1 className="text-xl font-bold text-gray-800">
                  渋谷共創ダッシュボード
                </h1>
              </div>
              
              <div className="px-4 space-y-2 flex-1">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Home size={20} />
                  <span>ホーム</span>
                </Link>
                
                <Link
                  href="/news"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Newspaper size={20} />
                  <span>ニュース</span>
                </Link>
                
                <Link
                  href="/comments"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare size={20} />
                  <span>コメント</span>
                </Link>
                
                <Link
                  href="/communities"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Users size={20} />
                  <span>コミュニティ</span>
                </Link>
                
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 size={20} />
                  <span>ダッシュボード</span>
                </Link>
              </div>
            </nav>

            {/* メインコンテンツ */}
            <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
              {children}
            </main>
          </div>

          {/* モバイルボトムナビゲーション */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
            <div className="flex justify-around">
              <Link
                href="/"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors min-w-0"
              >
                <Home size={20} />
                <span className="text-xs mt-1 truncate">ホーム</span>
              </Link>
              
              <Link
                href="/news"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors min-w-0"
              >
                <Newspaper size={20} />
                <span className="text-xs mt-1 truncate">ニュース</span>
              </Link>
              
              <Link
                href="/comments"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors min-w-0"
              >
                <MessageSquare size={20} />
                <span className="text-xs mt-1 truncate">コメント</span>
              </Link>
              
              <Link
                href="/communities"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors min-w-0"
              >
                <Users size={20} />
                <span className="text-xs mt-1 truncate">コミュニティ</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors min-w-0"
              >
                <BarChart3 size={20} />
                <span className="text-xs mt-1 truncate">ダッシュボード</span>
              </Link>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
