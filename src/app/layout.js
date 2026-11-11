import { Suspense } from 'react';
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "AbhiiKhula | Hyperlocal Live Availability & Virtual Queue Platform",
  description: "Check live store availability, current crowd status, and book digital queue tokens from home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f1f5f9] text-[#0c1e38] flex flex-col antialiased selection:bg-[#16a34a] selection:text-white">
        
        {/* Ambient Subtle Green & Navy Glow in the background */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-[140px] pointer-events-none -z-10 animate-soft-float"></div>
        <div className="fixed bottom-10 right-1/4 w-[550px] h-[550px] bg-slate-200/70 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <Suspense fallback={<div className="h-20 bg-white/90 border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:pb-20">
          <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading platform...</div>}>
            {children}
          </Suspense>
        </main>

        <footer className="hidden md:block bg-[#09172c] border-t border-slate-800 py-10 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-white text-base">Abhii<span className="text-[#22c55e]">Khula</span></span>
              <span>— Hyperlocal Live Availability & Queue Architecture (AKH-BRD-001)</span>
            </div>
            <p className="text-slate-400 font-medium">
              Emerald Forest & Deep Navy Brand Identity • Lucknow Pilot Live
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
