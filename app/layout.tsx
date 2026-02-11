import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Experio",
  description: "Share experiences in Travel, Work, and Health.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              Experio
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                Home
              </Link>

              <Link
                href="/new"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium"
              >
                + New Post
              </Link>
            </nav>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-10">{children}</div>

        <footer className="border-t border-white/10 mt-12">
          <div className="max-w-5xl mx-auto px-6 py-6 text-white/40 text-sm flex justify-between">
            <span>© 2026 Experio</span>
            <span>Built for real experiences.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
