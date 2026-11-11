import { Suspense } from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";
import OfficialBrandLogo from "@/components/OfficialBrandLogo";

export const metadata = {
  title: "AbhiiKhula | Skip the Wait. Own Your Time.",
  description: "Book your token online, track your turn live, and visit when it's your time. The modern hyperlocal queue management platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3F1E9] text-[#283B3D] flex flex-col antialiased selection:bg-[#176B65] selection:text-white">
        
        {/* Soft Background Warm Tones */}
        <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#DCE9E3]/50 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-10 left-1/4 w-[500px] h-[500px] bg-[#176B65]/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>

        <Suspense fallback={<div className="h-20 bg-[#F3F1E9] border-b border-[#DCE9E3]" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 w-full mx-auto pb-28 md:pb-16">
          <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-[#176B65]">Loading AbhiiKhula...</div>}>
            {children}
          </Suspense>
        </main>

        {/* Footer with exact Official Logo Graphic (replacing old hindi badge) */}
        <footer className="bg-[#283B3D] text-[#DCE9E3] border-t border-slate-700/50 py-14 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-700/60 inline-flex items-center">
                <OfficialBrandLogo height={42} animate={false} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-semibold text-xs">
              <a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="/#shops" className="hover:text-white transition-colors">Explore Shops</a>
              <a href="/tokens" className="hover:text-white transition-colors">My Tokens</a>
              <a href="/merchant" className="hover:text-white transition-colors text-slate-400">Store Partner Login 🔒</a>
            </div>

            <p className="text-slate-400 font-medium">
              © 2026 AbhiiKhula Platform. Lucknow Pilot Live.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
