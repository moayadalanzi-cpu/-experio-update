import "./globals.css";
import Header from "../components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">
        <Header />

        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>

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
