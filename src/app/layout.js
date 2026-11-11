import { Suspense } from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AbhiiKhula | Take Token • Skip Queue • Save Time",
  description: "Check live store availability, skip physical lines with digital virtual tokens, and save precious waiting time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-[#0d2238] flex flex-col antialiased selection:bg-[#ff7300] selection:text-white">
        
        {/* Ambient Warm Golden & Navy Background Orbs */}
        <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-10 left-1/4 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[130px] pointer-events-none -z-10"></div>

        <Suspense fallback={<div className="h-20 bg-white/95 border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:pb-20">
          <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading platform...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="hidden md:block bg-[#091728] border-t border-slate-800 py-12 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/abhiikhula-logo.jpg" alt="AbhiiKhula" className="h-9 w-auto rounded-lg object-contain bg-white p-0.5" />
              <div>
                <span className="font-black text-white text-base">Abhii<span className="text-[#ff7300]">Khula</span></span>
                <p className="text-slate-400 text-[11px] font-medium">Take Token • Skip Queue • Save Time</p>
              </div>
            </div>
            <p className="text-slate-500 font-medium">
              Official Navy & Electric Orange Brand Identity • Lucknow Pilot Active
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
